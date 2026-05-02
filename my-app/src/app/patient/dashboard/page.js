"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
        
        // Trigger WhatsApp Notification
        const message = `Hello ${booking.doctor.name},\n\n*New Appointment Booking*\nPatient: ${patient.name}\nDate: ${new Date(booking.date).toLocaleDateString("en-IN")}\nTime: ${booking.slot}\n\nPlease confirm this appointment.`;
        const hospitalPhone = booking.doctor.phone || "919999999999";
        const whatsappUrl = `https://wa.me/${hospitalPhone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");

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

      {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onConfirm={handleConfirmBooking} />}
    </div>
  );
}
