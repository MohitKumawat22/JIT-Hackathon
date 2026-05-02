"use client";
import { useState, useCallback } from "react";

export function useAvatarChat() {
  const [isTalking, setIsTalking] = useState(false);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (userMessage: string) => {
    setLoading(true);
    try {
      const aiRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });
      const { text } = await aiRes.json() as { text: string };
      setResponse(text);

      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const audioBlob = await ttsRes.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      setIsTalking(true);
      await audio.play();
      audio.onended = () => {
        setIsTalking(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isTalking, response, loading, sendMessage };
}
