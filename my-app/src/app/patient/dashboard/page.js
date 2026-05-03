"use client";

import Link from"next/link";
import { useRouter } from"next/navigation";
import { useState, useEffect } from"react";
import ScheduleCall from"@/components/patient/ScheduleCall";
import MedicineReminder from"@/components/patient/MedicineReminder";

const ALL_SLOTS = ["9:00 AM","10:30 AM","12:00 PM","2:30 PM","4:00 PM","5:30 PM","7:00 PM"];


/* ─── Booking Modal ─── */
function BookingModal({ doctor, onClose, onConfirm }) {
 const [selectedSlot, setSelectedSlot] = useState(null);
 const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);

 return (
 <div className="fixed inset-0 bg-gray-900 flex items-center justify-center z-50 p-4" onClick={onClose}>
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
 <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${selectedSlot === slot ?"bg-[#10B981] text-white border-[#10B981] shadow-md shadow-[#10B981]/20" :"bg-white text-gray-600 border-gray-200 hover:border-[#10B981] hover:text-[#10B981]"}`}>{slot}</button>
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
 const [doctorsList, setDoctorsList] = useState([]);
 const [doctorsLoading, setDoctorsLoading] = useState(true);
 const [dataSource, setDataSource] = useState("");
 const [refillCount, setRefillCount] = useState(0);

 useEffect(() => {
 if (!patient?.id) return;
 fetch(`/api/reminders?patientId=${patient.id}`)
 .then(res => res.json())
 .then(data => {
 const meds = data.reminders || [];
 const count = meds.filter(m => m.remainingQuantity <= (m.tabletsPerDose * m.refillAlertDays * m.times.length)).length;
 setRefillCount(count);
 })
 .catch(err => console.error(err));
 }, [patient?.id]);

 useEffect(() => {
 const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (!stored?.id) { router.push("/patient/login"); return; }
 setPatient(stored);
 }, [router]);

 useEffect(() => {
 const fetchDoctors = async (lat, lng) => {
 setDoctorsLoading(true);
 try {
 const res = await fetch(`/api/doctors/nearby?lat=${lat}&lng=${lng}`);
 const data = await res.json();
 setDataSource(data.source ||"");
 if (data.doctors && data.doctors.length > 0) {
 // Normalize Mappls results — real facility names, no fake Dr. names
 const normalized = data.doctors.map((d, i) => ({
 ...d,
 id: d.id ?? i,
 name: d.name ||"Nearby Clinic",
 specialty: d.specialty ||"General Clinic",
 rating: d.rating ?? +(3.5 + Math.random() * 1.5).toFixed(1),
 experience: d.experience || `${Math.floor(Math.random() * 15 + 2)} yrs`,
 available: d.available !== false,
 fee: d.fee || `₹${Math.floor(Math.random() * 8 + 3) * 100}`,
 avatar: (d.name ||"CL").substring(0, 2).toUpperCase(),
 slots: d.slots?.length ? d.slots : ALL_SLOTS.sort(() => 0.5 - Math.random()).slice(0, 3),
 }));
 setDoctorsList(normalized);
 }
 } catch (err) {
 console.error("Failed to fetch nearby doctors:", err);
 setDataSource("error");
 } finally {
 setDoctorsLoading(false);
 }
 };

 if ("geolocation" in navigator) {
 navigator.geolocation.getCurrentPosition(
 (pos) => fetchDoctors(pos.coords.latitude, pos.coords.longitude),
 (err) => {
 console.warn("Location denied — using Delhi default:", err.message);
 fetchDoctors("28.6139","77.2090");
 },
 { timeout: 5000 }
 );
 } else {
 fetchDoctors("28.6139","77.2090");
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
 slot: b.scheduledSlot ||"",
 fee: b.fee ||""
 }));
 setBookings(formatted);
 }
 } catch (err) {
 console.error("Failed to fetch bookings:", err);
 }
 };
 fetchBookings();
 }, [patient?.id]);

 // Build dynamic specialty list from live data
 const specialties = ["All", ...new Set(doctorsList.map((d) => d.specialty).filter(Boolean))];

 const filteredDoctors = doctorsList.filter((d) => {
 const matchSearch =
 d.name.toLowerCase().includes(search.toLowerCase()) ||
 (d.specialty ||"").toLowerCase().includes(search.toLowerCase()) ||
 (d.address ||"").toLowerCase().includes(search.toLowerCase());
 const matchSpec = specialty ==="All" || d.specialty === specialty;
 return matchSearch && matchSpec;
 });



 const handleConfirmBooking = async (booking) => {
 try {
 const res = await fetch("/api/bookings", {
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
 const data = await res.json();
 if (res.ok) {
 setBookings(prev => [...prev, { id: data.booking._id, doctorName: booking.doctor.name, specialty: booking.doctor.specialty, date: booking.date, slot: booking.slot, fee: booking.doctor.fee }]);
 setBookingDoctor(null);
 setSuccessMsg(`Booked ${booking.doctor.name} on ${new Date(booking.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} at ${booking.slot}.`);
 // Trigger WhatsApp Notification
 const message = `Hello ${booking.doctor.name},\n\n*New Appointment Booking*\nPatient: ${patient.name}\nDate: ${new Date(booking.date).toLocaleDateString("en-IN")}\nTime: ${booking.slot}\n\nPlease confirm this appointment.`;
 const hospitalPhone = booking.doctor.phone ||"919999999999";
 const whatsappUrl = `https://wa.me/${hospitalPhone}?text=${encodeURIComponent(message)}`;
 window.open(whatsappUrl,"_blank");

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
 <Link href="/reminders" className="relative text-sm text-gray-500 hover:text-primary transition-colors no-underline flex items-center">
 💊 Reminders
 {refillCount > 0 && (
 <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
 {refillCount}
 </span>
 )}
 </Link>
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
 <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"></div>
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
 <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center">🤖</div>
 <div><p className="text-2xl font-bold text-gray-800">24/7</p><p className="text-xs text-gray-500">AI Health Assistant</p></div>
 </div>
 </div>
 </div>

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
 <span> {new Date(b.date).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" })}</span>
 <span>🕐 {b.slot}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Search */}
 <div className="mb-6">
 <div className="flex items-center justify-between mb-4">
 <h2 className="text-lg font-bold text-gray-800">Find a Doctor</h2>
 {!doctorsLoading && (
 <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
 dataSource ==="mappls"
 ?"bg-green-50 text-green-600"
 :"bg-yellow-50 text-yellow-600"
 }`}>
 {dataSource ==="mappls" ?"📍 Live — Near You" :"📋 Default listing"}
 </span>
 )}
 </div>
 <div className="flex flex-col md:flex-row gap-3">
 <div className="relative flex-1">
 <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
 <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, specialty or address..." className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
 </div>
 <div className="flex gap-2 flex-wrap">
 {specialties.map((s) => (
 <button key={s} onClick={() => setSpecialty(s)} className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-all border whitespace-nowrap ${specialty === s ?"bg-primary text-white border-primary shadow-sm" :"bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary"}`}>{s}</button>
 ))}
 </div>
 </div>
 </div>

 {/* Doctor Cards */}
 {doctorsLoading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
 {[1,2,3,4,5,6].map((i) => (
 <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm animate-pulse">
 <div className="flex items-center gap-4 mb-4">
 <div className="w-14 h-14 rounded-full bg-gray-100" />
 <div className="flex-1"><div className="h-4 bg-gray-100 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-100 rounded w-1/2" /></div>
 </div>
 <div className="flex gap-3 mb-4"><div className="h-3 bg-gray-100 rounded w-12" /><div className="h-3 bg-gray-100 rounded w-12" /><div className="h-3 bg-gray-100 rounded w-16" /></div>
 <div className="flex justify-between"><div className="h-6 bg-gray-100 rounded-full w-28" /><div className="h-8 bg-gray-100 rounded-xl w-24" /></div>
 </div>
 ))}
 </div>
 ) : (
 <>
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
 {doctor.address && <p className="text-xs text-gray-400 truncate mt-0.5">📍 {doctor.address}</p>}
 {doctor.distance && <p className="text-xs text-primary font-medium mt-0.5">{doctor.distance} km away</p>}
 </div>
 </div>
 <div className="flex items-center gap-4 mb-4 text-sm">
 <span className="text-gray-500 flex items-center gap-1">⭐ {doctor.rating}</span>
 <span className="text-gray-500">{doctor.experience}</span>
 <span className="font-semibold text-primary">{doctor.fee}</span>
 </div>
 <div className="flex items-center justify-between">
 <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doctor.available ?"bg-green-50 text-green-600" :"bg-red-50 text-red-500"}`}>
 {doctor.available ?"● Available Today" :"● Not Available"}
 </span>
 <button disabled={!doctor.available} onClick={() => setBookingDoctor(doctor)} className="bg-primary text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Book Now</button>
 </div>
 </div>
 ))}
 </div>
 {filteredDoctors.length === 0 && !doctorsLoading && (
 <div className="text-center py-16">
 {doctorsList.length === 0 ? (
 <div>
 <p className="text-gray-400 text-sm mb-2">📡 Could not fetch nearby clinics right now.</p>
 <button onClick={() => window.location.reload()} className="text-xs text-primary underline">Try again</button>
 </div>
 ) : (
 <p className="text-gray-400 text-sm">No clinics found matching your search.</p>
 )}
 </div>
 )}
 </>
 )}
 </div>

 {bookingDoctor && <BookingModal doctor={bookingDoctor} onClose={() => setBookingDoctor(null)} onConfirm={handleConfirmBooking} />}
 </div>
 );
}
