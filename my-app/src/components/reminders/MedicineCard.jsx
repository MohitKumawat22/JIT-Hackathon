"use client";
import QuantityTracker from "./QuantityTracker";
import { frequencyLabel, adherencePercent, nextDoseIn } from "@/lib/reminderUtils";

export default function MedicineCard({ reminder, onEdit, onDelete }) {
  const adherence = adherencePercent(reminder);
  
  const getAdherenceColor = (percent) => {
    if (percent >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (percent >= 70) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-red-600 bg-red-50 border-red-100";
  };

  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-500">
            {reminder.medicineType === "tablet" ? "💊" : reminder.medicineType === "syrup" ? "🧪" : "💉"}
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 leading-tight mb-1">{reminder.medicineName}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{reminder.dosage} • {frequencyLabel(reminder.frequency)}</p>
          </div>
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getAdherenceColor(adherence)}`}>
          {adherence}% Adherence
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-tight">Next Intake</span>
            <span className="text-[11px] font-black text-emerald-600 uppercase tracking-tight">{nextDoseIn(reminder.times)}</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {reminder.times.map((t, i) => (
              <span key={i} className="bg-white border border-gray-200 px-3 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm">
                {t}
              </span>
            ))}
          </div>
        </div>

        <QuantityTracker 
          remaining={reminder.remainingQuantity} 
          total={reminder.totalQuantity} 
          type={reminder.medicineType} 
        />
      </div>

      <div className="mt-8 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => onEdit(reminder)}
          className="flex-1 bg-gray-900 text-white text-[11px] font-black py-3 rounded-xl hover:bg-gray-800 transition-all uppercase tracking-widest shadow-md active:scale-95"
        >
          Adjust
        </button>
        <button 
          onClick={() => onDelete(reminder._id)}
          className="bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-all shadow-sm active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  );
}
