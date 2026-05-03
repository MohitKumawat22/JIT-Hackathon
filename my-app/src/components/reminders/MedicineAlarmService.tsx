"use client";

import { useEffect, useState, useRef } from"react";

export default function MedicineAlarmService() {
 const [reminders, setReminders] = useState([]);
 const [activeAlarms, setActiveAlarms] = useState([]);
 const [dismissedAlarms, setDismissedAlarms] = useState([]);
 const audioRef = useRef(null);

 // Initialize Audio
 useEffect(() => {
 audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
 audioRef.current.loop = true;

 // Request Notification Permission
 if ("Notification" in window && Notification.permission ==="default") {
 Notification.requestPermission();
 }
 }, []);

 // Fetch reminders periodically
 useEffect(() => {
 const fetchReminders = async () => {
 const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (!stored?.id) return;

 try {
 const res = await fetch(`/api/reminders?patientId=${stored.id}`);
 const data = await res.json();
 setReminders(data.reminders || []);
 } catch (err) {
 console.error("Failed to fetch reminders for alarm:", err);
 }
 };

 fetchReminders();
 const interval = setInterval(fetchReminders, 60000); // Every minute
 return () => clearInterval(interval);
 }, []);

 // Check for due reminders
 useEffect(() => {
 const checkAlarms = () => {
 const now = new Date();
 const currentTime = now.toLocaleTimeString("en-GB", { hour:"2-digit", minute:"2-digit", hour12: false });
 reminders.forEach((med) => {
 if (!med.isActive) return;

 med.times.forEach((time) => {
 const alarmId = `${med._id}-${time}-${now.getHours()}-${now.getMinutes()}`;
 // Trigger if time matches AND not already active AND not already dismissed
 if (time === currentTime && !activeAlarms.some(a => a.id === alarmId) && !dismissedAlarms.includes(alarmId)) {
 triggerAlarm(med, time, alarmId);
 }
 });
 });

 // Clear dismissed alarms every hour or when minute changes to keep it clean
 if (now.getSeconds() === 0) {
 // Optional: clear old dismissed alarms here if needed, // but since alarmId includes minute, they naturally won't match next minute
 }
 };

 const interval = setInterval(checkAlarms, 10000); // Check every 10 seconds
 return () => clearInterval(interval);
 }, [reminders, activeAlarms, dismissedAlarms]);

 const triggerAlarm = (med, time, alarmId) => {
 setActiveAlarms((prev) => [...prev, { id: alarmId, medName: med.medicineName }]);
 // Play sound
 audioRef.current?.play().catch(e => console.log("Audio play blocked", e));

 // Browser Notification
 if ("Notification" in window && Notification.permission ==="granted") {
 const notification = new Notification("💊 Medicine Time!", {
 body: `It's time to take your ${med.medicineName} (${med.dosage})`,
 icon:"/favicon.ico",
 tag:"medicine-alarm",
 requireInteraction: true
 });

 notification.onclick = () => {
 window.focus();
 stopAlarm();
 };
 }
 };

 const stopAlarm = () => {
 if (audioRef.current) {
 audioRef.current.pause();
 audioRef.current.currentTime = 0;
 }
 // Mark all currently active alarms as dismissed
 setDismissedAlarms(prev => [...prev, ...activeAlarms.map(a => a.id)]);
 setActiveAlarms([]);
 };

 if (activeAlarms.length === 0) return null;

 return (
 <div className="fixed inset-x-0 top-0 z-[9999] p-4 flex justify-center animate-bounce">
 <div className="bg-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-white">
 <div className="text-3xl animate-pulse">🔔</div>
 <div>
 <h4 className="font-bold">Medicine Reminder!</h4>
 <p className="text-sm opacity-90">Please take your medicine now.</p>
 </div>
 <button onClick={stopAlarm}
 className="ml-4 bg-white text-red-600 px-4 py-2 rounded-xl font-bold hover:bg-gray-100 transition-colors"
 >
 I've Taken It
 </button>
 </div>
 </div>
 );
}
