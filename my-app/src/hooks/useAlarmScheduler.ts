"use client";

import { useEffect, useRef } from 'react';
import { IReminder } from '@/models/Reminder';

export function useAlarmScheduler(
 reminders: IReminder[],
 onAlarm: (reminder: IReminder) => void
) {
 const firedAlarms = useRef<Set<string>>(new Set());

 useEffect(() => {
 const checkAlarms = () => {
 const now = new Date();
 const currentHours = now.getHours().toString().padStart(2, '0');
 const currentMinutes = now.getMinutes().toString().padStart(2, '0');
 const currentTime = `${currentHours}:${currentMinutes}`;
 const currentDay = now.getDay();
 const dateString = now.toDateString();

 reminders.forEach((reminder) => {
 if (!reminder.isActive) return;
 if (reminder.remainingQuantity !== undefined && reminder.remainingQuantity <= 0) {
 return;
 }

 if (reminder.frequency === 'once_weekly' && reminder.specificDays && reminder.specificDays.length > 0) {
 if (!reminder.specificDays.includes(currentDay)) {
 return;
 }
 }

 if (reminder.times && reminder.times.includes(currentTime)) {
 const reminderId = reminder._id || (reminder as any).id;
 const alarmKey = `${reminderId}-${currentTime}-${dateString}`;

 if (!firedAlarms.current.has(alarmKey)) {
 firedAlarms.current.add(alarmKey);
 onAlarm(reminder);

 setTimeout(() => {
 firedAlarms.current.delete(alarmKey);
 }, 90000);
 }
 }
 });
 };

 checkAlarms();
 const intervalId = setInterval(checkAlarms, 30000);

 return () => clearInterval(intervalId);
 }, [reminders, onAlarm]);
}
