"use client";
import { useEffect, useRef, useCallback } from"react";

export function useAlarmScheduler(reminders, onAlarm) {
 const intervalRef = useRef(null);
 const firedRef = useRef(new Set());

 const checkAlarms = useCallback(() => {
 const now = new Date();
 const currentTime = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
 const currentDay = now.getDay(); // 0 = Sunday

 reminders.forEach((reminder) => {
 if (!reminder.isActive) return;
 if (reminder.remainingQuantity <= 0) return;

 // Check if today is a valid day for this reminder
 if (reminder.specificDays && reminder.specificDays.length > 0) {
 if (!reminder.specificDays.includes(currentDay)) return;
 }

 reminder.times.forEach((time) => {
 const alarmKey = `${reminder._id}-${time}-${now.toDateString()}`;

 if (currentTime === time && !firedRef.current.has(alarmKey)) {
 firedRef.current.add(alarmKey);
 onAlarm(reminder);
 // Clear fired key after 2 mins so it doesn't re-fire
 setTimeout(() => firedRef.current.delete(alarmKey), 120_000);
 }
 });
 });
 }, [reminders, onAlarm]);

 useEffect(() => {
 intervalRef.current = setInterval(checkAlarms, 30_000); // check every 30s
 checkAlarms(); // also check immediately on mount
 return () => {
 if (intervalRef.current) clearInterval(intervalRef.current);
 };
 }, [checkAlarms]);
}
