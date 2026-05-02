"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const SPECIALTIES = ["Cardiologist", "General", "Dermatologist", "Orthopedic", "Pediatrician", "Neurologist"];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIMES = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];

export default function DoctorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    specialty: "General",
    hospital: "",
    bio: "",
    photo: "",
    availableSlots: [] as { day: string; time: string; isBooked: boolean }[],
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated" || (session?.user as any)?.role !== "doctor") {
      router.push("/login");
    }
  }, [status, session, router]);

  const toggleSlot = (day: string, time: string) => {
    const exists = formData.availableSlots.find((s) => s.day === day && s.time === time);
    if (exists) {
      setFormData({
        ...formData,
        availableSlots: formData.availableSlots.filter((s) => !(s.day === day && s.time === time)),
      });
    } else {
      setFormData({
        ...formData,
        availableSlots: [...formData.availableSlots, { day, time, isBooked: false }],
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/doctors/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage("✅ Profile saved successfully!");
      } else {
        setMessage("❌ Failed to save profile.");
      }
    } catch (err) {
      setMessage("❌ Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Professional Profile</h1>
        
        <form onSubmit={handleSave} className="space-y-8">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Specialty</label>
                <select
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                >
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hospital/Clinic Name</label>
                <input
                  type="text"
                  required
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                  placeholder="City General Hospital"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Professional Bio</label>
                <textarea
                  required
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell patients about your experience..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Availability</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="p-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">{day.slice(0, 3)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIMES.map((time) => (
                    <tr key={time} className="border-t border-gray-50">
                      <td className="p-3 text-sm font-bold text-gray-600">{time}</td>
                      {DAYS.map((day) => {
                        const isSelected = formData.availableSlots.some((s) => s.day === day && s.time === time);
                        return (
                          <td key={day} className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSlot(day, time)}
                              className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center font-bold text-xs ${
                                isSelected ? "bg-blue-600 text-white shadow-md scale-105" : "bg-gray-50 text-gray-300 hover:bg-blue-50 hover:text-blue-400"
                              }`}
                            >
                              {isSelected ? "✓" : "+"}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className={`text-sm font-bold ${message.includes("✅") ? "text-green-600" : "text-red-600"}`}>{message}</p>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0F1C2E] text-white px-10 py-4 rounded-2xl font-bold hover:bg-[#1a2f4a] shadow-xl transition-all transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Professional Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
