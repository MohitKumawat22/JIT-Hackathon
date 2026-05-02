"use client";
import { needsRefillAlert, daysOfSupplyLeft } from "@/lib/reminderUtils";

export default function RefillAlert({ reminders }) {
  const lowStockMedicines = reminders.filter(needsRefillAlert);

  if (lowStockMedicines.length === 0) return null;

  return (
    <div className="space-y-3 mb-8">
      {lowStockMedicines.map((m) => {
        const daysLeft = daysOfSupplyLeft(m);
        return (
          <div key={m._id} className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-4 animate-pulse-slow">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl shadow-sm">⚠️</div>
            <div className="flex-1">
              <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Refill Alert: {m.medicineName}</h4>
              <p className="text-xs font-bold text-red-700/80">
                Only <span className="text-red-900 underline decoration-red-400">{daysLeft} days</span> of supply remaining. Please refill your prescription soon.
              </p>
            </div>
            <button className="bg-red-600 text-white text-[11px] font-black px-4 py-2 rounded-lg hover:bg-red-700 transition-all uppercase tracking-widest shadow-md active:scale-95">
              Refill Now
            </button>
          </div>
        );
      })}
    </div>
  );
}
