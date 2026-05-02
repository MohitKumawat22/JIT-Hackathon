"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ScheduleCall from "@/components/patient/ScheduleCall";

const DOCTORS = [
  { id: 1, name: "Dr. Priya Sharma", specialty: "Cardiologist", experience: "12 yrs", rating: 4.8, available: true, fee: "₹500", avatar: "PS", slots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"] },
  { id: 2, name: "Dr. Rajesh Kumar", specialty: "Neurologist", experience: "15 yrs", rating: 4.9, available: true, fee: "₹700", avatar: "RK", slots: ["9:00 AM", "12:00 PM", "3:00 PM"] },
  { id: 3, name: "Dr. Anita Desai", specialty: "Dermatologist", experience: "8 yrs", rating: 4.7, available: true, fee: "₹400", avatar: "AD", slots: ["10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"] },
  { id: 4, name: "Dr. Vikram Singh", specialty: "Orthopedic", experience: "20 yrs", rating: 4.6, available: false, fee: "₹600", avatar: "VS", slots: [] },
  { id: 5, name: "Dr. Meera Patel", specialty: "Pediatrician", experience: "10 yrs", rating: 4.8, available: true, fee: "₹450", avatar: "MP", slots: ["9:30 AM", "11:00 AM", "2:30 PM"] },
  { id: 6, name: "Dr. Arjun Mehta", specialty: "General Physician", experience: "6 yrs", rating: 4.5, available: true, fee: "₹300", avatar: "AM", slots: ["10:00 AM", "12:30 PM", "4:00 PM", "5:30 PM"] },
];

const SPECIALTIES = ["All", "Cardiologist", "Neurologist", "Dermatologist", "Orthopedic", "Pediatrician", "General Physician"];

/* ─── Chatbot Component ─── */
function Chatbot({ isOpen, onClose, patient, onBookRequest }) {
  const welcomeMsg = { role: "bot", text: `Hello${patient ? ` ${patient.firstName}` : ""}! 👋 I'm your AmritCare AI assistant.\n\n• Analyzing your symptoms\n• Suggesting home remedies\n• Recommending the right doctor\n\nNote: I don't prescribe medicines.\n📎 Upload past reports for better advice!` };
  const [messages, setMessages] = useState([welcomeMsg]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [reports, setReports] = useState([]);
  const endRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !patient?.id || historyLoaded) return;
    (async () => {
      try {
        const res = await fetch(`/api/chat/history?patientId=${patient.id}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages([welcomeMsg, ...data.messages]);
        }
        if (data.reports) setReports(data.reports);
        setHistoryLoaded(true);
      } catch (err) {
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
    } catch (err) {}
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

      const updated = [...newMessages, { role: "bot", text: replyText, bookingSpecialty, rawText: data.reply }];
      setMessages(updated);
      
      // Save history with the raw text so it parses again next time
      const historyToSave = updated.map(m => m.rawText ? { ...m, text: m.rawText } : m);
      saveHistory(historyToSave);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, couldn't connect. Please try again." }]);
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
      if (!textContent || textContent.length < 10) {
        textContent = `[File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(1)}KB]`;
      }
      if (textContent.length > 3000) textContent = textContent.substring(0, 3000) + "\n...[truncated]";
      await fetch("/api/chat/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: patient.id, report: { fileName: file.name, content: textContent } }),
      });
      setReports(prev => [...prev, { fileName: file.name, uploadedAt: new Date() }]);
      setMessages(prev => [...prev, { role: "bot", text: `📄 Report "${file.name}" uploaded! I'll use this for personalized advice.` }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, couldn't process that file. Try .txt or describe it in chat." }]);
    } finally {
      setUploadingReport(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClearChat = async () => {
    setMessages([welcomeMsg]);
    if (patient?.id) {
      try {
        await fetch("/api/chat/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ patientId: patient.id, messages: [] }) });
      } catch (err) {}
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[420px] max-h-[650px] bg-white rounded-[1.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 flex flex-col z-50 animate-slide-up overflow-hidden">
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
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="px-4 py-2.5 bg-[#F0FDF4] border-b border-[#D1FAE5] shrink-0">
          <p className="text-xs text-[#059669] font-medium flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            {reports.length} report(s) — AI uses these for personalized advice
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FAFAFA] min-h-[300px] max-h-[400px]">
        {messages.map((msg, i) => {
          let displayMsg = msg.text;
          let showBookBtn = msg.bookingSpecialty;
          
          if (!showBookBtn && msg.role === "bot" && displayMsg.includes("[BOOK_APPOINTMENT:")) {
            const match = displayMsg.match(/\[BOOK_APPOINTMENT:(.*?)\]/);
            if (match) {
              showBookBtn = match[1].trim();
              displayMsg = displayMsg.replace(match[0], "").trim();
            }
          }

          return (
            <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-[14px] leading-[1.6] whitespace-pre-line shadow-sm ${msg.role === "user" ? "bg-[#10B981] text-white rounded-br-sm" : "bg-white text-gray-700 border border-gray-100 rounded-bl-sm"}`}>
                {displayMsg}
              </div>
              {showBookBtn && onBookRequest && (
                <button onClick={() => onBookRequest(showBookBtn)} className="mt-2 bg-[#10B981] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-[#10B981]/20 hover:bg-[#059669] transition-all flex items-center gap-1.5 ml-1">
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
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

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
  );
}

/* ─── Booking Modal ─── */
function BookingModal({ doctor, onClose, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Book Appointment</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
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
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all shadow-sm" />
        </div>
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Available Slots</label>
          <div className="grid grid-cols-3 gap-2.5">
            {doctor.slots.map((slot) => (
              <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${selectedSlot === slot ? "bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20" : "bg-white text-gray-600 border-gray-200 hover:border-[#10B981] hover:text-[#10B981]"}`}>{slot}</button>
            ))}
          </div>
        </div>
        <button disabled={!selectedSlot} onClick={() => onConfirm({ doctor, date, slot: selectedSlot })} className="w-full bg-[#10B981] text-white py-3.5 rounded-xl font-bold hover:bg-[#059669] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#10B981]/20">
          Confirm Appointment
        </button>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function PatientDashboard() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [doctorsList, setDoctorsList] = useState(DOCTORS);

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (!stored?.id) { router.push("/patient/login"); return; }
    setPatient(stored);
  }, [router]);

  useEffect(() => {
    const fetchDoctors = async (lat, lng) => {
      try {
        const res = await fetch(`/api/doctors/nearby?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (data.doctors && data.doctors.length > 0) {
          setDoctorsList(data.doctors);
        }
      } catch (err) {
        console.error("Failed to fetch nearby doctors:", err);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchDoctors(position.coords.latitude, position.coords.longitude),
        (err) => {
          console.warn("Location permission denied or error:", err.message);
          fetchDoctors("28.6139", "77.2090");
        },
        { timeout: 5000 }
      );
    } else {
      fetchDoctors("28.6139", "77.2090");
    }
  }, []);

  useEffect(() => {
    if (!patient?.id) return;
    const fetchBookings = async () => {
      try {
        const res = await fetch(`/api/bookings?patientId=${patient.id}`);
        const data = await res.json();
        if (data.bookings) {
          const formatted = data.bookings.map(b => ({
            id: b._id,
            doctorName: b.facilityName,
            specialty: b.department,
            date: b.scheduledDate || b.createdAt,
            slot: b.scheduledSlot || "",
            fee: b.fee || ""
          }));
          setBookings(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      }
    };
    fetchBookings();
  }, [patient?.id]);

  const filteredDoctors = doctorsList.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "All" || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  const generateICS = (booking) => {
    try {
      const [year, month, day] = booking.date.split("-");
      const [time, period] = booking.slot.split(" ");
      let [hours, minutes] = time.split(":");
      hours = parseInt(hours, 10);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      
      const startDate = new Date(year, month - 1, day, hours, parseInt(minutes, 10));
      const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 min duration

      const formatDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

      const icsData = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `SUMMARY:AmritCare Appointment - ${booking.doctor.name}`,
        `DESCRIPTION:Consultation: ${booking.doctor.specialty}\\nFee: ${booking.doctor.fee}`,
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\n");

      const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", `Appointment_${booking.doctor.name.replace(/ /g, "_")}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to generate calendar file", err);
    }
  };

  const handleConfirmBooking = async (booking) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          facilityName: booking.doctor.name,
          department: booking.doctor.specialty,
          scheduledDate: booking.date,
          scheduledSlot: booking.slot,
          fee: booking.doctor.fee,
          status: "upcoming"
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setBookings(prev => [...prev, { id: data.booking._id, doctorName: booking.doctor.name, specialty: booking.doctor.specialty, date: booking.date, slot: booking.slot, fee: booking.doctor.fee }]);
        setBookingDoctor(null);
        generateICS(booking);
        setSuccessMsg(`Booked ${booking.doctor.name} on ${new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${booking.slot}. Calendar event downloaded!`);
        setTimeout(() => setSuccessMsg(""), 6000);
      } else {
        console.error("Booking failed:", data.error);
        alert("Failed to confirm booking.");
      }
    } catch (err) {
      console.error("Booking request error:", err);
      alert("Error confirming booking.");
    }
  };

  const handleChatBookRequest = (specialtyName) => {
    // Find the best matching doctor
    const match = doctorsList.find(d => d.specialty.toLowerCase().includes(specialtyName.toLowerCase()) && d.available) || doctorsList.find(d => d.available);
    if (match) {
      setBookingDoctor(match);
      setChatOpen(false); // Optionally close chat to show the modal clearly
    }
  };

  const handleLogout = () => { sessionStorage.removeItem("medconnect_patient"); router.push("/"); };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="text-primary font-bold text-xl flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              AmritCare <span className="text-xs font-medium bg-primary/20 px-1.5 py-0.5 rounded-md">AI</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/patient/history" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">History</Link>
            <Link href="/patient/locate" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">Find Hospital</Link>
            <Link href="/patient/triage" className="text-sm text-gray-500 hover:text-primary transition-colors no-underline">AI Triage</Link>
            <div className="w-px h-6 bg-gray-200"></div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <span className="text-primary font-semibold text-xs">{patient.firstName?.[0]}{patient.lastName?.[0]}</span>
              </div>
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, <span className="text-primary">{patient.firstName}</span> 👋</h1>
          <p className="text-gray-500 mt-1">Find a doctor and book your appointment</p>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-slide-up">
            <span className="text-lg">✅</span>{successMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">📅</div>
              <div><p className="text-2xl font-bold text-gray-800">{bookings.length}</p><p className="text-xs text-gray-500">Upcoming Appointments</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">🩺</div>
              <div><p className="text-2xl font-bold text-gray-800">{doctorsList.filter(d => d.available).length}</p><p className="text-xs text-gray-500">Doctors Available</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">🤖</div>
              <div><p className="text-2xl font-bold text-gray-800">24/7</p><p className="text-xs text-gray-500">AI Health Assistant</p></div>
            </div>
          </div>
        </div>

        {/* AI Calling Assistant */}
        <div className="mb-8">
          <ScheduleCall patientId={patient.id} />
        </div>

        {/* Upcoming Bookings */}
        {bookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Your Appointments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">Upcoming</span>
                    <span className="text-xs text-gray-400">{b.fee}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800 text-sm">{b.doctorName}</h3>
                  <p className="text-xs text-gray-500 mb-3">{b.specialty}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>📅 {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    <span>🕐 {b.slot}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Find a Doctor</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors by name or specialty..." className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {SPECIALTIES.map((s) => (
                <button key={s} onClick={() => setSpecialty(s)} className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${specialty === s ? "bg-primary text-white border-primary shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDoctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-lg">{doctor.avatar}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{doctor.name}</h3>
                  <p className="text-sm text-gray-500 truncate">{doctor.specialty}</p>
                  {doctor.address && <p className="text-xs text-gray-400 truncate mt-0.5">{doctor.address}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-gray-500 flex items-center gap-1">⭐ {doctor.rating}</span>
                <span className="text-gray-500">{doctor.experience}</span>
                <span className="font-semibold text-primary">{doctor.fee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doctor.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                  {doctor.available ? "● Available Today" : "● Not Available"}
                </span>
                <button disabled={!doctor.available} onClick={() => setBookingDoctor(doctor)} className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Book Now</button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-16"><p className="text-gray-400 text-sm">No doctors found matching your search.</p></div>
        )}
      </div>

      {/* Chatbot FAB */}
      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </button>
      )}

      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} patient={patient} onBookRequest={handleChatBookRequest} />
      {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onConfirm={handleConfirmBooking} />}
    </div>
  );
}
