"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Bell, BrainCircuit, ChevronRight, Flame,
  Gauge, Globe2, Info, RotateCcw, Save, Settings2,
  Shield, Sliders, Stethoscope, ToggleLeft, ToggleRight,
  Zap, AlertTriangle, Thermometer, HeartPulse, Search,
} from "lucide-react";
import Link from "next/link";

/* ── types ── */
interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  enabled: boolean;
  category: string;
}

interface SliderSetting {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  category: string;
}

/* ── initial state ── */
const INITIAL_TOGGLES: ToggleSetting[] = [
  { id: "auto_escalation", label: "Auto-Escalation for Critical Cases", description: "Automatically escalate patients with triage score ≥ 90 to on-call specialist.", icon: AlertTriangle, enabled: true, category: "Triage Logic" },
  { id: "fever_alert", label: "High Fever Alert", description: "Flag patients with temperature above the configured threshold.", icon: Thermometer, enabled: true, category: "Triage Logic" },
  { id: "keyword_scan", label: "Urgent Keyword Detection", description: "Scan patient symptom descriptions for configurable urgent keywords (e.g. 'chest pain', 'stroke').", icon: Search, enabled: true, category: "Triage Logic" },
  { id: "vital_anomaly", label: "Vital Sign Anomaly Detection", description: "AI monitors for abnormal patterns in vital sign trends over the last 24 hours.", icon: HeartPulse, enabled: false, category: "AI Engine" },
  { id: "multilingual", label: "Multilingual Symptom Translation", description: "Automatically translate patient-reported symptoms from native language to English.", icon: Globe2, enabled: true, category: "Language" },
  { id: "confidence_display", label: "Show AI Confidence Scores", description: "Display the AI model's confidence percentage alongside each triage recommendation.", icon: BrainCircuit, enabled: false, category: "AI Engine" },
  { id: "audit_log", label: "Triage Audit Logging", description: "Log all triage decisions and parameter changes for compliance review.", icon: Shield, enabled: true, category: "Compliance" },
];

const INITIAL_SLIDERS: SliderSetting[] = [
  { id: "fever_threshold", label: "High Fever Threshold", description: "Temperature above which the patient is flagged for fever-related urgency.", icon: Flame, value: 38.5, min: 37.0, max: 41.0, step: 0.1, unit: "°C", category: "Triage Logic" },
  { id: "critical_score", label: "Critical Score Threshold", description: "Triage score at or above which a case is classified as critical.", icon: Gauge, value: 85, min: 50, max: 100, step: 1, unit: "pts", category: "Triage Logic" },
  { id: "high_score", label: "High Priority Threshold", description: "Triage score at or above which a case is classified as high priority.", icon: Gauge, value: 65, min: 30, max: 90, step: 1, unit: "pts", category: "Triage Logic" },
  { id: "ai_sensitivity", label: "AI Sensitivity Level", description: "Controls how aggressively the AI flags potential emergency conditions. Higher = more sensitive.", icon: BrainCircuit, value: 70, min: 0, max: 100, step: 5, unit: "%", category: "AI Engine" },
  { id: "review_window", label: "Auto-Review Window", description: "Time in minutes before an un-reviewed case triggers an alert.", icon: RotateCcw, value: 15, min: 5, max: 60, step: 5, unit: "min", category: "Compliance" },
];

const CATEGORIES = ["All", "Triage Logic", "AI Engine", "Language", "Compliance"];

/* ══════════════ Page ══════════════ */
export default function DoctorSettings() {
  const [toggles, setToggles] = useState(INITIAL_TOGGLES);
  const [sliders, setSliders] = useState(INITIAL_SLIDERS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setToggles(prev => prev.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
    setSaved(false);
  };

  const handleSlider = (id: string, value: number) => {
    setSliders(prev => prev.map(s => s.id === id ? { ...s, value } : s));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    setToggles(INITIAL_TOGGLES);
    setSliders(INITIAL_SLIDERS);
    setSaved(false);
  };

  const filteredToggles = activeCategory === "All" ? toggles : toggles.filter(t => t.category === activeCategory);
  const filteredSliders = activeCategory === "All" ? sliders : sliders.filter(s => s.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* header */}
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0F1A]/80 backdrop-blur-2xl">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-700/30">
                <Settings2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Triage Settings</h1>
                <p className="text-xs text-slate-400">Configure AI triage parameters</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/doctor/dashboard"
                className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
          {/* info banner */}
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-violet-300 font-medium">Agentic AI Configuration</p>
              <p className="text-xs text-violet-200/70 mt-0.5">Changes to these parameters will influence how the AI triage system classifies and prioritises incoming patient cases. Adjustments are logged for audit compliance.</p>
            </div>
          </div>

          {/* category pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                    : "bg-white/[0.04] text-slate-400 border border-white/[0.06] hover:bg-white/[0.08]"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* toggle settings */}
          {filteredToggles.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Toggle Settings</h2>
              <div className="space-y-3">
                {filteredToggles.map(t => (
                  <div key={t.id} className="bg-slate-900/70 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 flex items-center justify-between gap-4 hover:border-white/[0.1] transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${t.enabled ? "bg-violet-500/15" : "bg-white/[0.04]"} transition-colors`}>
                        <t.icon className={`w-5 h-5 ${t.enabled ? "text-violet-400" : "text-slate-500"} transition-colors`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{t.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{t.description}</p>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{t.category}</span>
                      </div>
                    </div>
                    <button onClick={() => handleToggle(t.id)} className="flex-shrink-0">
                      {t.enabled
                        ? <ToggleRight className="w-10 h-10 text-violet-400 hover:text-violet-300 transition-colors" />
                        : <ToggleLeft className="w-10 h-10 text-slate-600 hover:text-slate-400 transition-colors" />}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* slider settings */}
          {filteredSliders.length > 0 && (
            <section>
              <h2 className="text-sm uppercase tracking-wider text-slate-500 font-semibold mb-4">Parameter Sliders</h2>
              <div className="space-y-3">
                {filteredSliders.map(s => (
                  <div key={s.id} className="bg-slate-900/70 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5 hover:border-white/[0.1] transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-600/20 to-teal-600/20">
                        <s.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-medium">{s.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-white">{s.value}</span>
                        <span className="text-sm text-slate-400 ml-1">{s.unit}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-500 w-12 text-right">{s.min}{s.unit}</span>
                      <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                        onChange={e => handleSlider(s.id, parseFloat(e.target.value))}
                        className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-slate-700
                          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-violet-500
                          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-violet-500/30
                          [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-violet-300
                          [&::-webkit-slider-thumb]:hover:bg-violet-400 [&::-webkit-slider-thumb]:transition-colors" />
                      <span className="text-xs text-slate-500 w-12">{s.max}{s.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* action bar */}
          <div className="flex items-center justify-between bg-slate-900/70 backdrop-blur-xl border border-white/[0.06] rounded-xl p-5">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-slate-400 hover:bg-white/[0.08] hover:text-white transition-all">
              <RotateCcw className="w-4 h-4" /> Reset to Defaults
            </button>
            <button onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                saved ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-300"
                : "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 hover:scale-[1.02]"}`}>
              {saved ? <><Shield className="w-4 h-4" /> Saved & Synced</> : <><Save className="w-4 h-4" /> Save Configuration</>}
            </button>
          </div>

          {/* compliance note */}
          <div className="bg-slate-900/40 border border-white/[0.04] rounded-xl p-4 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <p className="text-xs text-emerald-400 font-medium">Audit Trail Active</p>
              <p className="text-[11px] text-slate-500">All configuration changes are logged with timestamps and user identity for regulatory compliance.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
