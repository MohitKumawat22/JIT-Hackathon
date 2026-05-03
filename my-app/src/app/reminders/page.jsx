"use client";
import { useEffect, useState } from"react";
import { useRouter } from"next/navigation";
import ReminderDashboard from"@/components/reminders/ReminderDashboard";
import Link from"next/link";

export default function RemindersPage() {
 const router = useRouter();
 const [patient, setPatient] = useState(null);

 useEffect(() => {
 const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (!stored?.id) {
 router.push("/patient/login");
 return;
 }
 setPatient(stored);
 }, [router]);

 if (!patient) return null;

 return (
 <div className="min-h-screen bg-white">
 {/* Mini Nav */}
 <nav className="bg-white border-b border-gray-50 sticky top-0 z-40">
 <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
 <Link href="/patient/dashboard" className="flex items-center gap-2 group">
 <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-all">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
 </div>
 <span className="text-sm font-black text-gray-400 uppercase tracking-widest group-hover:text-gray-900 transition-all">Dashboard</span>
 </Link>
 <div className="flex items-center gap-4">
 <div className="text-right">
 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Logged in as</p>
 <p className="text-sm font-black text-gray-900 leading-none">{patient.firstName} {patient.lastName}</p>
 </div>
 <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-black">
 {patient.firstName[0]}{patient.lastName[0]}
 </div>
 </div>
 </div>
 </nav>

 <ReminderDashboard patientId={patient.id} patientName={`${patient.firstName} ${patient.lastName}`} />
 </div>
 );
}
