"use client";

import React, { useState } from "react";
import {
  Activity, AlertTriangle, Bell, ChevronDown, ChevronRight,
  Clock, Eye, Filter, Globe2, Heart, Languages, Search,
  Shield, Stethoscope, TrendingUp, Zap,
} from "lucide-react";
import PatientHistoryView from "@/components/doctor/PatientHistoryView";
import { MOCK_CASES, severityConfig, PatientCase } from "./data";

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, trend, color }: {
  icon: React.ElementType; label: string; value: string; trend?: string; color: string;
}) {
  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${color} opacity-0 group-hover:opacity-100 blur transition-all duration-500`} />
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.12] transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend && (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />{trend}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ── Triage Score Ring ── */
function TriageScoreRing({ score, severity }: { score: number; severity: string }) {
  const r = 28, c = 2 * Math.PI * r, off = c - (score / 100) * c;
  const col: Record<string, string> = { critical: "#ef4444", high: "#f97316", medium: "#eab308", low: "#10b981" };
  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={col[severity]} strokeWidth="4"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          className="transition-all duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

/* ── Patient Card ── */
function PatientCard({ patient, showOriginal, onSelect }: {
  patient: PatientCase; showOriginal: boolean; onSelect: (p: PatientCase) => void;
}) {
  const sev = severityConfig[patient.severity];
  return (
    <button onClick={() => onSelect(patient)}
      className={`group relative w-full text-left rounded-2xl border ${sev.border} ${sev.bg} backdrop-blur-xl p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] cursor-pointer`}>
      {patient.severity === "critical" && (
        <span className="absolute top-4 right-4 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </span>
      )}
      <div className="flex gap-4">
        <TriageScoreRing score={patient.triageScore} severity={patient.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-white font-semibold text-base truncate">{patient.name}</h3>
            <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full ${sev.badge}`}>{sev.label}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
            <span>{patient.id}</span><span>•</span>
            <span>{patient.age}y {patient.gender}</span><span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{patient.timestamp}</span>
          </div>
          {/* AI summary */}
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[10px] uppercase tracking-wider text-violet-400 font-semibold">AI Triage Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{patient.aiSummary}</p>
          </div>
          {/* symptoms */}
          <div className="flex flex-wrap gap-1.5">
            {patient.translatedSymptoms.map((s, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-700/50 text-slate-300 border border-white/[0.06]">{s}</span>
            ))}
          </div>
          {showOriginal && (
            <div className="mt-2 flex items-start gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3">
              <Globe2 className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold block mb-1">
                  Original — {patient.originalLanguage}
                </span>
                {patient.originalSymptoms.map((s, i) => (
                  <p key={i} className="text-xs text-indigo-200/80" dir="auto">{s}</p>
                ))}
              </div>
            </div>
          )}
          {/* footer */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.04]">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                patient.vitalSigns.status === "danger" ? "bg-red-500/15 text-red-400" :
                patient.vitalSigns.status === "warning" ? "bg-yellow-500/15 text-yellow-400" :
                "bg-emerald-500/15 text-emerald-400"}`}>
                <Heart className="w-3 h-3" />{patient.vitalSigns.label}: {patient.vitalSigns.value}
              </span>
              <span className="text-slate-500">|</span>
              <span>{patient.location}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </button>
  );
}

/* ══════════════ Page ══════════════ */
export default function DoctorDashboard() {
  const [showOriginal, setShowOriginal] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientCase | null>(null);

  const filtered = MOCK_CASES
    .filter(c => (filterSeverity === "all" || c.severity === filterSeverity) &&
      (searchQuery === "" || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => b.triageScore - a.triageScore);

  const stats = {
    total: MOCK_CASES.length,
    critical: MOCK_CASES.filter(c => c.severity === "critical").length,
    high: MOCK_CASES.filter(c => c.severity === "high").length,
  };

  if (selectedPatient) return <PatientHistoryView patient={selectedPatient} onBack={() => setSelectedPatient(null)} />;

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-cyan-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0F1A]/80 backdrop-blur-2xl">
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-700/30">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Doctor Dashboard</h1>
                <p className="text-xs text-slate-400">AI-Powered Triage Review • Real-time</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] transition-colors">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.06]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">DR</div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">Dr. Rajan</p>
                  <p className="text-xs text-slate-400">Emergency Medicine</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1440px] mx-auto px-6 py-8 space-y-8">
          {/* stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Activity} label="Total Active Cases" value={String(stats.total)} trend="+3 today" color="from-violet-600 to-indigo-600" />
            <StatCard icon={AlertTriangle} label="Critical Priority" value={String(stats.critical)} color="from-red-600 to-rose-600" />
            <StatCard icon={Shield} label="High Priority" value={String(stats.high)} color="from-orange-600 to-amber-600" />
            <StatCard icon={Clock} label="Awaiting Review" value={String(stats.total)} trend="Live" color="from-cyan-600 to-teal-600" />
          </div>

          {/* toolbar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" placeholder="Search patients..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all w-64" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                  className="pl-10 pr-8 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white appearance-none focus:outline-none focus:border-violet-500/50 transition-all cursor-pointer">
                  <option value="all" className="bg-slate-900">All Severities</option>
                  <option value="critical" className="bg-slate-900">Critical</option>
                  <option value="high" className="bg-slate-900">High</option>
                  <option value="medium" className="bg-slate-900">Medium</option>
                  <option value="low" className="bg-slate-900">Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>
            {/* language toggle */}
            <button onClick={() => setShowOriginal(p => !p)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 ${
                showOriginal ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-lg shadow-indigo-500/10"
                : "bg-white/[0.04] border-white/[0.06] text-slate-400 hover:bg-white/[0.08]"}`}>
              <Languages className="w-4 h-4" />
              <span>{showOriginal ? "Hide" : "Show"} Original Language</span>
              <div className={`relative w-9 h-5 rounded-full transition-colors ${showOriginal ? "bg-indigo-500" : "bg-slate-600"}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${showOriginal ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
            </button>
          </div>

          {/* case grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {filtered.map(p => <PatientCard key={p.id} patient={p} showOriginal={showOriginal} onSelect={setSelectedPatient} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-lg text-slate-400 font-medium">No patients match your filters</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting the severity filter or search query</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
