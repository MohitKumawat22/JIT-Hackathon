import { IReminder } from"@/models/Reminder";

export function daysOfSupplyLeft(reminder: IReminder): number {
 if (reminder.remainingQuantity === undefined || reminder.tabletsPerDose === undefined) return 0;
 let dosesPerDay = 1; // Default
 switch (reminder.frequency) {
 case 'once_daily':
 dosesPerDay = 1;
 break;
 case 'twice_daily':
 dosesPerDay = 2;
 break;
 case 'thrice_daily':
 dosesPerDay = 3;
 break;
 case 'once_weekly':
 dosesPerDay = 1 / 7;
 break;
 case 'alternate_days':
 dosesPerDay = 0.5;
 break;
 }
 return Math.floor(reminder.remainingQuantity / (dosesPerDay * reminder.tabletsPerDose));
}

export function needsRefillAlert(reminder: IReminder): boolean {
 if (reminder.refillAlertDays === undefined) return false;
 return daysOfSupplyLeft(reminder) <= reminder.refillAlertDays;
}

export function frequencyLabel(frequency: string): string {
 const labels: Record<string, string> = {
 once_daily:"Once daily",
 twice_daily:"Twice daily",
 thrice_daily:"Thrice daily",
 once_weekly:"Once a week",
 alternate_days:"Alternate days"
 };
 return labels[frequency] || frequency;
}

export function nextDoseLabel(times: string[]): string {
 if (!times || times.length === 0) return"Not scheduled";
 const now = new Date();
 const currentMinutes = now.getHours() * 60 + now.getMinutes();
 const sortedTimes = [...times].sort();
 for (const time of sortedTimes) {
 const [hours, minutes] = time.split(':').map(Number);
 const timeMinutes = hours * 60 + minutes;
 if (timeMinutes > currentMinutes) {
 const diffMinutes = timeMinutes - currentMinutes;
 const h = Math.floor(diffMinutes / 60);
 const m = diffMinutes % 60;
 if (h > 0) {
 return `in ${h}h ${m > 0 ? m + 'm' : ''}`.trim();
 }
 return `in ${m}m`;
 }
 }
 return"tomorrow";
}

export function adherencePercent(takenLog: IReminder["takenLog"]): number {
 if (!takenLog || takenLog.length === 0) return 100;
 const takenCount = takenLog.filter(log => log.status === 'taken').length;
 return Math.round((takenCount / takenLog.length) * 100);
}
