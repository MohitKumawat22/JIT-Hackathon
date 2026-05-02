"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import ScheduleCall from "@/components/patient/ScheduleCall";

/* ─── Dummy doctor data (replace with API later) ─── */
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
function Chatbot({ isOpen, onClose, patient }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: `Hello${patient ? ` ${patient.firstName}` : ""}! 👋 I'm your AmritCare AI assistant. I can help you with:\n\n• Analyzing your symptoms\n• Suggesting home remedies\n• Recommending the right doctor\n• General health guidance\n\nNote: I don't prescribe medicines — I focus on natural remedies & doctor referrals.` }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

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
          messages: newMessages,
          patientInfo: patient ? { firstName: patient.firstName, age: patient.age, blood: patient.blood } : null,
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", text: "Sorry, I couldn't connect to the AI service. Please try again or consult a doctor directly." }]);
    } finally {
      setTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-[400px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-slide-up overflow-hidden">
      {/* Chat Header */}
      <div className="bg-primary px-5 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">AmritCare AI</h3>
            <p className="text-white/70 text-xs">Online • Ready to help</p>
          </div>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white transition-colors text-lg">✕</button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 min-h-[300px] max-h-[400px]">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
              msg.role === "user"
                ? "bg-primary text-white rounded-br-md"
                : "bg-white text-gray-700 border border-gray-200 rounded-bl-md shadow-sm"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms..."
            className="flex-1 bg-gray-100 border-0 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 text-gray-700 placeholder:text-gray-400"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="bg-primary text-white px-4 py-2.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Booking Modal ─── */
function BookingModal({ doctor, onClose, onConfirm }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [date, setDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Book Appointment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* Doctor Info */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
          <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
            <span className="text-primary font-bold text-lg">{doctor.avatar}</span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{doctor.name}</h4>
            <p className="text-sm text-gray-500">{doctor.specialty} • {doctor.fee}</p>
          </div>
        </div>

        {/* Date */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">Select Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-2">Available Slots</label>
          <div className="grid grid-cols-3 gap-2">
            {doctor.slots.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all border ${
                  selectedSlot === slot
                    ? "bg-primary text-white border-primary shadow-md"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Confirm Button */}
        <button
          disabled={!selectedSlot}
          onClick={() => onConfirm({ doctor, date, slot: selectedSlot })}
          className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
        >
          Confirm Appointment — {selectedSlot || "Select a slot"}
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

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (!stored?.id) {
      router.push("/patient/login");
      return;
    }
    setPatient(stored);
  }, [router]);

  const filteredDoctors = DOCTORS.filter((d) => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase());
    const matchSpec = specialty === "All" || d.specialty === specialty;
    return matchSearch && matchSpec;
  });

  const handleConfirmBooking = (booking) => {
    setBookings(prev => [...prev, {
      id: Date.now(),
      doctorName: booking.doctor.name,
      specialty: booking.doctor.specialty,
      date: booking.date,
      slot: booking.slot,
      fee: booking.doctor.fee,
    }]);
    setBookingDoctor(null);
    setSuccessMsg(`Appointment booked with ${booking.doctor.name} on ${new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} at ${booking.slot}`);
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("medconnect_patient");
    router.push("/");
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="text-primary font-bold text-xl flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
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
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome back, <span className="text-primary">{patient.firstName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Find a doctor and book your appointment</p>
        </div>

        {/* Success Toast */}
        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-3 animate-slide-up">
            <span className="text-lg">✅</span>
            {successMsg}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00B4D8" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{bookings.length}</p>
                <p className="text-xs text-gray-500">Upcoming Appointments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{DOCTORS.filter(d => d.available).length}</p>
                <p className="text-xs text-gray-500">Doctors Available</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">24/7</p>
                <p className="text-xs text-gray-500">AI Health Assistant</p>
              </div>
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

        {/* Search & Filters */}
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Find a Doctor</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search doctors by name or specialty..."
                className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {SPECIALTIES.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpecialty(s)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${
                    specialty === s
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  {s}
                </button>
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
                  <p className="text-sm text-gray-500">{doctor.specialty}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="text-gray-500 flex items-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  {doctor.rating}
                </span>
                <span className="text-gray-500">{doctor.experience}</span>
                <span className="font-semibold text-primary">{doctor.fee}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  doctor.available ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                }`}>
                  {doctor.available ? "● Available Today" : "● Not Available"}
                </span>
                <button
                  disabled={!doctor.available}
                  onClick={() => setBookingDoctor(doctor)}
                  className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredDoctors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No doctors found matching your search.</p>
          </div>
        )}
      </div>

      {/* Chatbot FAB */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center z-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      )}

      {/* Chatbot Panel */}
      <Chatbot isOpen={chatOpen} onClose={() => setChatOpen(false)} patient={patient} />

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          onClose={() => setBookingDoctor(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
}
