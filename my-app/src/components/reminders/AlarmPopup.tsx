import React from 'react';
import { IReminder } from '@/models/Reminder';
import { daysOfSupplyLeft } from '@/lib/reminderUtils';

interface AlarmPopupProps {
 reminder: IReminder | null;
 onTaken: () => void;
 onSkip: () => void;
 onSnooze: () => void;
 onClose: () => void;
}

export default function AlarmPopup({
 reminder,
 onTaken,
 onSkip,
 onSnooze,
 onClose
}: AlarmPopupProps) {
 if (!reminder) return null;

 const supplyDays = daysOfSupplyLeft(reminder);
 const remainingAfterDose = reminder.remainingQuantity - reminder.tabletsPerDose;
 const daysAfterDose = Math.max(0, supplyDays - 1);

 const handleTaken = () => {
 onTaken();
 onClose();
 };

 const handleSnooze = () => {
 onSnooze();
 onClose();
 };

 const handleSkip = () => {
 onSkip();
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-gray-900"
 onClick={onClose}
 />
 {/* Popup Content */}
 <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all animate-in fade-in zoom-in-95 duration-200">
 <div className="text-center">
 <div className="inline-block animate-pulse text-5xl mb-4">
 🔔
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">
  Medicine Time!
 </h2>
 <div className="bg-emerald-50 rounded-xl p-4 my-6">
 <h3 className="text-3xl font-black text-emerald-900 mb-1">
 {reminder.medicineName}
 </h3>
 <p className="text-lg font-semibold text-emerald-700">
 {reminder.dosage}
 </p>
 </div>

 <p className="text-gray-700 font-medium text-lg mb-2">
 {reminder.tabletsPerDose} tablet(s) {reminder.notes ? `— ${reminder.notes}` : ''}
 </p>
 <p className="text-sm text-gray-500 mb-8">
 Remaining after this dose: {remainingAfterDose} tablets ({daysAfterDose} days)
 </p>

 <div className="flex gap-3 justify-center">
 <button
 onClick={handleTaken}
 className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
 >
 ✅ Mark as Taken
 </button>
 <button
 onClick={handleSnooze}
 className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
 >
 ⏭ Snooze 10 min
 </button>
 <button
 onClick={handleSkip}
 className="flex-1 border-2 border-red-500 text-red-500 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
 >
 ❌ Skip dose
 </button>
 </div>
 </div>
 </div>
 </div>
 );
}
