"use client";
import { useState } from"react";

export default function AddReminderModal({ isOpen, onClose, onAdd, patientId, patientName }) {
 const [loading, setLoading] = useState(false);
 const [aiInput, setAiInput] = useState("");
 const [formData, setFormData] = useState({
 medicineName:"",
 medicineType:"tablet",
 dosage:"",
 frequency:"once_daily",
 times: ["08:00"],
 totalQuantity: 30,
 tabletsPerDose: 1,
 notes:""
 });

 if (!isOpen) return null;

 const handleAiEntry = async () => {
 if (!aiInput.trim()) return;
 setLoading(true);
 try {
 const res = await fetch("/api/chat", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 messages: [{ role:"user", text: `SET REMINDER: ${aiInput}` }],
 isReminderPrompt: true // Flag for API to use the reminder prompt
 }),
 });
 const data = await res.json();
 if (data.reminderData) {
 setFormData({ ...formData, ...data.reminderData });
 setAiInput("");
 }
 } catch (err) {
 console.error("AI Entry failed", err);
 } finally {
 setLoading(false);
 }
 };

 const handleSubmit = (e) => {
 e.preventDefault();
 onAdd({ ...formData, patientId, patientName });
 onClose();
 };

 return (
 <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-gray-900 animate-in fade-in duration-300">
 <div className="max-w-2xl w-full bg-white rounded-[3rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
 <div className="flex justify-between items-center mb-10">
 <div>
 <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tight">Add Medicine</h2>
 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Configure your schedule</p>
 </div>
 <button onClick={onClose} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all active:scale-90">
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
 </button>
 </div>

 {/* AI Quick Entry */}
 <div className="mb-10 p-6 rounded-[2rem] border border-emerald-100 shadow-inner">
 <label className="block text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-3 ml-2">AI Smart Entry</label>
 <div className="flex gap-3">
 <input type="text" placeholder="e.g. Paracetamol 500mg twice a day for 5 days..."
 value={aiInput}
 onChange={(e) => setAiInput(e.target.value)}
 className="flex-1 bg-white border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-4 focus:ring-emerald-100 outline-none transition-all"
 />
 <button onClick={handleAiEntry}
 disabled={loading || !aiInput.trim()}
 className="bg-emerald-600 text-white font-black px-6 py-4 rounded-2xl text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 active:scale-95 uppercase tracking-widest"
 >
 {loading ?"..." :"Magic"}
 </button>
 </div>
 </div>

 <form onSubmit={handleSubmit} className="space-y-8">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
 <div className="space-y-6">
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Medicine Name</label>
 <input type="text" required
 value={formData.medicineName}
 onChange={(e) => setFormData({...formData, medicineName: e.target.value})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
 />
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Type</label>
 <select value={formData.medicineType}
 onChange={(e) => setFormData({...formData, medicineType: e.target.value})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none"
 >
 <option value="tablet">Tablet</option>
 <option value="capsule">Capsule</option>
 <option value="syrup">Syrup</option>
 <option value="injection">Injection</option>
 <option value="drops">Drops</option>
 </select>
 </div>
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Dosage</label>
 <input type="text" placeholder="500mg"
 value={formData.dosage}
 onChange={(e) => setFormData({...formData, dosage: e.target.value})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
 />
 </div>
 </div>
 </div>

 <div className="space-y-6">
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Frequency</label>
 <select value={formData.frequency}
 onChange={(e) => setFormData({...formData, frequency: e.target.value})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all appearance-none"
 >
 <option value="once_daily">Once daily</option>
 <option value="twice_daily">Twice daily</option>
 <option value="thrice_daily">Three times daily</option>
 <option value="every_4_hours">Every 4 hours</option>
 <option value="every_6_hours">Every 6 hours</option>
 <option value="once_weekly">Once weekly</option>
 </select>
 </div>
 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Total Qty</label>
 <input type="number" value={formData.totalQuantity}
 onChange={(e) => setFormData({...formData, totalQuantity: parseInt(e.target.value)})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
 />
 </div>
 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Per Dose</label>
 <input type="number" value={formData.tabletsPerDose}
 onChange={(e) => setFormData({...formData, tabletsPerDose: parseInt(e.target.value)})}
 className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold text-gray-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
 />
 </div>
 </div>
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-2">Intake Times</label>
 <div className="flex flex-wrap gap-3">
 {formData.times.map((time, i) => (
 <div key={i} className="flex gap-1">
 <input type="time" value={time}
 onChange={(e) => {
 const newTimes = [...formData.times];
 newTimes[i] = e.target.value;
 setFormData({...formData, times: newTimes});
 }}
 className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2 text-xs font-black text-emerald-700 focus:ring-4 focus:ring-emerald-50 outline-none transition-all"
 />
 {formData.times.length > 1 && (
 <button type="button"
 onClick={() => setFormData({...formData, times: formData.times.filter((_, idx) => idx !== i)})}
 className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
 >
 ×
 </button>
 )}
 </div>
 ))}
 <button type="button"
 onClick={() => setFormData({...formData, times: [...formData.times,"12:00"]})}
 className="bg-gray-50 border border-dashed border-gray-200 text-gray-400 px-4 py-2 rounded-xl text-xs font-black hover:bg-gray-100 transition-all"
 >
 + Add Time
 </button>
 </div>
 </div>

 <button type="submit"
 className="w-full bg-gray-900 text-white font-black py-6 rounded-3xl text-lg shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 uppercase tracking-widest"
 >
 Save Medication
 </button>
 </form>
 </div>
 </div>
 );
}
