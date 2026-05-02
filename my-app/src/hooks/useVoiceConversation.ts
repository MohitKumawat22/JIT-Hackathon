"use client";
import { useState, useCallback, useRef } from "react";

/**
 * Continuous voice conversation hook using Deepgram STT + ElevenLabs TTS.
 * Flow: Mic → Deepgram WebSocket (real-time STT) → Groq AI → ElevenLabs TTS → repeat
 */
export function useVoiceConversation() {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentMessage, setCurrentMessage] = useState<{
    audio: HTMLAudioElement;
    lipSync: { mouthCues: { start: number; end: number; value: string }[] };
  } | null>(null);
  const activeRef = useRef(false);
  const conversationRef = useRef<{ role: string; text: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  /** Listen using Deepgram real-time WebSocket */
  const listenWithDeepgram = useCallback((): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!apiKey) {
        // Fallback to browser SpeechRecognition
        return resolve(listenWithBrowser());
      }

      let finalTranscript = "";
      let silenceTimer: ReturnType<typeof setTimeout> | null = null;
      let mediaRecorder: MediaRecorder | null = null;
      let socket: WebSocket | null = null;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setIsListening(true);

        // Connect to Deepgram WebSocket — fast endpointing for snappy conversation
        const dgUrl = `wss://api.deepgram.com/v1/listen?model=nova-2&language=en&smart_format=true&encoding=linear16&sample_rate=16000&channels=1&endpointing=200&utterance_end_ms=800`;
        socket = new WebSocket(dgUrl, ["token", apiKey]);

        socket.onopen = () => {
          // Start sending audio chunks
          const audioContext = new AudioContext({ sampleRate: 16000 });
          const source = audioContext.createMediaStreamSource(stream);
          const processor = audioContext.createScriptProcessor(4096, 1, 1);

          processor.onaudioprocess = (e) => {
            if (socket?.readyState === WebSocket.OPEN) {
              const inputData = e.inputBuffer.getChannelData(0);
              // Convert float32 to int16
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
              }
              socket.send(int16.buffer);
            }
          };

          source.connect(processor);
          processor.connect(audioContext.destination);

          // Store for cleanup
          (socket as any)._audioContext = audioContext;
          (socket as any)._processor = processor;
          (socket as any)._source = source;
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "Results") {
              const alt = data.channel?.alternatives?.[0];
              if (alt?.transcript) {
                if (data.is_final) {
                  finalTranscript += (finalTranscript ? " " : "") + alt.transcript;
                  setTranscript(finalTranscript);
                }

                // Reset silence timer on each result
                if (silenceTimer) clearTimeout(silenceTimer);
                silenceTimer = setTimeout(() => {
                  // Silence detected — finish listening
                  cleanup();
                  resolve(finalTranscript.trim());
                }, 1200);
              }
            }

            // UtteranceEnd event — speaker stopped
            if (data.type === "UtteranceEnd" && finalTranscript.trim()) {
              if (silenceTimer) clearTimeout(silenceTimer);
              cleanup();
              resolve(finalTranscript.trim());
            }
          } catch {}
        };

        socket.onerror = () => {
          cleanup();
          // Fallback to browser
          listenWithBrowser().then(resolve).catch(reject);
        };

        socket.onclose = () => {
          if (!finalTranscript.trim()) {
            // Socket closed without transcript
            setIsListening(false);
          }
        };

        // Auto-timeout after 10 seconds
        const maxTimer = setTimeout(() => {
          cleanup();
          resolve(finalTranscript.trim());
        }, 10000);

        function cleanup() {
          setIsListening(false);
          clearTimeout(maxTimer);
          if (silenceTimer) clearTimeout(silenceTimer);

          // Close audio processing
          try {
            (socket as any)?._processor?.disconnect();
            (socket as any)?._source?.disconnect();
            (socket as any)?._audioContext?.close();
          } catch {}

          // Close WebSocket
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ type: "CloseStream" }));
            socket.close();
          }

          // Stop mic
          stream.getTracks().forEach((t) => t.stop());
          mediaStreamRef.current = null;
        }
      } catch (err) {
        setIsListening(false);
        // Fallback to browser SpeechRecognition
        listenWithBrowser().then(resolve).catch(reject);
      }
    });
  }, []);

  /** Fallback: Browser SpeechRecognition */
  const listenWithBrowser = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") return reject("No window");
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SR) return reject("SpeechRecognition not supported");

      const recognition = new SR();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = (e: any) => {
        setIsListening(false);
        e.error === "no-speech" || e.error === "aborted" ? resolve("") : reject(e.error);
      };
      recognition.onresult = (event: any) => {
        const text = event.results[0]?.[0]?.transcript ?? "";
        setTranscript(text);
        resolve(text);
      };
      recognition.start();
    });
  }, []);

  /** Helper: speak with browser TTS (female voice) */
  const speakWithBrowser = useCallback((text: string): Promise<void> => {
    return new Promise<void>((resolve) => {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));

      // Try to find a female voice
      const pickFemaleVoice = () => {
        const voices = speechSynthesis.getVoices();
        let female = voices.find(v => /zira|samantha|victoria|karen|fiona|hazel/i.test(v.name))
          || voices.find(v => /female|woman|girl/i.test(v.name));
        
        if (!female) {
          // Exclude known male voices (like Microsoft David)
          female = voices.find(v => /en/i.test(v.lang) && !/david|mark|george|guy/i.test(v.name));
        }
        return female || voices[0];
      };

      const voice = pickFemaleVoice();
      if (voice) utterance.voice = voice;
      utterance.pitch = 1.15;
      utterance.rate = 0.95;
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
    });
  }, []);

  /** Speak via ElevenLabs TTS, fallback to browser, generate lip-sync for avatar */
  const speakText = useCallback(async (text: string): Promise<void> => {
    setIsSpeaking(true);
    try {
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!ttsRes.ok) {
        return speakWithBrowser(text);
      }

      const contentType = ttsRes.headers.get("content-type") || "";
      if (!contentType.includes("audio")) {
        return speakWithBrowser(text);
      }

      const audioBlob = await ttsRes.blob();
      if (audioBlob.size < 100) {
        return speakWithBrowser(text);
      }

      // Get lip-sync data
      let lipSync = { mouthCues: [] as { start: number; end: number; value: string }[] };
      try {
        const formData = new FormData();
        formData.append("audio", new Blob([audioBlob], { type: "audio/mpeg" }));
        const lsRes = await fetch("/api/lipsync", { method: "POST", body: formData });
        if (lsRes.ok) lipSync = await lsRes.json();
      } catch { /* use empty lip sync */ }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Set currentMessage for avatar
      setCurrentMessage({ audio, lipSync });

      return new Promise<void>((resolve) => {
        audio.onended = () => {
          setIsSpeaking(false);
          setCurrentMessage(null);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          resolve();
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setCurrentMessage(null);
          URL.revokeObjectURL(audioUrl);
          audioRef.current = null;
          speakWithBrowser(text).then(resolve);
        };
        audio.play().catch(() => {
          setIsSpeaking(false);
          setCurrentMessage(null);
          speakWithBrowser(text).then(resolve);
        });
      });
    } catch {
      return speakWithBrowser(text);
    }
  }, [speakWithBrowser]);

  /** Get AI response from Groq */
  const getAIResponse = useCallback(async (userText: string) => {
    conversationRef.current.push({ role: "user", text: userText });
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationRef.current }),
    });
    const data = await res.json();
    conversationRef.current.push({ role: "assistant", text: data.reply });
    return { reply: data.reply, actions: data.actions || [] };
  }, []);

  /** Main conversation loop */
  const runLoop = useCallback(async () => {
    while (activeRef.current) {
      try {
        const userText = await listenWithDeepgram();
        if (!activeRef.current) break;
        if (!userText.trim()) continue;

        const { reply } = await getAIResponse(userText);
        if (!activeRef.current) break;

        await speakText(reply);
        if (!activeRef.current) break;
      } catch (err) {
        console.error("Voice loop error:", err);
        if (!activeRef.current) break;
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);
  }, [listenWithDeepgram, getAIResponse, speakText]);

  const start = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    setIsActive(true);
    conversationRef.current = [];
    runLoop();
  }, [runLoop]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsActive(false);
    setIsListening(false);
    setIsSpeaking(false);

    // Stop mic stream
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }

    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    speechSynthesis.cancel();
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) stop(); else start();
  }, [start, stop]);

  return {
    isActive, isListening, isSpeaking, transcript,
    currentMessage,
    toggle, start, stop,
    conversationHistory: conversationRef,
  };
}
