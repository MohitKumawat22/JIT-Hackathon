"use client";

import { useState, useRef, useEffect, useCallback } from"react";
import { AvatarScene } from"@/components/AvatarScene";
import { useAvatarChat } from"@/hooks/useAvatarChat";
import { useVoiceConversation } from"@/hooks/useVoiceConversation";

const LANGUAGES = [
 { code:"en", label:"English", greeting:"Hello! I'm your AI health assistant." },
 { code:"hi", label:"हिन्दी", greeting:"नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूँ।" },
 { code:"es", label:"Español", greeting:"¡Hola! Soy tu asistente de salud con IA." },
];

const DOCTORS = [
 { id: 1, name:"Dr. Priya Sharma", specialty:"Cardiologist", fee:"₹500", avatar:"PS", slots: ["10:00 AM","11:30 AM","2:00 PM","4:30 PM"] },
 { id: 2, name:"Dr. Rajesh Kumar", specialty:"Neurologist", fee:"₹700", avatar:"RK", slots: ["9:00 AM","12:00 PM","3:00 PM"] },
 { id: 3, name:"Dr. Anita Desai", specialty:"Dermatologist", fee:"₹400", avatar:"AD", slots: ["10:30 AM","1:00 PM","3:30 PM","5:00 PM"] },
 { id: 4, name:"Dr. Vikram Singh", specialty:"Orthopedic", fee:"₹600", avatar:"VS", slots: ["9:00 AM","11:00 AM"] },
 { id: 5, name:"Dr. Meera Patel", specialty:"Pediatrician", fee:"₹450", avatar:"MP", slots: ["9:30 AM","11:00 AM","2:30 PM"] },
 { id: 6, name:"Dr. Arjun Mehta", specialty:"General Physician", fee:"₹300", avatar:"AM", slots: ["10:00 AM","12:30 PM","4:00 PM","5:30 PM"] },
];

/* ── ICS Calendar Generator ── */


/* ── Booking Modal ── */
function BookingModal({ doctor, onClose, onConfirm }) {
 const [selectedSlot, setSelectedSlot] = useState(null);
 const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
 return (
 <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] p-4" onClick={onClose}>
 <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 animate-slide-up" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
 <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
 </div>
 <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
 <div className="w-14 h-14 rounded-full bg-[#10B981]/10 flex items-center justify-center">
 <span className="text-[#10B981] font-bold text-lg">{doctor.avatar}</span>
 </div>
 <div>
 <h4 className="font-bold text-gray-900">{doctor.name}</h4>
 <p className="text-sm text-gray-500">{doctor.specialty} • {doctor.fee}</p>
 </div>
 </div>
 <div className="mb-5">
 <label className="block text-sm font-semibold text-gray-700 mb-2">Select Date</label>
 <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981]" />
 </div>
 <div className="mb-8">
 <label className="block text-sm font-semibold text-gray-700 mb-2">Available Slots</label>
 <div className="grid grid-cols-3 gap-2.5">
 {doctor.slots.map((slot) => (
 <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${selectedSlot === slot ?"bg-[#10B981] text-white border-[#10B981] shadow-md" :"bg-white text-gray-600 border-gray-200 hover:border-[#10B981] hover:text-[#10B981]"}`}>{slot}</button>
 ))}
 </div>
 </div>
 <button disabled={!selectedSlot} onClick={() => onConfirm({ doctor, date, slot: selectedSlot })} className="w-full bg-[#10B981] text-white py-3.5 rounded-xl font-bold hover:bg-[#059669] disabled:opacity-40 disabled:cursor-not-allowed shadow-lg">Confirm Appointment</button>
 </div>
 </div>
 );
}

/* ── Schedule Call Modal ── */
function ScheduleCallModal({ reason, onClose, onConfirm }) {
 const [datetime, setDatetime] = useState("");
 const [notes, setNotes] = useState(reason ||"");
 const minDt = new Date(Date.now() + 5 * 60000).toISOString().slice(0, 16);
 return (
 <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-[100] p-4" onClick={onClose}>
 <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 animate-slide-up" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-6">
 <h3 className="text-xl font-bold text-gray-900"> Schedule AI Call</h3>
 <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200">✕</button>
 </div>
 <p className="text-sm text-gray-500 mb-5">AmritCare AI will call you at the scheduled time for a personalized health checkup.</p>
 <div className="mb-4">
 <label className="block text-sm font-semibold text-gray-700 mb-2"> When should we call?</label>
 <input type="datetime-local" value={datetime} min={minDt} onChange={(e) => setDatetime(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50" />
 </div>
 <div className="mb-6">
 <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Notes</label>
 <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="e.g. headache follow-up..." className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50 resize-none" />
 </div>
 <button disabled={!datetime} onClick={() => onConfirm({ scheduledAt: new Date(datetime).toISOString(), notes })} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"> Schedule Call</button>
 </div>
 </div>
 );
}

/* ── Action Buttons ── */
function ActionButtons({ actions, onBook, onCall }) {
 if (!actions || actions.length === 0) return null;
 return (
 <div className="flex flex-wrap gap-2 mt-2 ml-1 animate-slide-up">
 {actions.map((action, i) => {
 if (action.type ==="book_appointment") return (
 <button key={i} onClick={() => onBook(action.specialty)} className="flex items-center gap-1.5 bg-[#10B981] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-[#059669] transition-all"> Book {action.specialty}</button>
 );
 if (action.type ==="schedule_call") return (
 <button key={i} onClick={() => onCall(action.reason)} className="flex items-center gap-1.5 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md hover:bg-emerald-700 transition-all"> Schedule Call</button>
 );
 return null;
 })}
 </div>
 );
}

/* ══════════════════════════════════════════════════════════════
 Main TriageChat Component
 ══════════════════════════════════════════════════════════════ */
export default function TriageChat() {
 const [lang, setLang] = useState("en");
 const [langOpen, setLangOpen] = useState(false);
 const [messages, setMessages] = useState([]);
 const [input, setInput] = useState("");
 const [bookingDoctor, setBookingDoctor] = useState(null);
 const [scheduleCallData, setScheduleCallData] = useState(null);
 const [toast, setToast] = useState("");
 const chatEndRef = useRef(null);
 const inputRef = useRef(null);

 // Text chat hook (for typed messages)
 const { isTalking: avatarTalkingText, response, loading, actions, sendMessage } = useAvatarChat();

 // Voice conversation hook (for mic — continuous 1-to-1 conversation)
 const voice = useVoiceConversation();

 // Avatar talks when either text or voice is speaking
 const avatarTalking = avatarTalkingText || voice.isSpeaking;

 // Add text AI responses to messages
 useEffect(() => {
 if (response) {
 setMessages((prev) => [...prev, { role:"assistant", text: response, actions, time: new Date() }]);
 }
 }, [response, actions]);

 // Add voice transcript messages live
 useEffect(() => {
 if (voice.transcript) {
 setMessages((prev) => [...prev, { role:"user", text: voice.transcript, time: new Date() }]);
 }
 }, [voice.transcript]);

 // Sync voice conversation history into chat messages
 const lastVoiceCountRef = useRef(0);
 useEffect(() => {
 if (!voice.isActive) return;
 const interval = setInterval(() => {
 const history = voice.conversationHistory.current;
 if (history.length > lastVoiceCountRef.current) {
 const newMsgs = history.slice(lastVoiceCountRef.current);
 for (const msg of newMsgs) {
 setMessages((prev) => {
 // Avoid duplicate — check if last message has same text
 const last = prev[prev.length - 1];
 if (last && last.text === msg.text && last.role === (msg.role ==="user" ?"user" :"assistant")) return prev;
 return [...prev, { role: msg.role ==="user" ?"user" :"assistant", text: msg.text, time: new Date() }];
 });
 }
 lastVoiceCountRef.current = history.length;
 }
 }, 500);
 return () => clearInterval(interval);
 }, [voice.isActive, voice.conversationHistory]);

 // Reset voice message counter when voice stops
 useEffect(() => {
 if (!voice.isActive) lastVoiceCountRef.current = 0;
 }, [voice.isActive]);

 const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

 useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, loading]);

 useEffect(() => {
 const l = LANGUAGES.find((lg) => lg.code === lang) || LANGUAGES[0];
 setMessages([{
 role:"assistant",
 text: `${l.greeting}\n\nDescribe your symptoms and I'll help assess your situation and recommend next steps. You can type or use the microphone to speak with me!`,
 time: new Date(),
 }]);
 }, [lang]);

 const handleSend = useCallback((overrideText) => {
 const textToSend = typeof overrideText ==="string" ? overrideText : input;
 const trimmed = textToSend.trim();
 if (!trimmed) return;
 setMessages((prev) => [...prev, { role:"user", text: trimmed, time: new Date() }]);
 setInput("");
 sendMessage(trimmed);
 }, [input, sendMessage]);

 const handleKeyDown = (e) => { if (e.key ==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };

 const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 5000); };

 /* ── Action Handlers ── */
 const handleBookDoctor = async (specialty) => {
 showToast("Finding nearby doctors...");
 const fetchDoctors = async (lat, lng) => {
 try {
 const res = await fetch(`/api/doctors/nearby?lat=${lat}&lng=${lng}&specialty=${encodeURIComponent(specialty)}`);
 const data = await res.json();
 if (data.doctors && data.doctors.length > 0) {
 setBookingDoctor(data.doctors[0]);
 } else {
 // Fallback to hardcoded
 const match = DOCTORS.find((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase())) || DOCTORS[5];
 setBookingDoctor(match);
 }
 } catch (err) {
 console.error("Failed to fetch nearby doctors:", err);
 const match = DOCTORS.find((d) => d.specialty.toLowerCase().includes(specialty.toLowerCase())) || DOCTORS[5];
 setBookingDoctor(match);
 }
 };

 if ("geolocation" in navigator) {
 navigator.geolocation.getCurrentPosition(
 (position) => {
 fetchDoctors(position.coords.latitude, position.coords.longitude);
 },
 (error) => {
 console.warn("Location permission denied or error:", error.message);
 // Default to Central Delhi
 fetchDoctors("28.6139","77.2090");
 },
 { timeout: 5000 }
 );
 } else {
 fetchDoctors("28.6139","77.2090");
 }
 };

 const handleConfirmBooking = async (booking) => {
 setBookingDoctor(null);
 try {
 const patient = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (patient?.id) {
 await fetch("/api/bookings", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 patientId: patient.id,
 facilityName: booking.doctor.name,
 department: booking.doctor.specialty,
 scheduledDate: booking.date,
 scheduledSlot: booking.slot,
 fee: booking.doctor.fee,
 status:"upcoming"
 })
 });
 }
 } catch (err) {
 console.error("Booking sync failed:", err);
 }


 // Trigger WhatsApp Notification
 const patientName = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"{}").name ||"Patient";
 const message = `Hello ${booking.doctor.name},\n\n*New Appointment Booking*\nPatient: ${patientName}\nDate: ${new Date(booking.date).toLocaleDateString("en-IN")}\nTime: ${booking.slot}\n\nPlease confirm this appointment.`;
 const hospitalPhone = booking.doctor.phone ||"919999999999";
 const whatsappUrl = `https://wa.me/${hospitalPhone}?text=${encodeURIComponent(message)}`;
 window.open(whatsappUrl,"_blank");

 setMessages((prev) => [...prev, {
 role:"assistant",
 text: `✅ Appointment booked with ${booking.doctor.name} (${booking.doctor.specialty}) on ${new Date(booking.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} at ${booking.slot}.`,
 time: new Date(),
 }]);
 showToast(`✅ Booked ${booking.doctor.name}`);
 };

 const handleScheduleCall = (reason) => { setScheduleCallData({ reason: reason ||"" }); };

 const handleConfirmCall = async ({ scheduledAt, notes }) => {
 setScheduleCallData(null);
 try {
 const patient = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (patient?.id) {
 await fetch("/api/calls", { method:"POST", headers: {"Content-Type":"application/json" }, body: JSON.stringify({ patientId: patient.id, scheduledAt, notes }) });
 }
 setMessages((prev) => [...prev, {
 role:"assistant",
 text: `✅ Call scheduled for ${new Date(scheduledAt).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit", hour12: true })}.\n\nAmritCare AI will call you at the scheduled time! `,
 time: new Date(),
 }]);
 showToast("✅ AI Health Call scheduled!");
 } catch { showToast("❌ Failed to schedule call."); }
 };



 const formatTime = (date) => date.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });

 /* ── Voice status label ── */
 const voiceStatusLabel = voice.isActive
 ? voice.isListening
 ?"🎙 Listening..."
 : voice.isSpeaking
 ?"🔊 Speaking..."
 :"⏳ Processing..."
 : null;

 return (
 <>
 <div className="flex flex-col lg:flex-row h-full max-h-[calc(100vh-2rem)] w-full max-w-6xl mx-auto gap-4">
 {/* 3D Avatar */}
 <div className="flex-1 glass rounded-2xl p-4 flex flex-col items-center justify-center min-h-[400px] relative">
 <AvatarScene isTalking={avatarTalking} currentMessage={voice.currentMessage} />

 {/* Voice conversation status overlay */}
 {voice.isActive && (
 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in">
 <div className={`px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg ${
 voice.isListening
 ?"bg-red-500 text-white animate-pulse"
 : voice.isSpeaking
 ?"bg-emerald-500 text-white"
 :"bg-gray-700 text-white"
 }`}>
 {voiceStatusLabel}
 </div>
 <button
 onClick={voice.stop}
 className="text-xs text-red-400 hover:text-red-600 bg-white px-3 py-1.5 rounded-full border border-red-200 transition-colors"
 >
 ✕ End Conversation
 </button>
 </div>
 )}
 </div>

 {/* Chat Area */}
 <div className="flex-1 flex flex-col w-full">
 {/* Header */}
 <div className="glass rounded-t-2xl px-5 py-4 flex items-center justify-between border-b-0">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl from-primary to-accent flex items-center justify-center shadow-lg">
 <span className="text-[#0a0f1a] text-lg">🤖</span>
 </div>
 <div>
 <h2 className="text-sm font-semibold">AI Health Triage</h2>
 <div className="flex items-center gap-1.5">
 <span className={`w-2 h-2 rounded-full ${voice.isActive ?"bg-red-400" :"bg-green-400"} animate-pulse`} />
 <span className="text-xs text-text-muted">
 {voice.isActive ?"Voice Active" :"Online"}
 </span>
 </div>
 </div>
 </div>
 <div className="relative">
 <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface hover:bg-surface-hover border border-border hover:border-border-hover transition-all text-sm">
 <span>🌐</span>
 <span className="text-text-secondary">{currentLang.label}</span>
 </button>
 {langOpen && (
 <div className="absolute right-0 top-full mt-2 w-44 glass rounded-xl py-1 z-50 animate-fade-in">
 {LANGUAGES.map((l) => (
 <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-surface-hover text-text-secondary">
 {l.label}
 </button>
 ))}
 </div>
 )}
 </div>
 </div>

 {/* Messages */}
 <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 glass border-t-0 border-b-0 rounded-none bg-[rgba(0,0,0,0.15)] h-[400px]">
 {messages.map((msg, i) => (
 <div key={i} className={`flex flex-col ${msg.role ==="user" ?"items-end" :"items-start"} animate-slide-up`}>
 <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role ==="user" ?"bg-primary/15 border border-primary/20 text-foreground" :"bg-surface border border-border text-foreground"}`}>
 <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</div>
 <p className={`text-xs mt-2 ${msg.role ==="user" ?"text-primary/50" :"text-text-muted"}`}>{formatTime(msg.time)}</p>
 </div>
 {msg.role ==="assistant" && msg.actions && (
 <ActionButtons actions={msg.actions} onBook={handleBookDoctor} onCall={handleScheduleCall} />
 )}
 </div>
 ))}
 {loading && (
 <div className="flex justify-start animate-fade-in">
 <div className="bg-surface border border-border rounded-2xl px-4 py-3">
 <div className="flex items-center gap-1.5">
 <span className="text-xs text-text-muted mr-1">Analyzing</span>
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay:"0ms" }} />
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay:"150ms" }} />
 <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay:"300ms" }} />
 </div>
 </div>
 </div>
 )}
 <div ref={chatEndRef} />
 </div>

 {/* Input */}
 <div className="glass rounded-b-2xl px-4 py-3 border-t-0">
 <div className="flex items-end gap-3">
 {/* Mic Button — toggles voice conversation mode */}
 <button
 onClick={voice.toggle}
 title={voice.isActive ?"Stop voice conversation" :"Start voice conversation"}
 className={`p-3 rounded-xl shrink-0 transition-all relative ${
 voice.isActive
 ?"bg-red-500 text-white shadow-lg shadow-red-500/30"
 :"bg-surface text-text-muted hover:text-primary hover:bg-surface-hover"
 }`}
 >
 {voice.isActive ? (
 <div className="relative">
 <span className="text-lg">🎙</span>
 {/* Pulsing ring */}
 <span className="absolute -inset-1 rounded-xl border-2 border-red-400 animate-ping opacity-50" />
 </div>
 ) : (
 <span className="text-lg">🎤</span>
 )}
 </button>

 <textarea
 ref={inputRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 placeholder={voice.isActive ?"Voice conversation active..." :"Describe your symptoms..."}
 rows={1}
 disabled={voice.isActive}
 className="flex-1 input-field resize-none min-h-[44px] max-h-[120px] py-3 disabled:opacity-50"
 />
 <button
 onClick={() => handleSend(input)}
 disabled={!input.trim() || loading || voice.isActive}
 className="btn-primary px-4 py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
 >
 Send
 </button>
 </div>
 {voice.isActive && (
 <p className="text-xs text-center text-text-muted mt-2 animate-fade-in">
 🎙 Voice mode active — speak naturally for a 1-on-1 conversation with your AI health assistant
 </p>
 )}
 </div>
 </div>
 </div>

 {/* Toast */}
 {toast && (
 <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] bg-white border border-gray-200 shadow-xl rounded-2xl px-6 py-4 text-sm font-medium text-gray-800 animate-slide-up">
 {toast}
 </div>
 )}

 {/* Modals */}
 {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onConfirm={handleConfirmBooking} />}
 {scheduleCallData && <ScheduleCallModal reason={scheduleCallData.reason} onClose={() => setScheduleCallData(null)} onConfirm={handleConfirmCall} />}
 </>
 );
}
