import React, { useState, useEffect } from 'react';
import { IReminder } from '@/models/Reminder';

interface AddReminderModalProps {
 isOpen: boolean;
 onClose: () => void;
 onAdd: (data: Partial<IReminder>) => void;
}

const DAYS_OF_WEEK = [
 { label: 'Sun', value: 0 },
 { label: 'Mon', value: 1 },
 { label: 'Tue', value: 2 },
 { label: 'Wed', value: 3 },
 { label: 'Thu', value: 4 },
 { label: 'Fri', value: 5 },
 { label: 'Sat', value: 6 },
];

export default function AddReminderModal({ isOpen, onClose, onAdd }: AddReminderModalProps) {
 const [medicineName, setMedicineName] = useState('');
 const [medicineType, setMedicineType] = useState<'tablet' | 'capsule' | 'syrup'>('tablet');
 const [dosage, setDosage] = useState('');
 const [frequency, setFrequency] = useState<'once_daily' | 'twice_daily' | 'thrice_daily' | 'once_weekly' | 'alternate_days'>('once_daily');
 const [times, setTimes] = useState<string[]>(['09:00']);
 const [specificDays, setSpecificDays] = useState<number[]>([]);
 const [totalQuantity, setTotalQuantity] = useState<number | ''>('');
 const [tabletsPerDose, setTabletsPerDose] = useState<number>(1);
 const [refillAlertDays, setRefillAlertDays] = useState<number>(2);
 const [notes, setNotes] = useState('');
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 let numTimes = 1;
 if (frequency === 'twice_daily') numTimes = 2;
 if (frequency === 'thrice_daily') numTimes = 3;
 setTimes(prev => {
 const newTimes = [...prev];
 while (newTimes.length < numTimes) newTimes.push('09:00');
 return newTimes.slice(0, numTimes);
 });
 }, [frequency]);

 // Reset form when modal opens
 useEffect(() => {
 if (isOpen) {
 setMedicineName('');
 setMedicineType('tablet');
 setDosage('');
 setFrequency('once_daily');
 setTimes(['09:00']);
 setSpecificDays([]);
 setTotalQuantity('');
 setTabletsPerDose(1);
 setRefillAlertDays(2);
 setNotes('');
 setError(null);
 }
 }, [isOpen]);

 if (!isOpen) return null;

 const handleTimeChange = (index: number, value: string) => {
 const newTimes = [...times];
 newTimes[index] = value;
 setTimes(newTimes);
 };

 const handleDayToggle = (day: number) => {
 setSpecificDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
 );
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);

 if (!medicineName.trim()) {
 setError('Medicine name is required.');
 return;
 }
 if (!dosage.trim()) {
 setError('Dosage is required.');
 return;
 }
 if (!frequency) {
 setError('Frequency is required.');
 return;
 }
 if (times.some(t => !t)) {
 setError('All time inputs must be filled.');
 return;
 }
 if (frequency === 'once_weekly' && specificDays.length === 0) {
 setError('Please select at least one day of the week.');
 return;
 }
 if (totalQuantity === '' || totalQuantity <= 0) {
 setError('Total quantity must be valid and greater than zero.');
 return;
 }

 const newReminder: Partial<IReminder> = {
 medicineName,
 medicineType,
 dosage,
 frequency,
 times,
 specificDays: frequency === 'once_weekly' ? specificDays : [],
 totalQuantity: Number(totalQuantity),
 remainingQuantity: Number(totalQuantity),
 tabletsPerDose,
 refillAlertDays,
 notes
 };

 onAdd(newReminder);
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 {/* Backdrop */}
 <div className="absolute inset-0 bg-gray-900"
 onClick={onClose}
 />
 {/* Modal */}
 <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
 <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Reminder</h2>
 {error && (
 <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-200">
 {error}
 </div>
 )}

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name <span className="text-red-500">*</span></label>
 <input type="text"
 value={medicineName}
 onChange={(e) => setMedicineName(e.target.value)}
 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
 placeholder="e.g. Paracetamol"
 />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Type</label>
 <select value={medicineType}
 onChange={(e) => setMedicineType(e.target.value as any)}
 className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
 >
 <option value="tablet">Tablet</option>
 <option value="capsule">Capsule</option>
 <option value="syrup">Syrup</option>
 </select>
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Dosage <span className="text-red-500">*</span></label>
 <input type="text"
 value={dosage}
 onChange={(e) => setDosage(e.target.value)}
 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
 placeholder="e.g. 500mg"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Frequency <span className="text-red-500">*</span></label>
 <select value={frequency}
 onChange={(e) => setFrequency(e.target.value as any)}
 className="w-full border border-gray-300 rounded-lg p-2.5 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
 >
 <option value="once_daily">Once daily</option>
 <option value="twice_daily">Twice daily</option>
 <option value="thrice_daily">Three times daily</option>
 <option value="once_weekly">Once a week</option>
 <option value="alternate_days">Alternate days</option>
 </select>
 </div>

 {frequency === 'once_weekly' && (
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Select Days</label>
 <div className="flex flex-wrap gap-2">
 {DAYS_OF_WEEK.map(day => (
 <button
 key={day.value}
 type="button"
 onClick={() => handleDayToggle(day.value)}
 className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
 specificDays.includes(day.value) ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
 }`}
 >
 {day.label}
 </button>
 ))}
 </div>
 </div>
 )}

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Times <span className="text-red-500">*</span></label>
 <div className="flex flex-wrap gap-3">
 {times.map((t, i) => (
 <input
 key={i}
 type="time"
 value={t}
 onChange={(e) => handleTimeChange(i, e.target.value)}
 className="border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 ))}
 </div>
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity <span className="text-red-500">*</span></label>
 <input type="number"
 min="1"
 value={totalQuantity}
 onChange={(e) => setTotalQuantity(Number(e.target.value) || '')}
 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
 placeholder="How many tablets do you have?"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Tablets per dose</label>
 <input type="number"
 min="1"
 step="0.5"
 value={tabletsPerDose}
 onChange={(e) => setTabletsPerDose(Number(e.target.value))}
 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">
 Alert me <input type="number" min="1" value={refillAlertDays} onChange={(e) => setRefillAlertDays(Number(e.target.value))} className="w-16 mx-2 border-b border-gray-400 text-center focus:border-emerald-500 outline-none" /> days before running out
 </label>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
 <textarea value={notes}
 onChange={(e) => setNotes(e.target.value)}
 className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
 rows={3}
 placeholder="e.g. Take after meals"
 />
 </div>

 <div className="flex gap-3 pt-4 border-t border-gray-100">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md"
 >
 Add Reminder
 </button>
 </div>
 </form>
 </div>
 </div>
 );
}
