"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

/* ────────────────────────────────────────────────────────────
   Helper components
   ──────────────────────────────────────────────────────────── */
const SEVERITY_CONFIG = {
  critical: { label: "Critical", color: "text-red-400", bg: "bg-red-500/12", dot: "bg-red-400", border: "border-red-500/20" },
  high: { label: "High", color: "text-orange-400", bg: "bg-orange-500/12", dot: "bg-orange-400", border: "border-orange-500/20" },
  moderate: { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/12", dot: "bg-yellow-400", border: "border-yellow-500/20" },
  low: { label: "Low", color: "text-green-400", bg: "bg-green-500/12", dot: "bg-green-400", border: "border-green-500/20" },
  info: { label: "Info", color: "text-blue-400", bg: "bg-blue-500/12", dot: "bg-blue-400", border: "border-blue-500/20" },
};

const STATUS_CONFIG = {
  completed: { label: "Completed", color: "text-green-400", bg: "bg-green-500/12" },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/12" },
  upcoming: { label: "Upcoming", color: "text-blue-400", bg: "bg-blue-500/12" },
};

const CALL_STATUS_CONFIG = {
  scheduled:   { label: "Scheduled",   color: "text-blue-400",   bg: "bg-blue-500/12",   dot: "bg-blue-400" },
  "in-progress": { label: "In Progress", color: "text-purple-400", bg: "bg-purple-500/12", dot: "bg-purple-400 animate-pulse" },
  completed:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-500/12",  dot: "bg-green-400" },
  failed:      { label: "Failed",      color: "text-red-400",    bg: "bg-red-500/12",    dot: "bg-red-400" },
  cancelled:   { label: "Cancelled",   color: "text-gray-400",   bg: "bg-gray-500/12",   dot: "bg-gray-400" },
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
  const [patient, setPatient] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCalls, setTotalCalls] = useState(0);
  const [refillCount, setRefillCount] = useState(0);

  // Fetch data from MongoDB on mount
  useEffect(() => {
    async function loadData() {
      try {
        const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
        if (!stored?.id) {
          setLoading(false);
          return;
        }

        // Fetch profile, triages, bookings, and calls in parallel
        const [profileRes, triageRes, bookingRes, callRes] = await Promise.all([
          fetch(`/api/patient/profile?patientId=${stored.id}`),
          fetch(`/api/triage?patientId=${stored.id}`),
          fetch(`/api/bookings?patientId=${stored.id}`),
          fetch(`/api/calls?patientId=${stored.id}`),
        ]);

        const profileData = await profileRes.json();
        const triageData = await triageRes.json();
        const bookingData = await bookingRes.json();
        const callData = await callRes.json();

        // Fetch reminders separately so it doesn't block main data loading
        fetch(`/api/reminders?patientId=${stored.id}`)
          .then(res => res.json())
          .then(data => {
            const meds = data.reminders || [];
            const count = meds.filter(m => m.remainingQuantity <= (m.tabletsPerDose * m.refillAlertDays * m.dailyDoses)).length;
            setRefillCount(count);
          })
          .catch(err => console.error(err));

        // Set patient info
        if (profileData.patient) {
          setPatient(profileData.patient);
        }

        // Build unified timeline
        const entries = [];

        // Add triage entries
        for (const t of triageData.triages || []) {
          entries.push({
            id: t._id,
            type: "triage",
            date: t.createdAt,
            title: t.title,
            severity: t.severity,
            symptoms: t.symptoms || [],
            transcript: t.transcript || [],
            recommendation: t.recommendation || "",
            lang: t.lang || "en",
          });
        }

        // Add booking entries
        for (const b of bookingData.bookings || []) {
          entries.push({
            id: b._id,
            type: "booking",
            date: b.createdAt,
            title: `Booked — ${b.facilityName}`,
            facility: b.facilityName,
            address: b.address || "",
            department: b.department || "General",
            status: b.status || "upcoming",
            rating: b.rating,
            notes: b.notes || "",
          });
        }

        // Add call entries
        for (const c of callData.calls || []) {
          entries.push({
            id: c._id,
            type: "call",
            date: c.scheduledAt,
            title: `AI Health Call`,
            callStatus: c.status,
            severity: c.severity,
            summary: c.summary || "",
            notes: c.notes || "",
          });
        }
        setTotalCalls((callData.calls || []).length);

        // Sort by date descending
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTimeline(entries);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filtered = timeline.filter(
    (e) => filterType === "all" || e.type === filterType
  );
  const grouped = groupByMonth(filtered);

  const totalTriages = timeline.filter((e) => e.type === "triage").length;
  const totalBookings = timeline.filter((e) => e.type === "booking").length;
  const completedVisits = timeline.filter((e) => e.type === "booking" && e.status === "completed").length;

  const patientName = patient ? `${patient.firstName} ${patient.lastName}` : "Patient";
  const patientAvatar = patient ? `${patient.firstName?.[0] || ""}${patient.lastName?.[0] || ""}` : "?";

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Amrit<span className="text-[#10B981]">Care</span> <span className="text-xs font-medium text-[#059669] bg-[#D1FAE5] px-1.5 py-0.5 rounded-md ml-0.5">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/patient/triage" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">AI Triage</Link>
          <Link href="/patient/locate" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">Find Hospital</Link>
          <Link href="/reminders" className="relative text-sm text-text-muted hover:text-foreground transition-colors no-underline flex items-center">
            💊 Reminders
            {refillCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {refillCount}
              </span>
            )}
          </Link>
          <Link href="/patient/login" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">Sign Out</Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* ── LEFT SIDEBAR — Patient Profile ── */}
        <aside className="lg:w-[300px] xl:w-[320px] p-6 border-b lg:border-b-0 lg:border-r border-border shrink-0">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-surface mx-auto" />
              <div className="h-5 bg-surface rounded w-3/4 mx-auto" />
              <div className="h-3 bg-surface rounded w-1/2 mx-auto" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface rounded-xl" />)}
              </div>
            </div>
          ) : !patient ? (
            <div className="text-center py-8">
              <p className="text-text-muted text-sm mb-4">Please log in to view your profile.</p>
              <Link href="/patient/login" className="btn-primary text-sm px-6 py-2.5 no-underline">Sign In</Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-primary">{patientAvatar}</span>
                </div>
                <h1 className="text-lg font-bold">{patientName}</h1>
                <p className="text-xs text-text-muted font-mono mt-1">{patient.email}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Age</p>
                  <p className="text-sm font-semibold">{patient.age || "—"}</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Blood</p>
                  <p className="text-sm font-semibold text-red-400">{patient.blood || "—"}</p>
                </div>
                <div className="glass rounded-xl p-3 text-center">
                  <p className="text-xs text-text-muted mb-0.5">Since</p>
                  <p className="text-sm font-semibold">
                    {new Date(patient.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><span className="text-sm">🤖</span></div>
                    <span className="text-sm text-text-secondary">AI Triages</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{totalTriages}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center"><span className="text-sm">🏥</span></div>
                    <span className="text-sm text-text-secondary">Bookings</span>
                  </div>
                  <span className="text-sm font-bold text-secondary">{totalBookings}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><span className="text-sm">✅</span></div>
                    <span className="text-sm text-text-secondary">Visits Done</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">{completedVisits}</span>
                </div>
                <div className="flex items-center justify-between glass rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><span className="text-sm">📞</span></div>
                    <span className="text-sm text-text-secondary">AI Calls</span>
                  </div>
                  <span className="text-sm font-bold text-blue-400">{totalCalls}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Link href="/patient/triage" className="btn-primary w-full text-sm py-2.5 no-underline">New AI Triage</Link>
                <Link href="/patient/locate" className="btn-secondary w-full text-sm py-2.5 no-underline">Find Hospital</Link>
              </div>
            </>
          )}
        </aside>

        {/* ── MAIN — Timeline ── */}
        <section className="flex-1 flex flex-col min-w-0">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Health Timeline</h2>
            <div className="flex gap-1.5">
              {[
                { value: "all", label: "All" },
                { value: "triage", label: "Triages" },
                { value: "booking", label: "Bookings" },
                { value: "call", label: "Calls" },
              ].map((opt) => (
                <button key={opt.value} id={`filter-${opt.value}`} onClick={() => setFilterType(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterType === opt.value
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-surface text-text-muted border border-border hover:border-border-hover"
                  }`}>{opt.label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="glass rounded-xl p-4">
                    <div className="h-4 bg-surface rounded w-2/3 mb-2" />
                    <div className="h-3 bg-surface rounded w-1/3 mb-3" />
                    <div className="flex gap-2">
                      <div className="h-5 bg-surface rounded-full w-20" />
                      <div className="h-5 bg-surface rounded-full w-16" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && timeline.length === 0 && (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-3xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">No history yet</h3>
                <p className="text-sm text-text-muted mb-6 max-w-xs mx-auto">
                  Start your first AI triage conversation or find a hospital nearby to begin building your health timeline.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/patient/triage" className="btn-primary text-sm px-6 py-2.5 no-underline">Start AI Triage</Link>
                  <Link href="/patient/locate" className="btn-secondary text-sm px-6 py-2.5 no-underline">Find Hospital</Link>
                </div>
              </div>
            )}

            {/* Timeline */}
            {!loading && grouped.map(([monthLabel, items]) => (
              <div key={monthLabel} className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">{monthLabel}</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="relative">
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-4">
                    {items.map((entry) => {
                      const isExpanded = expandedId === entry.id;
                      const isTriage = entry.type === "triage";
                      const isCall = entry.type === "call";
                      const sev = (isTriage || isCall) ? SEVERITY_CONFIG[entry.severity] : null;
                      const stat = !isTriage && !isCall ? STATUS_CONFIG[entry.status] : null;
                      const callSt = isCall ? CALL_STATUS_CONFIG[entry.callStatus] : null;
                      const isAlertCall = isCall && ["critical", "high"].includes(entry.severity) && entry.callStatus === "completed";

                      return (
                        <div key={entry.id} className="relative pl-10">
                          <div className={`absolute left-[10px] top-5 w-3 h-3 rounded-full border-2 border-background z-10 ${
                            isCall
                              ? (callSt?.dot || "bg-blue-400")
                              : isTriage
                              ? (sev?.dot || "bg-primary")
                              : stat?.color === "text-green-400" ? "bg-green-400" : stat?.color === "text-red-400" ? "bg-red-400" : "bg-blue-400"
                          }`} />

                          <div id={`timeline-${entry.id}`}
                            onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            className={`glass rounded-xl p-4 cursor-pointer transition-all hover:bg-surface-hover ${
                              isExpanded ? "ring-1 ring-primary/20" : ""
                            } ${isAlertCall ? "ring-1 ring-red-500/30" : ""}`}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-sm">{isCall ? "📞" : isTriage ? "🤖" : "🏥"}</span>
                                  <h3 className="text-sm font-semibold truncate">{entry.title}</h3>
                                </div>
                                <p className="text-xs text-text-muted">
                                  {formatDate(entry.date)} at {formatTime(entry.date)}
                                </p>
                              </div>
                              {/* Triage severity badge */}
                              {isTriage && sev && (
                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                                  {sev.label}
                                </span>
                              )}
                              {/* Booking status badge */}
                              {!isTriage && !isCall && stat && (
                                <span className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.color}`}>
                                  {stat.label}
                                </span>
                              )}
                              {/* Call status badge */}
                              {isCall && callSt && (
                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${callSt.bg} ${callSt.color}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${callSt.dot}`} />
                                  {callSt.label}
                                </span>
                              )}
                              {/* Call severity badge (only on completed calls) */}
                              {isCall && entry.callStatus === "completed" && sev && (
                                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.color}`}>
                                  {entry.severity === "critical" || entry.severity === "high" ? "⚠️ " : ""}{sev.label}
                                </span>
                              )}
                            </div>

                            {/* Call notes */}
                            {isCall && entry.notes && (
                              <p className="text-xs text-text-muted mb-1">💬 {entry.notes}</p>
                            )}

                            {isTriage && entry.symptoms.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-2">
                                {entry.symptoms.map((s) => (
                                  <span key={s} className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-text-muted">{s}</span>
                                ))}
                              </div>
                            )}

                            {!isTriage && !isCall && (
                              <p className="text-xs text-text-muted mb-1">{entry.department} • {entry.facility}</p>
                            )}

                            {isTriage && entry.recommendation && (
                              <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${sev?.bg} ${sev?.color} border ${sev?.border}`}>
                                💊 {entry.recommendation.slice(0, 150)}{entry.recommendation.length > 150 ? "..." : ""}
                              </div>
                            )}

                            {/* Call summary preview */}
                            {isCall && entry.callStatus === "completed" && entry.summary && (
                              <div className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${sev?.bg || "bg-blue-500/12"} ${sev?.color || "text-blue-400"} border ${sev?.border || "border-blue-500/20"}`}>
                                📋 {entry.summary.slice(0, 150)}{entry.summary.length > 150 ? "..." : ""}
                              </div>
                            )}

                            {isExpanded && (
                              <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                                {/* Call details expanded */}
                                {isCall && (
                                  <>
                                    {entry.summary && (
                                      <div>
                                        <p className="text-xs font-medium text-text-secondary mb-1">Call Summary</p>
                                        <p className="text-xs text-text-secondary leading-relaxed bg-surface border border-border rounded-xl px-3 py-2">{entry.summary}</p>
                                      </div>
                                    )}
                                    {!entry.summary && (
                                      <p className="text-xs text-text-muted">
                                        {entry.callStatus === "scheduled" ? "Awaiting call…" :
                                          entry.callStatus === "in-progress" ? "Call in progress…" :
                                          entry.callStatus === "failed" ? "Call could not be connected." :
                                          "Call was cancelled."}
                                      </p>
                                    )}
                                  </>
                                )}
                                {isTriage && (
                                  <>
                                    <p className="text-xs text-text-muted">
                                      Language: <span className="text-text-secondary">{entry.lang}</span>
                                    </p>
                                    {entry.transcript.length > 0 && (
                                      <div>
                                        <p className="text-xs font-medium text-text-secondary mb-2">Conversation Excerpt</p>
                                        <div className="space-y-2">
                                          {entry.transcript.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs ${
                                                msg.role === "user"
                                                  ? "bg-primary/10 border border-primary/15 text-text-secondary"
                                                  : "bg-surface border border-border text-text-secondary"
                                              }`}>{msg.text.slice(0, 200)}{msg.text.length > 200 ? "..." : ""}</div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                                {!isTriage && !isCall && (
                                  <>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div>
                                        <p className="text-xs text-text-muted mb-0.5">Facility</p>
                                        <p className="text-xs text-text-secondary font-medium">{entry.facility}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-text-muted mb-0.5">Status</p>
                                        <p className="text-xs text-text-secondary font-medium capitalize">{entry.status}</p>
                                      </div>
                                    </div>
                                    {entry.address && (
                                      <div>
                                        <p className="text-xs text-text-muted mb-0.5">Address</p>
                                        <p className="text-xs text-text-secondary">{entry.address}</p>
                                      </div>
                                    )}
                                    {entry.notes && (
                                      <div className="rounded-lg bg-surface border border-border px-3 py-2">
                                        <p className="text-xs text-text-muted mb-0.5">Notes</p>
                                        <p className="text-xs text-text-secondary leading-relaxed">{entry.notes}</p>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            <div className="mt-2 text-right">
                              <span className="text-xs text-text-muted">{isExpanded ? "▲ Collapse" : "▼ Details"}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {!loading && filtered.length === 0 && timeline.length > 0 && (
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
