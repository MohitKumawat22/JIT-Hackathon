"use client";
import { useState } from"react";
import MedicineCard from"./MedicineCard";
import AddReminderModal from"./AddReminderModal";
import AlarmPopup from"./AlarmPopup";
import RefillAlert from"./RefillAlert";
import { useReminders } from"@/hooks/useReminders";
import { useAlarmScheduler } from"@/hooks/useAlarmScheduler";
import { useNotification } from"@/hooks/useNotification";

export default function ReminderDashboard({ patientId, patientName }) {
 const { reminders, loading, fetchReminders, markTaken } = useReminders(patientId);
 const { sendNotification } = useNotification();
 const [activeAlarm, setActiveAlarm] = useState(null);
 const [isModalOpen, setIsModalOpen] = useState(false);

 useAlarmScheduler(reminders, (reminder) => {
 setActiveAlarm(reminder);
 sendNotification("Medicine Time!", `Time to take your ${reminder.medicineName}`);
 });

 const handleAddMedicine = async (reminderData) => {
 try {
 const res = await fetch("/api/reminders", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify(reminderData),
 });
 if (res.ok) {
 fetchReminders();
 }
 } catch (err) {
 console.error("Failed to add reminder", err);
 }
 };

 const handleDelete = async (id) => {
 if (!confirm("Delete this medication?")) return;
 try {
 await fetch(`/api/reminders/${id}`, { method:"DELETE" });
 fetchReminders();
 } catch (err) {
 console.error("Delete failed", err);
 }
 };

 const handleAction = async (reminder, status) => {
 const scheduledTime = new Date();
 await markTaken(reminder._id, scheduledTime, status);
 setActiveAlarm(null);
 };

 return (
 <div className="max-w-7xl mx-auto px-6 py-12">
 {/* Alarms */}
 {activeAlarm && (
 <AlarmPopup reminder={activeAlarm}
 onTake={() => handleAction(activeAlarm,"taken")}
 onSkip={() => handleAction(activeAlarm,"skipped")}
 onSnooze={() => setActiveAlarm(null)}
 />
 )}

 {/* Header */}
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
 <div>
 <h1 className="text-5xl font-black text-gray-900 leading-tight tracking-tighter mb-2">MediAI <span className="text-emerald-500">Reminders</span></h1>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.3em]">Smart Medication Tracking System</p>
 </div>
 <button onClick={() => setIsModalOpen(true)}
 className="bg-gray-900 text-white font-black px-10 py-5 rounded-[2rem] hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-95 uppercase tracking-widest text-sm"
 >
 + Add Medication
 </button>
 </div>

 <RefillAlert reminders={reminders} />

 {/* Stats Bar */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Active Medicines</p>
 <p className="text-4xl font-black text-gray-900">{reminders.length}</p>
 </div>
 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Average Adherence</p>
 <p className="text-4xl font-black text-emerald-500">
 {reminders.length > 0 ? Math.round(reminders.reduce((acc, curr) => acc + (curr.takenLog.length > 0 ? (curr.takenLog.filter(l => l.status === 'taken').length / curr.takenLog.length * 100) : 100), 0) / reminders.length) : 100}%
 </p>
 </div>
 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Refills Needed</p>
 <p className="text-4xl font-black text-amber-500">{reminders.filter(r => (r.remainingQuantity / r.totalQuantity) < 0.2).length}</p>
 </div>
 </div>

 {/* Grid */}
 {loading ? (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {[1, 2, 3].map(i => (
 <div key={i} className="h-80 bg-gray-50 rounded-[2rem] border border-gray-100 animate-pulse" />
 ))}
 </div>
 ) : reminders.length === 0 ? (
 <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
 <div className="text-7xl mb-6 grayscale opacity-30">💊</div>
 <h2 className="text-2xl font-black text-gray-400 uppercase tracking-widest mb-8">No Medications Found</h2>
 <button onClick={() => setIsModalOpen(true)}
 className="bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-100 uppercase tracking-widest text-xs"
 >
 Setup Your First Reminder
 </button>
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
 {reminders.map(m => (
 <MedicineCard key={m._id} reminder={m} onDelete={handleDelete}
 onEdit={() => {}} // TODO: Edit modal
 />
 ))}
 </div>
 )}

 <AddReminderModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
 onAdd={handleAddMedicine}
 patientId={patientId}
 patientName={patientName}
 />
 </div>
 );
}
