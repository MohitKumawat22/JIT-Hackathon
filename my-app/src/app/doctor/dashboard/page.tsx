"use client";

import { useState, useEffect } from"react";
import { useSession } from"next-auth/react";
import { useRouter } from"next/navigation";

interface Appointment {
 _id: string;
 patientId: { name: string; email: string };
 patientInfo: {
 name: string;
 age: number;
 phone: string;
 complaint: string;
 };
 slot: {
 day: string;
 time: string;
 };
 status:"pending" |"confirmed" |"cancelled";
 createdAt: string;
}

export default function DoctorDashboard() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [appointments, setAppointments] = useState<Appointment[]>([]);
 const [loading, setLoading] = useState(true);
 const [expandedId, setExpandedId] = useState<string | null>(null);

 useEffect(() => {
 if (status ==="unauthenticated" || (session?.user as any)?.role !=="doctor") {
 router.push("/login");
 return;
 }
 fetchAppointments();
 }, [status, session]);

 const fetchAppointments = async () => {
 try {
 const res = await fetch("/api/appointments/doctor");
 const data = await res.json();
 setAppointments(data.appointments || []);
 } catch (err) {
 console.error("Failed to fetch appointments:", err);
 } finally {
 setLoading(false);
 }
 };

 const markComplete = async (id: string) => {
 try {
 const res = await fetch(`/api/appointments/${id}`, {
 method:"PUT",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ status:"confirmed" }),
 });
 if (res.ok) {
 setAppointments((prev) =>
 prev.map((app) => (app._id === id ? { ...app, status:"confirmed" } : app))
 );
 }
 } catch (err) {
 console.error("Failed to update status:", err);
 }
 };

 if (status ==="loading") return <div className="p-10 text-center">Loading session...</div>;

 return (
 <div className="min-h-screen bg-slate-50 py-12 px-6">
 <div className="max-w-4xl mx-auto">
 <header className="flex justify-between items-center mb-10">
 <div>
 <h1 className="text-3xl font-extrabold text-gray-900">Doctor Dashboard</h1>
 <p className="text-gray-500 font-medium">Managing your patient appointments</p>
 </div>
 <div className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
 Today: {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
 </div>
 </header>

 {loading ? (
 <div className="flex justify-center py-20 animate-pulse text-gray-400">Loading appointments...</div>
 ) : appointments.length === 0 ? (
 <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
 <div className="text-5xl mb-4"></div>
 <h2 className="text-xl font-bold text-gray-900 mb-2">No Appointments</h2>
 <p className="text-gray-500">You don't have any appointments scheduled for today.</p>
 </div>
 ) : (
 <div className="space-y-4">
 {appointments.map((app) => (
 <div
 key={app._id}
 className={`bg-white rounded-3xl border transition-all overflow-hidden ${
 expandedId === app._id ?"border-emerald-400 ring-4 ring-emerald-500/5 shadow-xl scale-[1.02]" :"border-gray-100 hover:border-gray-200 shadow-sm"
 }`}
 >
 <div
 className="p-6 cursor-pointer flex items-center justify-between"
 onClick={() => setExpandedId(expandedId === app._id ? null : app._id)}
 >
 <div className="flex items-center gap-5">
 <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">
 👤
 </div>
 <div>
 <h3 className="font-bold text-gray-900 text-lg">{app.patientInfo.name}</h3>
 <p className="text-sm font-medium text-gray-500">
 {app.slot.day} • <span className="text-emerald-600 font-bold">{app.slot.time}</span>
 </p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <span
 className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
 app.status ==="confirmed" ?"bg-green-100 text-green-700" :"bg-yellow-100 text-yellow-700"
 }`}
 >
 {app.status}
 </span>
 <svg
 className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === app._id ?"rotate-180" :""}`}
 fill="none"
 stroke="currentColor"
 viewBox="0 0 24 24"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
 </svg>
 </div>
 </div>

 {expandedId === app._id && (
 <div className="px-6 pb-6 pt-2 bg-emerald-50/30 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
 <div className="grid grid-cols-2 gap-8 mb-6">
 <div className="space-y-4">
 <div>
 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Patient Details</label>
 <p className="text-sm text-gray-700 font-medium">Age: {app.patientInfo.age} | Phone: {app.patientInfo.phone}</p>
 </div>
 <div>
 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Chief Complaint</label>
 <div className="bg-white p-3 rounded-xl border border-gray-100 text-sm text-gray-800 leading-relaxed italic shadow-sm">"{app.patientInfo.complaint}"
 </div>
 </div>
 </div>
 <div className="flex flex-col justify-end items-end gap-3">
 {app.status ==="pending" && (
 <button
 onClick={() => markComplete(app._id)}
 className="bg-green-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 flex items-center gap-2"
 >
 <span>✓</span> Confirm Appointment
 </button>
 )}
 <button className="text-red-500 text-xs font-bold hover:underline">Cancel Slot</button>
 </div>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
