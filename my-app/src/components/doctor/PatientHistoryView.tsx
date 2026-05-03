"use client";

import React from"react";
import {
 ArrowLeft,
 Calendar,
 Clock,
 FileText,
 Heart,
 Pill,
 Shield,
 Stethoscope,
 User,
 Zap,
 AlertTriangle,
 Activity,
 Globe2,
} from"lucide-react";

interface PatientData {
 id: string;
 name: string;
 age: number;
 gender: string;
 severity:"critical" |"high" |"medium" |"low";
 triageScore: number;
 originalLanguage: string;
 originalSymptoms: string[];
 translatedSymptoms: string[];
 aiSummary: string;
 timestamp: string;
 vitalSigns: { label: string; value: string; status: string };
 location: string;
}

interface Props {
 patient: PatientData;
 onBack: () => void;
}

const PAST_DIAGNOSES = [
 { date:"2026-03-15", diagnosis:"Acute Bronchitis", doctor:"Dr. Mehta", status:"Resolved" },
 { date:"2025-11-02", diagnosis:"Type 2 Diabetes — Monitoring", doctor:"Dr. Singh", status:"Ongoing" },
 { date:"2025-08-20", diagnosis:"Hypertension Stage 1", doctor:"Dr. Rajan", status:"Managed" },
 { date:"2025-04-10", diagnosis:"Seasonal Allergic Rhinitis", doctor:"Dr. Patel", status:"Resolved" },
];

const PAST_TRIAGE = [
 { date:"2026-03-15", score: 45, severity:"medium" as const, chief:"Persistent cough, mild fever", outcome:"Antibiotics prescribed" },
 { date:"2025-11-02", score: 62, severity:"high" as const, chief:"Excessive thirst, frequent urination", outcome:"HbA1c ordered, Metformin started" },
 { date:"2025-08-20", score: 55, severity:"medium" as const, chief:"Headaches, elevated BP readings", outcome:"Amlodipine 5mg initiated" },
];

const MEDICATIONS = [
 { name:"Metformin 500mg", frequency:"Twice daily", prescriber:"Dr. Singh", since:"Nov 2025", active: true },
 { name:"Amlodipine 5mg", frequency:"Once daily", prescriber:"Dr. Rajan", since:"Aug 2025", active: true },
 { name:"Cetirizine 10mg", frequency:"As needed", prescriber:"Dr. Patel", since:"Apr 2025", active: false },
 { name:"Amoxicillin 500mg", frequency:"Three times daily", prescriber:"Dr. Mehta", since:"Mar 2026", active: false },
];

const sevColors: Record<string, { badge: string; dot: string }> = {
 critical: { badge:"bg-red-500/20 text-red-300 border-red-500/30", dot:"bg-red-500" },
 high: { badge:"bg-orange-500/20 text-orange-300 border-orange-500/30", dot:"bg-orange-500" },
 medium: { badge:"bg-yellow-500/20 text-yellow-300 border-yellow-500/30", dot:"bg-yellow-500" },
 low: { badge:"bg-emerald-500/20 text-emerald-300 border-emerald-500/30", dot:"bg-emerald-500" },
};

export default function PatientHistoryView({ patient, onBack }: Props) {
 const sev = sevColors[patient.severity];

 return (
 <div className="min-h-screen bg-[#0B0F1A]">
 {/* ambient */}
 <div className="fixed inset-0 pointer-events-none">
 <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
 <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-600/8 rounded-full blur-[100px]" />
 </div>

 <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
 {/* back button */}
 <button
 onClick={onBack}
 className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 group transition-colors"
 >
 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
 Back to Dashboard
 </button>

 {/* ── patient header ── */}
 <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6 mb-6">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
 <div className="flex items-center gap-4">
 <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-600/30">
 {patient.name.split("").map((n: string) => n[0]).join("")}
 </div>
 <div>
 <div className="flex items-center gap-3 mb-1">
 <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
 <span className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border ${sev.badge}`}>
 {patient.severity.toUpperCase()}
 </span>
 </div>
 <div className="flex items-center gap-3 text-sm text-slate-400">
 <span>{patient.id}</span>
 <span>•</span>
 <span>{patient.age}y {patient.gender}</span>
 <span>•</span>
 <span className="flex items-center gap-1">
 <Globe2 className="w-3.5 h-3.5" />
 {patient.originalLanguage}
 </span>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-3">
 <div className="text-right">
 <p className="text-xs text-slate-400">Triage Score</p>
 <p className="text-3xl font-bold text-white">{patient.triageScore}</p>
 </div>
 <div className="text-right">
 <p className="text-xs text-slate-400">Location</p>
 <p className="text-sm text-slate-300">{patient.location}</p>
 </div>
 </div>
 </div>

 {/* current AI summary */}
 <div className="mt-5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
 <div className="flex items-center gap-2 mb-2">
 <Zap className="w-4 h-4 text-emerald-400" />
 <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Current AI Triage Assessment</span>
 </div>
 <p className="text-sm text-emerald-200/90 leading-relaxed">{patient.aiSummary}</p>
 </div>
 </div>

 {/* ── grid layout ── */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

 {/* Past Diagnoses */}
 <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-5">
 <div className="p-2 rounded-lg to-teal-600">
 <FileText className="w-4 h-4 text-white" />
 </div>
 <h2 className="text-lg font-semibold text-white">Past Diagnoses</h2>
 </div>
 <div className="space-y-3">
 {PAST_DIAGNOSES.map((d, i) => (
 <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
 <div className="flex items-start justify-between mb-1">
 <h3 className="text-sm font-medium text-white">{d.diagnosis}</h3>
 <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
 d.status ==="Resolved" ?"bg-emerald-500/15 text-emerald-400" :
 d.status ==="Ongoing" ?"bg-orange-500/15 text-orange-400" :"bg-cyan-500/15 text-cyan-400"
 }`}>{d.status}</span>
 </div>
 <div className="flex items-center gap-2 text-xs text-slate-400">
 <Calendar className="w-3 h-3" /> {d.date}
 <span>•</span>
 <User className="w-3 h-3" /> {d.doctor}
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Past Triage Reports */}
 <div className="bg-slate-900 border border-white/[0.06] rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-5">
 <div className="p-2 rounded-lg to-orange-600">
 <Activity className="w-4 h-4 text-white" />
 </div>
 <h2 className="text-lg font-semibold text-white">Triage History</h2>
 </div>
 <div className="space-y-3">
 {PAST_TRIAGE.map((t, i) => {
 const tc = sevColors[t.severity];
 return (
 <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
 <div className="flex items-center justify-between mb-2">
 <div className="flex items-center gap-2">
 <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
 <span className="text-sm font-medium text-white">Score: {t.score}</span>
 <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${tc.badge}`}>
 {t.severity.toUpperCase()}
 </span>
 </div>
 <span className="text-xs text-slate-400 flex items-center gap-1">
 <Calendar className="w-3 h-3" /> {t.date}
 </span>
 </div>
 <p className="text-xs text-slate-300 mb-1"><span className="text-slate-500">Chief complaint:</span> {t.chief}</p>
 <p className="text-xs text-slate-300"><span className="text-slate-500">Outcome:</span> {t.outcome}</p>
 </div>
 );
 })}
 </div>
 </div>

 {/* Current Medications */}
 <div className="lg:col-span-2 bg-slate-900 border border-white/[0.06] rounded-2xl p-6">
 <div className="flex items-center gap-2 mb-5">
 <div className="p-2 rounded-lg to-pink-600">
 <Pill className="w-4 h-4 text-white" />
 </div>
 <h2 className="text-lg font-semibold text-white">Medications</h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-white/[0.06]">
 <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Medication</th>
 <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Frequency</th>
 <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Prescriber</th>
 <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Since</th>
 <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-slate-400 font-medium">Status</th>
 </tr>
 </thead>
 <tbody>
 {MEDICATIONS.map((m, i) => (
 <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
 <td className="py-3 px-4 text-white font-medium">{m.name}</td>
 <td className="py-3 px-4 text-slate-300">{m.frequency}</td>
 <td className="py-3 px-4 text-slate-300">{m.prescriber}</td>
 <td className="py-3 px-4 text-slate-400">{m.since}</td>
 <td className="py-3 px-4">
 <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
 m.active ?"bg-emerald-500/15 text-emerald-400" :"bg-slate-500/15 text-slate-400"
 }`}>
 {m.active ?"Active" :"Completed"}
 </span>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>

 {/* Security footer */}
 <div className="lg:col-span-2 bg-slate-900 border border-white/[0.04] rounded-xl p-4 flex items-center gap-3">
 <Shield className="w-5 h-5 text-emerald-500" />
 <div>
 <p className="text-xs text-emerald-400 font-medium">HIPAA-Compliant Secure View</p>
 <p className="text-[11px] text-slate-500">All patient data is encrypted in transit and at rest. Access logged for audit trail. Session expires in 15 minutes.</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
