"use client";
import { useEffect, useCallback } from"react";

export function useNotification() {
 useEffect(() => {
 if (typeof window !=="undefined" &&"Notification" in window) {
 if (Notification.permission ==="default") {
 Notification.requestPermission();
 }
 }
 }, []);

 const sendNotification = useCallback(
 (title, body, icon ="/pill-icon.png") => {
 if (Notification.permission ==="granted") {
 new Notification(title, { body, icon });
 }
 },
 []
 );

 return { sendNotification };
}
