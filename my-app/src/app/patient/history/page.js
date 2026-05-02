"use client";

import Link from "next/link";
import { useState } from "react";

/* ────────────────────────────────────────────────────────────
   Dummy timeline data
   ──────────────────────────────────────────────────────────── */
const PATIENT = {
  name: "Arjun Mehta",
  id: "PAT-20250417-0042",
  age: 28,
  blood: "B+",
  joined: "Apr 2025",
  avatar: "AM",
};

const TIMELINE = [
  {
    id: 1,
    type: "triage",
    date: "2025-05-01T14:30:00",
    title: "AI Triage — Chest Discomfort",
    severity: "critical",
    symptoms: ["Chest tightness", "Shortness of breath", "Dizziness"],
    transcript: [
      { role: "user", text: "I have chest tightness and I'm feeling dizzy" },
      { role: "bot", text: "This could indicate a cardiac issue. Please call 112 immediately or visit the nearest ER." },
    ],
    recommendation: "Visit nearest hospital emergency department immediately.",
    lang: "English",
  },
  {
    id: 2,
    type: "booking",
    date: "2025-05-01T15:10:00",
    title: "Booked — Apollo Multispeciality Hospital",
    facility: "Apollo Multispeciality Hospital",
    address: "154, Bannerghatta Rd, Bangalore 560076",
    department: "Cardiology — Emergency",
    status: "completed",
    doctor: "Dr. Priya Sharma",
    notes: "ECG normal, prescribed rest and follow-up in 1 week.",
  },
  {
    id: 3,
    type: "triage",
    date: "2025-04-24T09:15:00",
    title: "AI Triage — Fever & Body Ache",
    severity: "moderate",
    symptoms: ["Fever 101°F", "Body ache", "Fatigue", "Chills"],
    transcript: [
      { role: "user", text: "I have fever since yesterday with body pain and chills" },
      { role: "bot", text: "Take paracetamol 500mg every 6 hours, stay hydrated with ORS. Monitor for 24-48 hours." },
    ],
    recommendation: "Rest and take fluids. Monitor for 24–48 hours.",
    lang: "Hindi",
  },
  {
    id: 4,
    type: "booking",
    date: "2025-04-25T11:00:00",
    title: "Booked — MedPlus Family Clinic",
    facility: "MedPlus Family Clinic",
    address: "23, 1st Cross, Koramangala, Bangalore 560034",
    department: "General Medicine",
    status: "completed",
    doctor: "Dr. Rahul Verma",
    notes: "Viral fever diagnosed, prescribed Dolo 650 and electrolyte sachets for 5 days.",
  },
  {
    id: 5,
    type: "triage",
    date: "2025-04-18T20:45:00",
    title: "AI Triage — Persistent Headache",
    severity: "low",
    symptoms: ["Headache", "Eye strain", "Neck stiffness"],
    transcript: [
      { role: "user", text: "I have a headache that won't go away, my eyes feel strained" },
      { role: "bot", text: "Likely a tension headache. Take ibuprofen 400mg, rest in a dark room, and avoid screens." },
    ],
    recommendation: "Rest and take fluids. Likely tension headache — should resolve within hours.",
    lang: "English",
  },
  {
    id: 6,
    type: "triage",
    date: "2025-04-10T16:30:00",
    title: "AI Triage — Stomach Cramps",
    severity: "moderate",
    symptoms: ["Stomach cramps", "Nausea", "Loss of appetite"],
    transcript: [
      { role: "user", text: "Having stomach cramps and feeling nauseous since morning" },
      { role: "bot", text: "Sip ORS frequently, follow BRAT diet. Avoid spicy and fatty food for 24 hours." },
    ],
    recommendation: "Rest, hydrate with ORS, and follow a bland diet. Monitor for 24 hours.",
    lang: "English",
  },
  {
    id: 7,
    type: "booking",
    date: "2025-04-11T10:30:00",
    title: "Booked — Pristyn Care Clinic",
    facility: "Pristyn Care Clinic",
    address: "45, Indiranagar Double Rd, Bangalore 560038",
    department: "Gastroenterology",
    status: "cancelled",
    doctor: "Dr. Ananya Rao",
    notes: "Patient recovered before appointment — cancelled.",
  },
  {
    id: 8,
    type: "triage",
    date: "2025-03-28T22:15:00",
    title: "AI Triage — Anxiety & Insomnia",
    severity: "moderate",
    symptoms: ["Anxiety", "Difficulty sleeping", "Racing thoughts", "Restlessness"],
    transcript: [
      { role: "user", text: "I can't sleep, my mind keeps racing and I feel anxious all the time" },
      { role: "bot", text: "Try box breathing (4-4-4-4). Ground yourself by naming 5 things you see. Consider scheduling a teleconsultation." },
    ],
    recommendation: "Practice breathing exercises and consider scheduling a teleconsultation with a counselor.",
    lang: "English",
  },
  {
    id: 9,
    type: "booking",
    date: "2025-03-30T14:00:00",
    title: "Booked — Manipal Hospital (Teleconsult)",
    facility: "Manipal Hospital — Old Airport Road",
    address: "98, HAL Old Airport Rd, Bangalore 560017",
    department: "Psychiatry — Teleconsultation",
    status: "completed",
    doctor: "Dr. Meera Iyer",
    notes: "Diagnosed with mild anxiety disorder. Prescribed lifestyle changes and follow-up in 2 weeks.",
  },
];

/* ────────────────────────────────────────────────────────────
   Helper components
   ──────────────────────────────────────────────────────────── */
const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/12", dot: "bg-red-400", border: "border-red-500/20" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/12", dot: "bg-orange-400", border: "border-orange-500/20" },
  moderate: { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/12", dot: "bg-yellow-400", border: "border-yellow-500/20" },
  low: { label: "Low", color: "text-green-400", bg: "bg-green-500/12", dot: "bg-green-400", border: "border-green-500/20" },
};

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-500/12" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/12" },
  upcoming: { label: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/12" },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function groupByMonth(items) {
  const groups = {};
  for (const item of items) {
    const key = new Date(item.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return Object.entries(groups);
}

/* ────────────────────────────────────────────────────────────
   Page component
   ──────────────────────────────────────────────────────────── */
export default function PatientHistoryPage() {
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const filtered = TIMELINE.filter(
    (e) => filterType === "all" || e.type === filterType
  );
  const grouped = groupByMonth(filtered);

  // Stats
  const totalTriages = TIMELINE.filter((e) => e.type === "triage").length;
  const totalBookings = TIMELINE.filter((e) => e.type === "booking").length;
  const completedVisits = TIMELINE.filter((e) => e.type === "booking" && e.status === "completed").length;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
            <span className="text-[#0a0f1a] text-sm font-bold">+</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Connect</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/patient/triage" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">AI Triage</Link>
          <Link href="/patient/locate" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">Find Hospital</Link>
          <Link href="/patient/login" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">Sign Out</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* ──────────────────────────────────
           LEFT SIDEBAR — Patient Profile
           ────────────────────────────────── */}
        <aside className="lg:w-[300px] xl:w-[320px] p-6 border-b lg:border-b-0 lg:border-r border-border shrink-0">
          {/* Avatar + Name */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-primary">{PATIENT.avatar}</span>
            </div>
            <h1 className="text-lg font-bold">{PATIENT.name}</h1>
            <p className="text-xs text-text-muted font-mono mt-1">{PATIENT.id}</p>
          </div>

          {/* Info pills */}
          <div className="grid grid-cols-3 gap-2 mb-6">
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-0.5">Age</p>
              <p className="text-sm font-semibold">{PATIENT.age}</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-0.5">Blood</p>
              <p className="text-sm font-semibold text-red-400">{PATIENT.blood}</p>
            </div>
            <div className="glass rounded-xl p-3 text-center">
              <p className="text-xs text-text-muted mb-0.5">Since</p>
              <p className="text-sm font-semibold">{PATIENT.joined}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-6">
            <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-sm">🤖</span>
                </div>
                <span className="text-sm text-text-secondary">AI Triages</span>
              </div>
              <span className="text-sm font-bold text-primary">{totalTriages}</span>
            </div>
            <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <span className="text-sm">🏥</span>
                </div>
                <span className="text-sm text-text-secondary">Bookings</span>
              </div>
              <span className="text-sm font-bold text-secondary">{totalBookings}</span>
            </div>
            <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <span className="text-sm">✅</span>
                </div>
                <span className="text-sm text-text-secondary">Visits Done</span>
              </div>
              <span className="text-sm font-bold text-green-400">{completedVisits}</span>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <Link href="/patient/triage" className="btn-primary w-full text-sm py-2.5 no-underline">
              New AI Triage
            </Link>
            <Link href="/patient/locate" className="btn-secondary w-full text-sm py-2.5 no-underline">
              Find Hospital
            </Link>
          </div>
        </aside>

        {/* ──────────────────────────────────
           MAIN — Timeline
           ────────────────────────────────── */}
        <section className="flex-1 flex flex-col min-w-0">
          {/* Filter bar */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Health Timeline</h2>
            <div className="flex gap-1.5">
              {[
                { value: "all", label: "All" },
                { value: "triage", label: "Triages" },
                { value: "booking", label: "Bookings" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  id={`filter-${opt.value}`}
                  onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === opt.value
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-surface text-text-muted border border-border hover:border-border-hover"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline list */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {grouped.map(([monthLabel, items]) => (
              <div key={monthLabel} className="mb-8">
                {/* Month header */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{monthLabel}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Timeline items */}
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-4">
                    {items.map((entry) => {
                      const isExpanded = expandedId === entry.id;
                      const isTriage = entry.type === "triage";
                      const sev = isTriage ? SEVERITY_CONFIG[entry.severity] : null;
                      const stat = !isTriage ? STATUS_CONFIG[entry.status] : null;

                      return (
                        <div key={entry.id} className="relative pl-10">
                          {/* Timeline dot */}
                          <div className={`absolute left-[10px] top-5 w-3 h-3 rounded-full border-2 border-background z-10 ${
                            isTriage
                              ? (sev?.dot || "bg-primary")
                              : stat?.color === "text-green-400" ? "bg-green-400" : stat?.color === "text-red-400" ? "bg-red-400" : "bg-blue-400"
                          }`} />

                          {/* Card */}
                          <div
                            id={`timeline-${entry.id}`}
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            className={`glass rounded-xl p-4 cursor-pointer transition-all hover:bg-surface-hover ${
                              isExpanded ? "ring-1 ring-primary/20" : ""
                            }`}
                          >
                            {/* Header row */}
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm">{isTriage ? "🤖" : "🏥"}</span>
                                  <h3 className="text-sm font-semibold truncate">{entry.title}</h3>
                                </div>
                                <p className="text-xs text-text-muted">
                                  {formatDate(entry.date)} at {formatTime(entry.date)}
                                </p>
                              </div>

                              {/* Badge */}
                              {isTriage && sev && (
                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                  {sev.label}
                                </span>
                              )}
                              {!isTriage && stat && (
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.color}`}>
                                  {stat.label}
                                </span>
                              )}
                            </div>

                            {/* Triage summary (always visible) */}
                            {isTriage && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {entry.symptoms.map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-text-muted">{s}</span>
                                ))}
                              </div>
                            )}

                            {/* Booking summary (always visible) */}
                            {!isTriage && (
                              <p className="text-xs text-text-muted mb-1">{entry.department} • {entry.doctor}</p>
                            )}

                            {/* Recommendation line (always visible for triage) */}
                            {isTriage && (
                              <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${sev?.bg} ${sev?.color} border ${sev?.border}`}>
                                💊 {entry.recommendation}
                              </div>
                            )}

                            {/* Expanded content */}
                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                                {isTriage && (
                                  <>
                                    <p className="text-xs text-text-muted">
                                      Language: <span className="text-text-secondary">{entry.lang}</span>
                                    </p>

                                    {/* Mini transcript */}
                                    <div>
                                      <p className="text-xs font-medium text-text-secondary mb-2">Conversation Excerpt</p>
                                      <div className="space-y-2">
                                        {entry.transcript.map((msg, i) => (
                                          <div
                                            key={i}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                          >
                                            <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                                              msg.role === "user"
                                                ? "bg-primary/10 border border-primary/15 text-text-secondary"
                                                : "bg-surface border border-border text-text-secondary"
                                            }`}>
                                              {msg.text}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </>
                                )}

                                {!isTriage && (
                                  <>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-text-muted mb-0.5">Facility</p>
                                        <p className="text-xs text-text-secondary font-medium">{entry.facility}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-text-muted mb-0.5">Doctor</p>
                                        <p className="text-xs text-text-secondary font-medium">{entry.doctor}</p>
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-xs text-text-muted mb-0.5">Address</p>
                                      <p className="text-xs text-text-secondary">{entry.address}</p>
                                    </div>
                                    {entry.notes && (
                                      <div className="rounded-lg bg-surface border border-border px-3 py-2">
                                        <p className="text-xs text-text-muted mb-0.5">Doctor Notes</p>
                                        <p className="text-xs text-text-secondary leading-relaxed">{entry.notes}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            {/* Expand hint */}
                            <div className="mt-2 text-right">
                              <span className="text-xs text-text-muted">
                                {isExpanded ? "▲ Collapse" : "▼ Details"}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-text-muted">No history entries match this filter.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
