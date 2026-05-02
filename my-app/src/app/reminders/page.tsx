"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RemindersPage() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const [formData, setFormData] = useState({
    medicineName: "",
    medicineType: "tablet",
    dosage: "",
    frequency: "once_daily",
    times: ["08:00"],
    totalQuantity: 30,
    tabletsPerDose: 1,
    refillAlertDays: 2,
    startDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (!stored?.id) {
      router.push("/patient/login");
      return;
    }
    setPatient(stored);
    fetchReminders(stored.id);
  }, []);

  const fetchReminders = async (patientId) => {
    try {
      const res = await fetch(`/api/reminders?patientId=${patientId}`);
      const data = await res.json();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, patientName: patient.firstName + " " + patient.lastName, patientId: patient.id })
      });
      if (res.ok) {
        setShowAdd(false);
        fetchReminders(patient.id);
        setFormData({
          medicineName: "",
          medicineType: "tablet",
          dosage: "",
          frequency: "once_daily",
          times: ["08:00"],
          totalQuantity: 30,
          tabletsPerDose: 1,
          refillAlertDays: 2,
          startDate: new Date().toISOString().split("T")[0],
          notes: ""
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReminder = async (id, currentStatus) => {
    try {
      await fetch(`/api/reminders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchReminders(patient.id);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteReminder = async (id) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Refresh the list
        fetchReminders(patient.id);
      } else {
        const error = await res.json();
        alert("Error deleting reminder: " + (error.details || error.error));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to server.");
    }
  };

  if (!patient) return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patient/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </Link>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">💊</span> Medicine Reminders
            </h1>
          </div>
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-[#10B981] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add New
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-20 animate-pulse text-gray-400">Loading your reminders...</div>
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="text-5xl mb-4">🔔</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Reminders Set</h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Stay on top of your health! Add your medicines here and we'll notify you when it's time to take them.</p>
            <button onClick={() => setShowAdd(true)} className="text-[#10B981] font-bold hover:underline">Add your first medicine →</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reminders.map((med) => (
              <div key={med._id} className={`bg-white rounded-3xl p-6 border-2 transition-all shadow-sm hover:shadow-md ${med.isActive ? "border-white" : "border-gray-100 opacity-60"}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#F0FDF4] flex items-center justify-center text-2xl">
                      {med.medicineType === "tablet" ? "💊" : med.medicineType === "syrup" ? "🧪" : "💊"}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{med.medicineName}</h3>
                      <p className="text-sm text-gray-500 font-medium">{med.dosage} • {med.frequency.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleReminder(med._id, med.isActive)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${med.isActive ? "bg-[#10B981]/10 text-[#10B981]" : "bg-gray-100 text-gray-400"}`}>
                      {med.isActive ? "🔔" : "🔕"}
                    </button>
                    <button onClick={() => deleteReminder(med._id)} className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {med.times.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-600 border border-gray-100">
                      ⏰ {t}
                    </span>
                  ))}
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-100 h-2 w-24 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${med.remainingQuantity < 5 ? "bg-red-500" : "bg-[#10B981]"}`} 
                        style={{ width: `${(med.remainingQuantity / med.totalQuantity) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{med.remainingQuantity} left</span>
                  </div>
                  {med.remainingQuantity < 5 && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse flex items-center gap-1">
                      ⚠️ Low Stock!
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg p-8 animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Add Medicine</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Medicine Name</label>
                  <input required value={formData.medicineName} onChange={e => setFormData({...formData, medicineName: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" placeholder="e.g. Paracetamol" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Type</label>
                  <select value={formData.medicineType} onChange={e => setFormData({...formData, medicineType: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all">
                    <option value="tablet">Tablet</option>
                    <option value="capsule">Capsule</option>
                    <option value="syrup">Syrup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dosage</label>
                  <input required value={formData.dosage} onChange={e => setFormData({...formData, dosage: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" placeholder="e.g. 500mg" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Frequency & Times</label>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {["once_daily", "twice_daily", "thrice_daily"].map(f => (
                    <button 
                      key={f} 
                      type="button"
                      onClick={() => {
                        const times = f === "once_daily" ? ["08:00"] : f === "twice_daily" ? ["08:00", "20:00"] : ["08:00", "14:00", "20:00"];
                        setFormData({...formData, frequency: f as any, times});
                      }}
                      className={`px-3 py-2.5 rounded-xl text-[10px] font-bold border-2 transition-all ${formData.frequency === f ? "border-[#10B981] bg-[#10B981] text-white" : "border-gray-100 bg-gray-50 text-gray-500 hover:border-[#10B981]/30"}`}
                    >
                      {f.replace("_", " ").toUpperCase()}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {formData.times.map((time, idx) => (
                    <div key={idx}>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Dose {idx + 1}</label>
                      <input 
                        type="time" 
                        value={time} 
                        onChange={(e) => {
                          const newTimes = [...formData.times];
                          newTimes[idx] = e.target.value;
                          setFormData({...formData, times: newTimes});
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#10B981] transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Total Quantity</label>
                  <input type="number" value={isNaN(formData.totalQuantity) ? "" : formData.totalQuantity} onChange={e => setFormData({...formData, totalQuantity: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tablets Per Dose</label>
                  <input type="number" value={formData.tabletsPerDose || 1} onChange={e => setFormData({...formData, tabletsPerDose: parseInt(e.target.value) || 1})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Refill Alert (Days)</label>
                  <input type="number" value={formData.refillAlertDays || 2} onChange={e => setFormData({...formData, refillAlertDays: parseInt(e.target.value) || 2})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-gray-50 border-2 border-transparent focus:border-[#10B981] rounded-2xl px-5 py-3 outline-none transition-all" />
                </div>
              </div>

              <button type="submit" className="w-full bg-[#10B981] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#059669] transition-all shadow-xl shadow-[#10B981]/30">
                Save Reminder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
