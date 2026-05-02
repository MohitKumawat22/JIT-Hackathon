"use client";

import { useState, useEffect, useRef } from "react";

export default function MedicineReminder({ patientId }) {
  const [reminders, setReminders] = useState([]);
  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [activeAlarm, setActiveAlarm] = useState(null);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchReminders();
  }, [patientId]);

  const fetchReminders = async () => {
    if (!patientId) return;
    const res = await fetch(`/api/reminders?patientId=${patientId}`);
    const data = await res.json();
    setReminders(data.reminders || []);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const current = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      reminders.forEach(r => {
        if (r.isActive && r.time === current && !activeAlarm) {
          setActiveAlarm(r);
          if (audioRef.current) audioRef.current.play().catch(e => console.log("Audio blocked", e));
        }
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [reminders, activeAlarm]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name || !time) return;
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patientId, medicineName: name, time, isActive: true }),
    });
    if (res.ok) {
      setName(""); setTime(""); fetchReminders();
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/reminders?id=${id}`, { method: "DELETE" });
    fetchReminders();
  };

  const handleToggle = async (id, current) => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !current }),
    });
    fetchReminders();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" loop />
      
      {activeAlarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-600/90 backdrop-blur-md p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-bounce">
            <h2 className="text-3xl font-black text-gray-900 mb-4">Time for Medicine!</h2>
            <p className="text-xl font-bold text-red-600 mb-8">{activeAlarm.medicineName}</p>
            <button 
              onClick={() => { setActiveAlarm(null); if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; } }}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl shadow-lg"
            >
              I've Taken It
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-xl">💊</div>
        <div>
          <h2 className="text-sm font-bold text-gray-800">Medicine Alarms</h2>
          <p className="text-xs text-gray-400">Set a simple reminder for your meds</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input 
          placeholder="Medicine name" 
          value={name} 
          onChange={e => setName(e.target.value)}
          className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <input 
          type="time" 
          value={time} 
          onChange={e => setTime(e.target.value)}
          className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all">+</button>
      </form>

      <div className="space-y-2">
        {reminders.map(r => (
          <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm font-bold text-gray-800">{r.medicineName}</p>
              <p className="text-xs text-gray-500">at {r.time}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggle(r._id, r.isActive)} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${r.isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                {r.isActive ? 'On' : 'Off'}
              </button>
              <button onClick={() => handleDelete(r._id)} className="text-gray-300 hover:text-red-500">×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
