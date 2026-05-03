"use client";
import { useState, useEffect, useCallback } from"react";

export function useReminders(patientId) {
 const [reminders, setReminders] = useState([]);
 const [loading, setLoading] = useState(true);

 const fetchReminders = useCallback(async () => {
 if (!patientId) return;
 try {
 const res = await fetch(`/api/reminders?patientId=${patientId}`);
 const data = await res.json();
 setReminders(data.reminders || []);
 } catch (err) {
 console.error("Failed to load reminders:", err);
 } finally {
 setLoading(false);
 }
 }, [patientId]);

 useEffect(() => {
 fetchReminders();
 }, [fetchReminders]);

 const markTaken = async (reminderId, scheduledTime, status) => {
 try {
 const res = await fetch("/api/reminders/mark-taken", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ reminderId, scheduledTime, status }),
 });
 if (res.ok) {
 fetchReminders();
 }
 } catch (err) {
 console.error("Failed to mark dose:", err);
 }
 };

 return { reminders, loading, fetchReminders, markTaken };
}
