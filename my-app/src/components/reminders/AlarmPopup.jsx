"use client";
import { useEffect, useRef } from"react";

export default function AlarmPopup({ reminder, onTake, onSkip, onSnooze }) {
 const audioRef = useRef(null);

 useEffect(() => {
 if (audioRef.current) {
 audioRef.current.play().catch(e => console.error("Audio blocked", e));
 }
 }, []);

 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-600/90 animate-in fade-in duration-500">
 <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" loop />
 <div className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl text-center animate-in zoom-in duration-500 slide-in-from-bottom-10">
 <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-8 animate-bounce-slow shadow-inner">
 ⏰
 </div>
 <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">Medicine Time</h2>
 <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-8">Scheduled for now</p>
 <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 mb-10 shadow-sm">
 <h3 className="text-4xl font-black text-red-600 mb-2">{reminder.medicineName}</h3>
 <p className="text-lg font-black text-gray-700">{reminder.tabletsPerDose} {reminder.medicineType}(s) • {reminder.dosage}</p>
 {reminder.notes && <p className="mt-4 text-sm font-bold text-gray-400 italic">" {reminder.notes}"</p>}
 </div>

 <div className="grid grid-cols-1 gap-4">
 <button onClick={onTake}
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-6 rounded-3xl text-xl shadow-xl shadow-emerald-200 transition-all active:scale-95 uppercase tracking-widest"
 >
 ✅ I've Taken It
 </button>
 <div className="grid grid-cols-2 gap-4">
 <button onClick={onSnooze}
 className="bg-amber-100 hover:bg-amber-200 text-amber-700 font-black py-4 rounded-3xl text-sm transition-all active:scale-95 uppercase tracking-widest"
 >
 ⏳ Snooze
 </button>
 <button onClick={onSkip}
 className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-black py-4 rounded-3xl text-sm transition-all active:scale-95 uppercase tracking-widest"
 >
 ❌ Skip
 </button>
 </div>
 </div>
 <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
 Remaining: {reminder.remainingQuantity} {reminder.medicineType}s
 </p>
 </div>
 </div>
 );
}
