"use client";
import { useState, useCallback, useRef } from"react";

interface ChatMessage {
 role: string;
 text: string;
}

interface ChatAction {
 type:"book_appointment" |"schedule_call" |"add_calendar";
 specialty?: string;
 reason?: string;
}

export function useAvatarChat() {
 const [isTalking, setIsTalking] = useState(false);
 const [response, setResponse] = useState("");
 const [loading, setLoading] = useState(false);
 const [actions, setActions] = useState<ChatAction[]>([]);
 const conversationRef = useRef<ChatMessage[]>([]);

 const sendMessage = useCallback(async (userMessage: string) => {
 setLoading(true);
 setActions([]);

 // Track full conversation for context
 conversationRef.current = [
 ...conversationRef.current,
 { role:"user", text: userMessage },
 ];

 try {
 const aiRes = await fetch("/api/chat", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ messages: conversationRef.current }),
 });
 const data = await aiRes.json() as { reply: string; actions?: ChatAction[] };
 const text = data.reply;
 setResponse(text);

 // Track assistant response in conversation
 conversationRef.current = [
 ...conversationRef.current,
 { role:"assistant", text },
 ];

 // Set actions if any
 if (data.actions && data.actions.length > 0) {
 setActions(data.actions);
 }

 // TTS
 try {
 const ttsRes = await fetch("/api/tts", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ text }),
 });
 if (ttsRes.ok) {
 const audioBlob = await ttsRes.blob();
 const audioUrl = URL.createObjectURL(audioBlob);
 const audio = new Audio(audioUrl);
 setIsTalking(true);
 await audio.play();
 audio.onended = () => {
 setIsTalking(false);
 URL.revokeObjectURL(audioUrl);
 };
 }
 } catch (ttsErr) {
 console.error("TTS error (non-fatal):", ttsErr);
 }
 } catch (err) {
 console.error(err);
 setResponse("Sorry, I couldn't connect. Please try again.");
 } finally {
 setLoading(false);
 }
 }, []);

 return { isTalking, response, loading, actions, sendMessage };
}
