"use client";

import { useState, useEffect, useCallback } from"react";

/* ─── Config ─── */
const SEVERITY_CONFIG = {
 critical: { label:"Critical", color:"text-red-500", bg:"bg-red-50", border:"border-red-200", icon:"🚨" },
 high: { label:"High", color:"text-orange-500", bg:"bg-orange-50", border:"border-orange-200", icon:"" },
 moderate: { label:"Moderate", color:"text-yellow-600", bg:"bg-yellow-50", border:"border-yellow-200", icon:"🟡" },
 low: { label:"Low", color:"text-green-600", bg:"bg-green-50", border:"border-green-200", icon:"✅" },
 info: { label:"Info", color:"text-emerald-500", bg:"bg-emerald-50", border:"border-emerald-200", icon:"" },
};

const STATUS_CONFIG = {
 scheduled: { label:"Scheduled", color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500" },"in-progress": { label:"In Progress", color:"text-emerald-600", bg:"bg-emerald-50", border:"border-emerald-200", dot:"bg-emerald-500 animate-pulse" },
 completed: { label:"Completed", color:"text-green-600", bg:"bg-green-50", border:"border-green-200", dot:"bg-green-500" },
 failed: { label:"Failed", color:"text-red-500", bg:"bg-red-50", border:"border-red-200", dot:"bg-red-500" },
 cancelled: { label:"Cancelled", color:"text-gray-400", bg:"bg-gray-50", border:"border-gray-200", dot:"bg-gray-400" },
};

function formatDateTime(iso) {
 return new Date(iso).toLocaleString("en-IN", {
 day:"numeric", month:"short", year:"numeric",
 hour:"2-digit", minute:"2-digit", hour12: true,
 });
}

/* ─── Mini Schedule Form ─────────────────────────────────────── */
const RECURRENCE_OPTIONS = [
 { value:"one-time", label:"One-Time", icon:"1" },
 { value:"weekly", label:"Weekly", icon:"📆" },
 { value:"monthly", label:"Monthly", icon:"🗓" },
];

function ScheduleForm({ patientId, onScheduled }) {
 const [datetime, setDatetime] = useState("");
 const [notes, setNotes] = useState("");
 const [phone, setPhone] = useState("");
 const [name, setName] = useState("");
 const [recurrence, setRecurrence] = useState("one-time");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");

 const minDatetime = (() => {
 const d = new Date(Date.now() + 5 * 60 * 1000);
 return d.toISOString().slice(0, 16);
 })();

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");
 if (!datetime) return setError("Please select a date and time.");
 if (!phone.trim()) return setError("Please enter a mobile number.");

 setLoading(true);
 try {
 const res = await fetch("/api/calls", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 patientId,
 scheduledAt: new Date(datetime).toISOString(),
 notes,
 recurrence,
 overridePhone: phone.trim().startsWith("+") ? phone.trim() : `+91${phone.trim()}`,
 overrideName: name.trim() || null,
 }),
 });
 const data = await res.json();
 if (!res.ok) throw new Error(data.error ||"Failed to schedule call.");
 setDatetime(""); setNotes(""); setPhone(""); setName(""); setRecurrence("one-time");
 onScheduled(data.call);
 } catch (err) {
 setError(err.message);
 } finally {
 setLoading(false);
 }
 };

 return (
 <form onSubmit={handleSubmit} className="space-y-4">
 {/* Row: Name + Phone */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
 👤 Patient Name (optional)
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="e.g. Rahul Sharma"
 className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50"
 />
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
 📱 Mobile Number <span className="text-red-400">*</span>
 </label>
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="+91 9XXXXXXXXX"
 className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50"
 />
 </div>
 </div>

 {/* Date & Time */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
  When should we call?
 </label>
 <input
 type="datetime-local"
 value={datetime}
 min={minDatetime}
 onChange={(e) => setDatetime(e.target.value)}
 className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50"
 />
 </div>

 {/* Recurrence */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
 🔁 Repeat
 </label>
 <div className="flex gap-2">
 {RECURRENCE_OPTIONS.map((opt) => (
 <button
 key={opt.value}
 type="button"
 onClick={() => setRecurrence(opt.value)}
 className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
 recurrence === opt.value
 ?"bg-emerald-600 text-white border-emerald-600 shadow-sm"
 :"bg-white text-gray-500 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"
 }`}
 >
 {opt.icon} {opt.label}
 </button>
 ))}
 </div>
 {recurrence !=="one-time" && (
 <p className="text-xs text-emerald-500 mt-1.5 pl-1">
 ↻ AmritCare will auto-schedule the next {recurrence} call after each one completes.
 </p>
 )}
 </div>

 {/* Notes */}
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1.5">
 📝 Notes / Symptoms (optional)
 </label>
 <textarea
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 rows={3}
 placeholder="e.g. I've had a headache for 2 days and feeling tired…"
 className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 bg-gray-50 resize-none"
 />
 </div>

 {error && (
 <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
 {error}
 </p>
 )}

 <button
 type="submit"
 disabled={loading}
 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
 >
 {loading ? (
 <>
 <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
 </svg>
 Scheduling…
 </>
 ) : (
 <> Schedule AI Health Call</>
 )}
 </button>
 </form>
 );
}

/* ─── Call Card ──────────────────────────────────────────────── */
function CallCard({ call, onCancel }) {
 const [expanded, setExpanded] = useState(false);
 const [cancelling, setCancelling] = useState(false);

 const st = STATUS_CONFIG[call.status] || STATUS_CONFIG.info;
 const sev = call.severity ? SEVERITY_CONFIG[call.severity] : null;
 const isAlert = ["critical","high"].includes(call.severity) && call.status ==="completed";

 const handleCancel = async (e) => {
 e.stopPropagation();
 if (!confirm("Cancel this scheduled call?")) return;
 setCancelling(true);
 try {
 const res = await fetch(`/api/calls?id=${call._id}`, { method:"DELETE" });
 if (res.ok) onCancel(call._id);
 } catch (err) {
 console.error(err);
 } finally {
 setCancelling(false);
 }
 };

 return (
 <div
 className={`rounded-2xl border transition-all ${
 isAlert ? `${sev?.border} ring-1 ring-red-400/30` :"border-gray-100"
 } bg-white shadow-sm`}
 >
 {/* Alert banner for critical/high severity completed calls */}
 {isAlert && (
 <div className={`${sev?.bg} ${sev?.border} border-b px-4 py-2 rounded-t-2xl flex items-center gap-2`}>
 <span>{sev?.icon}</span>
 <span className={`text-xs font-semibold ${sev?.color}`}>
 {sev?.label} severity — review recommended
 </span>
 </div>
 )}

 <div
 className="p-4 cursor-pointer"
 onClick={() => setExpanded((p) => !p)}
 >
 <div className="flex items-start justify-between gap-3">
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 mb-1 flex-wrap">
 <span className="text-lg"></span>
 <span className="text-sm font-semibold text-gray-800">
 {call.overrideName ? call.overrideName :"AI Health Call"}
 </span>
 {/* Recurrence badge */}
 {call.recurrence && call.recurrence !=="one-time" && (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
 🔁 {call.recurrence ==="weekly" ?"Weekly" :"Monthly"}
 </span>
 )}
 {/* Status badge */}
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${st.bg} ${st.color} border ${st.border}`}>
 <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
 {st.label}
 </span>
 </div>
 <p className="text-xs text-gray-500">
 🗓 {formatDateTime(call.scheduledAt)}
 </p>
 {call.overridePhone && (
 <p className="text-xs text-gray-400 mt-0.5">📱 {call.overridePhone}</p>
 )}
 {call.notes && (
 <p className="text-xs text-gray-400 mt-1 truncate"> {call.notes}</p>
 )}
 </div>

 <div className="flex items-center gap-2 shrink-0">
 {sev && call.status ==="completed" && (
 <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${sev.bg} ${sev.color} border ${sev.border}`}>
 {sev.icon} {sev.label}
 </span>
 )}
 {call.status ==="scheduled" && (
 <button
 onClick={handleCancel}
 disabled={cancelling}
 className="text-xs text-red-400 hover:text-red-600 border border-red-200 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
 >
 {cancelling ?"…" :"Cancel"}
 </button>
 )}
 <span className="text-gray-300 text-xs">{expanded ?"▲" :"▼"}</span>
 </div>
 </div>
 </div>

 {/* Expanded summary */}
 {expanded && call.status ==="completed" && call.summary && (
 <div className="px-4 pb-4 pt-0 border-t border-gray-100 space-y-3">
 <div>
 <p className="text-xs font-medium text-gray-500 mb-1">Call Summary</p>
 <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-3 border border-gray-100">
 {call.summary}
 </p>
 </div>
 </div>
 )}

 {expanded && call.status !=="completed" && (
 <div className="px-4 pb-4 pt-0 border-t border-gray-100">
 <p className="text-xs text-gray-400 pt-3">
 {call.status ==="scheduled"
 ?"AmritCare will call you at the scheduled time. Make sure your phone is reachable!"
 : call.status ==="in-progress"
 ?"Call is currently in progress…"
 : call.status ==="failed"
 ?"The call could not be connected. Please reschedule."
 :"This call has been cancelled."}
 </p>
 </div>
 )}
 </div>
 );
}

/* ─── Main Component ─────────────────────────────────────────── */
export default function ScheduleCall({ patientId }) {
 const [calls, setCalls] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showForm, setShowForm] = useState(false);
 const [successMsg, setSuccessMsg] = useState("");

 const fetchCalls = useCallback(async () => {
 if (!patientId) return;
 try {
 const res = await fetch(`/api/calls?patientId=${patientId}`);
 const data = await res.json();
 setCalls(data.calls || []);
 } catch (err) {
 console.error("Failed to load calls:", err);
 } finally {
 setLoading(false);
 }
 }, [patientId]);

 useEffect(() => {
 fetchCalls();
 // Auto-refresh every 30s so in-progress calls update
 const interval = setInterval(fetchCalls, 30_000);
 return () => clearInterval(interval);
 }, [fetchCalls]);

 const handleScheduled = (newCall) => {
 setCalls((prev) => [newCall, ...prev]);
 setShowForm(false);
 setSuccessMsg("✅ Call scheduled! AmritCare AI will call you at the selected time.");
 setTimeout(() => setSuccessMsg(""), 5000);
 };

 const handleCancel = (id) => {
 setCalls((prev) => prev.map((c) => (c._id === id ? { ...c, status:"cancelled" } : c)));
 };

 const upcoming = calls.filter((c) => ["scheduled","in-progress"].includes(c.status));
 const past = calls.filter((c) => ["completed","failed","cancelled"].includes(c.status));

 return (
 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
 {/* Header */}
 <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl"></div>
 <div>
 <h2 className="text-sm font-bold text-gray-800">AI Health Calls</h2>
 <p className="text-xs text-gray-400">Schedule a personalized AI checkup call</p>
 </div>
 </div>
 <button
 onClick={() => setShowForm((p) => !p)}
 className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${
 showForm
 ?"bg-gray-100 text-gray-600 hover:bg-gray-200"
 :"bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
 }`}
 >
 {showForm ?"✕ Close" :"+ Schedule Call"}
 </button>
 </div>

 <div className="p-5 space-y-5">
 {/* Success toast */}
 {successMsg && (
 <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
 {successMsg}
 </div>
 )}

 {/* Schedule form */}
 {showForm && (
 <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
 <ScheduleForm patientId={patientId} onScheduled={handleScheduled} />
 </div>
 )}

 {/* Upcoming calls */}
 {upcoming.length > 0 && (
 <div>
 <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Upcoming</h3>
 <div className="space-y-3">
 {upcoming.map((call) => (
 <CallCard key={call._id} call={call} onCancel={handleCancel} />
 ))}
 </div>
 </div>
 )}

 {/* Past calls */}
 {past.length > 0 && (
 <div>
 <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Past Calls</h3>
 <div className="space-y-3">
 {past.map((call) => (
 <CallCard key={call._id} call={call} onCancel={handleCancel} />
 ))}
 </div>
 </div>
 )}

 {/* Empty state */}
 {!loading && calls.length === 0 && !showForm && (
 <div className="text-center py-8">
 <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mx-auto mb-3"></div>
 <p className="text-sm font-medium text-gray-600 mb-1">No calls scheduled yet</p>
 <p className="text-xs text-gray-400 mb-4 max-w-xs mx-auto">
 Schedule a call and AmritCare AI will ring you at the set time for a personal health checkup.
 </p>
 <button
 onClick={() => setShowForm(true)}
 className="text-sm bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
 >
 Schedule My First Call
 </button>
 </div>
 )}

 {loading && (
 <div className="space-y-3 animate-pulse">
 {[1, 2].map((i) => (
 <div key={i} className="rounded-2xl border border-gray-100 bg-gray-50 h-20" />
 ))}
 </div>
 )}
 </div>
 </div>
 );
}
