import React from 'react';
import { IReminder } from '@/models/Reminder';
import { 
  frequencyLabel, 
  daysOfSupplyLeft, 
  needsRefillAlert, 
  adherencePercent 
} from '@/lib/reminderUtils';

interface MedicineCardProps {
  reminder: IReminder;
  onMarkTaken: (reminderId: string) => void;
  onDelete: (reminderId: string) => void;
}

export default function MedicineCard({ reminder, onMarkTaken, onDelete }: MedicineCardProps) {
  const adherence = adherencePercent(reminder.takenLog);
  const supplyDays = daysOfSupplyLeft(reminder);
  const isRefillAlert = needsRefillAlert(reminder);
  
  const progressPercent = Math.min(100, Math.max(0, (reminder.remainingQuantity / reminder.totalQuantity) * 100));
  
  let progressColor = "bg-green-500";
  if (progressPercent <= 30 && progressPercent >= 10) {
    progressColor = "bg-orange-500";
  } else if (progressPercent < 10) {
    progressColor = "bg-red-500";
  }

  const reminderId = (reminder._id || reminder.id) as string;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{reminder.medicineName}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {reminder.dosage} • {reminder.medicineType}
          </p>
        </div>
        <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
          {adherence}% Adherence
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700">{frequencyLabel(reminder.frequency)}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {reminder.times.map((time, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md border border-gray-200">
              {time}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>{reminder.remainingQuantity} tablets left ({supplyDays} days)</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`${progressColor} h-2 rounded-full transition-all duration-300`} 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {isRefillAlert && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Refill soon — only {supplyDays} days left!
          </p>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => onMarkTaken(reminderId)}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Mark Taken
        </button>
        <button
          onClick={() => onDelete(reminderId)}
          className="bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600 font-semibold py-2 px-4 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
