"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AvatarScene } from "@/components/AvatarScene";
import { useAvatarChat } from "@/hooks/useAvatarChat";
import { useVoiceInput } from "@/hooks/useVoiceInput";

/* ────────────────────────────────────────────────────────────
   Supported languages
   ──────────────────────────────────────────────────────────── */
const LANGUAGES = [
  { code: "en", label: "English", greeting: "Hello! I'm your AI health assistant." },
  { code: "hi", label: "हिन्दी", greeting: "नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ।" },
  { code: "es", label: "Español", greeting: "¡Hola! Soy tu asistente de salud con IA." },
];

/* ────────────────────────────────────────────────────────────
   Mock Triage Workflow (Fallback for text if needed)
   ──────────────────────────────────────────────────────────── */
function triageWorkflow(userInput, langCode) {
  // Simple fallback for UI testing
  return { text: "I have received your message and analyzing the symptoms...", severity: "info", matchedKeywords: [] };
}

/* ────────────────────────────────────────────────────────────
   Main TriageChat component
   ──────────────────────────────────────────────────────────── */
export default function TriageChat() {
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const { isTalking, response, loading, sendMessage } = useAvatarChat();
  
  // Update messages when AI responds via the voice hook
  useEffect(() => {
    if (response) {
      setMessages((prev) => [...prev, { role: "assistant", text: response, time: new Date() }]);
    }
  }, [response]);

  const { isListening, startListening } = useVoiceInput((text) => {
    if (text) {
      setInput(text);
      // Auto-send when voice input finishes
      handleSend(text);
    }
  });

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const l = LANGUAGES.find((lg) => lg.code === lang) || LANGUAGES[0];
    setMessages([
      {
        role: "assistant",
        text: `${l.greeting}\n\nDescribe your symptoms and I'll help assess your situation and recommend next steps. You can type or use the microphone to speak with me!`,
        severity: "info",
        time: new Date(),
      },
    ]);
  }, [lang]);

  const handleSend = useCallback((overrideText) => {
    const textToSend = typeof overrideText === "string" ? overrideText : input;
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg = { role: "user", text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Send to Claude + TTS Avatar
    sendMessage(trimmed);
  }, [input, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-2rem)] w-full max-w-6xl mx-auto gap-4">
      {/* ── 3D Avatar Area ── */}
      <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center justify-center min-h-[400px]">
        <AvatarScene isTalking={isTalking} />
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 flex flex-col w-full">
        {/* ── Header ── */}
        <div className="glass rounded-t-2xl px-5 py-4 flex items-center justify-between border-b-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-[#0a0f1a] text-lg">🤖</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Health Triage</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs text-text-muted">Online</span>
              </div>
            </div>
          </div>

          {/* Language dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border hover:border-border-hover transition-all text-sm"
            >
              <span>🌐</span>
              <span className="text-text-secondary">{currentLang.label}</span>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 glass rounded-xl py-1 z-50 animate-fade-in">
                {LANGUAGES.map((l) => (
                  <button key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover text-text-secondary">
                    {l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Chat messages ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 glass border-t-0 border-b-0 rounded-none bg-[rgba(0,0,0,0.15)] h-[400px]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-slide-up`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary/15 border border-primary/20 text-foreground"
                  : "bg-surface border border-border text-foreground"
              }`}>
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </div>
                <p className={`text-xs mt-2 ${msg.role === "user" ? "text-primary/50" : "text-text-muted"}`}>
                  {formatTime(msg.time)}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-surface border border-border rounded-2xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-text-muted mr-1">Analyzing</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input area ── */}
        <div className="glass rounded-b-2xl px-4 py-3 border-t-0">
          <div className="flex items-end gap-3">
            <button
              onClick={startListening}
              className={`p-3 rounded-xl shrink-0 transition-colors ${
                isListening ? "bg-red-500 text-white animate-pulse" : "bg-surface text-text-muted hover:text-primary"
              }`}
            >
              🎤
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening..." : "Describe your symptoms..."}
              rows={1}
              className="flex-1 input-field resize-none min-h-[44px] max-h-[120px] py-3"
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || loading}
              className="btn-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
