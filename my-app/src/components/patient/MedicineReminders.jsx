"use client";

import { useState, useEffect, useCallback, useRef } from"react";

export default function MedicineReminders({ patientId }) {
 const [reminders, setReminders] = useState([]);
 const [medicineName, setMedicineName] = useState("");
 const [time, setTime] = useState("");
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [alarmActive, setAlarmActive] = useState(null); // stores the reminder that's currently alarming
 const audioRef = useRef(null);

 const fetchReminders = useCallback(async () => {
 if (!patientId) return;
 try {
 const res = await fetch(`/api/patient/reminders?patientId=${patientId}`);
 const data = await res.json();
 setReminders(data.reminders || []);
 } catch (err) {
 console.error("Failed to load reminders:", err);
 } finally {
 setLoading(false);
 }
 }, [patientId]);

 useEffect(() => {
 fetchReminders();
 }, [fetchReminders]);

 // Alarm checking logic
 useEffect(() => {
 const checkAlarms = () => {
 const now = new Date();
 const currentHHMM = now.toTimeString().slice(0, 5); //"HH:mm"

 reminders.forEach((r) => {
 if (r.isActive && r.time === currentHHMM && !alarmActive) {
 // Trigger alarm!
 setAlarmActive(r);
 if (audioRef.current) {
 audioRef.current.play().catch(e => console.error("Audio play failed:", e));
 }
 }
 });
 };

 const interval = setInterval(checkAlarms, 30000); // Check every 30 seconds
 return () => clearInterval(interval);
 }, [reminders, alarmActive]);

 const handleAddReminder = async (e) => {
 e.preventDefault();
 if (!medicineName || !time) return;

 try {
 const res = await fetch("/api/patient/reminders", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ patientId, medicineName, time }),
 });
 if (res.ok) {
 const data = await res.json();
 setReminders((prev) => [...prev, data.reminder]);
 setMedicineName("");
 setTime("");
 setShowForm(false);
 }
 } catch (err) {
 console.error("Failed to add reminder:", err);
 }
 };

 const handleDeleteReminder = async (id) => {
 try {
 const res = await fetch(`/api/patient/reminders?id=${id}`, { method:"DELETE" });
 if (res.ok) {
 setReminders((prev) => prev.filter((r) => r._id !== id));
 }
 } catch (err) {
 console.error("Failed to delete reminder:", err);
 }
 };

 const handleToggleReminder = async (id, currentStatus) => {
 try {
 const res = await fetch("/api/patient/reminders", {
 method:"PATCH",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ id, isActive: !currentStatus }),
 });
 if (res.ok) {
 setReminders((prev) =>
 prev.map((r) => (r._id === id ? { ...r, isActive: !currentStatus } : r))
 );
 }
 } catch (err) {
 console.error("Failed to toggle reminder:", err);
 }
 };

 const stopAlarm = () => {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.currentTime = 0;
 }
 setAlarmActive(null);
 };

 return (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
 <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" loop />
 {/* Alarm Overlay */}
 {alarmActive && (
 <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-600/90 animate-pulse p-6 text-center">
 <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl animate-bounce">
 <div className="text-6xl mb-4">🔔</div>
 <h2 className="text-3xl font-black text-gray-900 mb-2">Medicine Time!</h2>
 <p className="text-xl text-gray-600 mb-8">Please take your medicine: <br/><span className="font-bold text-red-600 text-2xl">{alarmActive.medicineName}</span></p>
 <button onClick={stopAlarm}
 className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-xl shadow-lg transition-all active:scale-95"
 >
 I've Taken It
 </button>
 </div>
 </div>
 )}

 {/* Header */}
 <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between to-white">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">💊</div>
 <div>
 <h2 className="text-sm font-bold text-gray-800">Medicine Reminders</h2>
 <p className="text-xs text-gray-400">Never miss a dose again</p>
 </div>
 </div>
 <button
 onClick={() => setShowForm(!showForm)}
 className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
 showForm
 ?"bg-gray-100 text-gray-600 hover:bg-gray-200"
 :"bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
 }`}
 >
 {showForm ?"✕ Close" :"+ Add Reminder"}
 </button>
 </div>

 <div className="p-5">
 {showForm && (
 <form onSubmit={handleAddReminder} className="mb-6 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 animate-slide-up">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
 <div>
 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1 ml-1">Medicine Name</label>
 <input
 type="text"
 placeholder="e.g. Paracetamol"
 value={medicineName}
 onChange={(e) => setMedicineName(e.target.value)}
 className="w-full border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none bg-white"
 required
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-emerald-700 uppercase mb-1 ml-1">Reminder Time</label>
 <input
 type="time"
 value={time}
 onChange={(e) => setTime(e.target.value)}
 className="w-full border border-emerald-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400/30 outline-none bg-white"
 required
 />
 </div>
 </div>
 <button
 type="submit"
 className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-md shadow-emerald-200"
 >
 Set Reminder
 </button>
 </form>
 )}

 <div className="space-y-3">
 {reminders.length === 0 && !loading && !showForm && (
 <div className="text-center py-8">
 <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mx-auto mb-3 opacity-50">⏰</div>
 <p className="text-sm font-medium text-gray-400">No reminders set</p>
 </div>
 )}

 {reminders.map((r) => (
 <div key={r._id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
 r.isActive ?"bg-white border-gray-100 shadow-sm" :"bg-gray-50 border-transparent opacity-60"
 }`}
 >
 <div className="flex items-center gap-4">
 <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
 r.isActive ?"bg-emerald-50 text-emerald-600" :"bg-gray-200 text-gray-400"
 }`}>
 {r.isActive ?"🔔" :"🔕"}
 </div>
 <div>
 <h3 className="font-bold text-gray-800">{r.medicineName}</h3>
 <p className="text-sm text-gray-500 font-medium">🕒 {r.time}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => handleToggleReminder(r._id, r.isActive)}
 className={`p-2 rounded-lg transition-colors ${
 r.isActive ?"text-emerald-600 hover:bg-emerald-50" :"text-gray-400 hover:bg-gray-200"
 }`}
 title={r.isActive ?"Disable" :"Enable"}
 >
 {r.isActive ?"On" :"Off"}
 </button>
 <button
 onClick={() => handleDeleteReminder(r._id)}
 className="p-2 text-gray-300 hover:text-red-500 transition-colors"
 title="Delete"
 >
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
 </button>
 </div>
 </div>
 ))}

 {loading && (
 <div className="space-y-3 animate-pulse">
 {[1, 2].map((i) => (
 <div key={i} className="h-20 bg-gray-50 border border-gray-100 rounded-2xl" />
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
