"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ChatbotWidget() {
  const [patient, setPatient] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reports, setReports] = useState([]);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  // Read patient from sessionStorage (works on any patient page)
  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (stored?.id) setPatient(stored);
    setMounted(true);
  }, []);

  const welcomeMsg = {
    role: "bot",
    text: `Hello${patient ? ` ${patient.firstName}` : ""}! 👋 I'm your AmritCare AI assistant.\n\n• Analyzing your symptoms\n• Suggesting home remedies\n• Recommending the right doctor\n\nNote: I don't prescribe medicines.\n📎 Upload past reports for better advice!`,
  };

  // Init messages when patient is loaded
  useEffect(() => {
    if (patient) setMessages([{ ...welcomeMsg, text: `Hello ${patient.firstName}! 👋 I'm your AmritCare AI assistant.\n\n• Analyzing your symptoms\n• Suggesting home remedies\n• Recommending the right doctor\n\nNote: I don't prescribe medicines.\n📎 Upload past reports for better advice!` }]);
  }, [patient?.id]);

  // Load history when opened
  useEffect(() => {
    if (!isOpen || !patient?.id || historyLoaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/history?patientId=${patient.id}`);
        const data = await res.json();
        if (data.messages?.length > 0) {
          setMessages((prev) => [prev[0], ...data.messages]);
        }
        if (data.reports) setReports(data.reports);
        setHistoryLoaded(true);
      } catch {
        setHistoryLoaded(true);
      }
    })();
  }, [isOpen, patient?.id, historyLoaded]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const saveHistory = async (allMessages) => {
    if (!patient?.id) return;
    try {
      const toSave = allMessages.filter((_, i) => i > 0);
      await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, messages: toSave }),
      });
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.filter((_, i) => i > 0),
          patientInfo: patient ? { firstName: patient.firstName, age: patient.age, blood: patient.blood } : null,
          patientId: patient?.id,
        }),
      });
      const data = await res.json();
      let replyText = data.reply;
      let bookingSpecialty = null;
      const bookMatch = replyText.match(/\[BOOK_APPOINTMENT:(.*?)\]/);
      if (bookMatch) {
        bookingSpecialty = bookMatch[1].trim();
        replyText = replyText.replace(bookMatch[0], "").trim();
      }

      // Handle AI actions
      if (data.actions?.length) {
        for (const action of data.actions) {
          // Auto-schedule a call at a specific time
          if (action.type === "schedule_call_at" && patient?.id) {
            try {
              const callRes = await fetch("/api/calls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  patientId: patient.id,
                  scheduledAt: new Date(action.datetime).toISOString(),
                  overridePhone: patient.phone || null,
                  overrideName: patient.firstName || null,
                  recurrence: "one-time",
                  notes: "Scheduled via AI chat assistant",
                }),
              });
              const callData = await callRes.json();
              if (callRes.ok) {
                replyText += `\n\n✅ Done! Your call has been scheduled for ${new Date(action.datetime).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}.`;
              } else {
                replyText += `\n\n⚠️ Couldn't schedule the call: ${callData.error || "Unknown error"}.`;
              }
            } catch {
              replyText += "\n\n⚠️ There was an error scheduling your call. Please try manually.";
            }
          }

          // Navigate to a page
          if (action.type === "navigate" && action.path) {
            setTimeout(() => {
              setIsOpen(false);
              router.push(action.path);
            }, 1200); // slight delay so user sees the reply first
            replyText += `\n\n➡️ Redirecting you there now...`;
          }
        }
      }

      const updated = [...newMessages, { role: "bot", text: replyText, bookingSpecialty, rawText: data.reply }];
      setMessages(updated);
      const historyToSave = updated.map((m) => (m.rawText ? { ...m, text: m.rawText } : m));
      saveHistory(historyToSave);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, couldn't connect. Please try again." }]);
    } finally {
      setTyping(false);
    }
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !patient?.id) return;
    setUploadingReport(true);
    try {
      let textContent = await file.text().catch(() => "");
      if (!textContent || textContent.length < 10)
        textContent = `[File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)}KB]`;
      if (textContent.length > 3000) textContent = textContent.substring(0, 3000) + "\n...[truncated]";
      await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, report: { fileName: file.name, content: textContent } }),
      });
      setReports((prev) => [...prev, { fileName: file.name, uploadedAt: new Date() }]);
      setMessages((prev) => [...prev, { role: "bot", text: `📄 Report "${file.name}" uploaded! I'll use this for personalized advice.` }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, couldn't process that file. Try .txt or describe it in chat." }]);
    } finally {
      setUploadingReport(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearChat = async () => {
    setMessages([welcomeMsg]);
    if (patient?.id) {
      try {
        await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ patientId: patient.id, messages: [] }),
        });
      } catch {}
    }
  };

  // Only render after hydration and when a patient is logged in
  if (!mounted || !patient) return null;

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[420px] max-h-[650px] bg-white rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col z-50 overflow-hidden" style={{ animation: "slideUp 0.2s ease" }}>
          {/* Header */}
          <div className="bg-[#064E3B] px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div>
                <h3 className="text-white font-semibold text-[15px]">AmritCare AI</h3>
                <p className="text-white/70 text-xs font-medium">{reports.length > 0 ? `${reports.length} report(s) loaded` : "Online • Ready to help"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleClearChat} title="Clear chat" className="text-white/60 hover:text-white transition-colors text-xs px-2 py-1.5 rounded-lg hover:bg-white/10">🗑️</button>
              <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          {/* Report banner */}
          {reports.length > 0 && (
            <div className="px-4 py-2.5 bg-[#F0FDF4] border-b border-[#D1FAE5] shrink-0">
              <p className="text-xs text-[#059669] font-medium flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                {reports.length} report(s) — AI uses these for personalized advice
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA] min-h-[300px] max-h-[400px]">
            {messages.map((msg, i) => {
              let displayMsg = msg.text;
              let showBookBtn = msg.bookingSpecialty;
              if (!showBookBtn && msg.role === "bot" && displayMsg?.includes("[BOOK_APPOINTMENT:")) {
                const match = displayMsg.match(/\[BOOK_APPOINTMENT:(.*?)\]/);
                if (match) { showBookBtn = match[1].trim(); displayMsg = displayMsg.replace(match[0], "").trim(); }
              }
              return (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-[14px] leading-[1.6] whitespace-pre-line shadow-sm ${msg.role === "user" ? "bg-[#10B981] text-white rounded-br-sm" : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"}`}>
                    {displayMsg}
                  </div>
                  {showBookBtn && (
                    <button className="mt-2 bg-[#10B981] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-[#10B981]/20 hover:bg-[#059669] transition-all flex items-center gap-1.5 ml-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Book {showBookBtn}
                    </button>
                  )}
                </div>
              );
            })}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-[1.25rem] rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100 bg-white shrink-0">
            <div className="flex gap-2">
              <input ref={fileInputRef} type="file" accept=".txt,.csv,.json,.md,.pdf" className="hidden" onChange={handleReportUpload} />
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadingReport} title="Upload medical report" className="bg-gray-50 text-gray-500 w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 hover:text-[#10B981] border border-gray-200 transition-colors disabled:opacity-40 shrink-0">
                {uploadingReport ? "⏳" : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>}
              </button>
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder="Type your message..." className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all text-gray-700 placeholder:text-gray-400" />
              <button onClick={handleSend} disabled={!input.trim() || typing} className="bg-[#10B981] text-white w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#059669] shadow-md shadow-[#10B981]/20 transition-all disabled:opacity-40 disabled:shadow-none shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#10B981] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-50"
          title="Chat with AmritCare AI"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </>
  );
}
