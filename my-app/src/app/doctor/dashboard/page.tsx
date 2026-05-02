"use client";

import { useState } from "react";
import { LayoutDashboard, Users, PenTool, ShieldAlert, Lock, Unlock, CheckCircle2, ChevronRight, FileImage, LogOut } from "lucide-react";
import Link from "next/link";

type Tab = "schedule" | "records" | "blog";

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("schedule");
  const [recordsUnlocked, setRecordsUnlocked] = useState(false);

  const requestPermission = () => {
    // Simulating blockchain permission request
    setTimeout(() => setRecordsUnlocked(true), 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-white/[0.06] flex flex-col">
        <div className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold">DR</div>
            <div>
              <p className="font-bold text-white">Dr. Rajan</p>
              <p className="text-xs text-emerald-400 font-medium">Verified • Pro</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab("schedule")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "schedule" ? "bg-violet-600/10 text-violet-400" : "text-slate-400 hover:bg-white/[0.04]"}`}>
            <LayoutDashboard className="w-5 h-5" /> Schedule
          </button>
          <button onClick={() => setActiveTab("records")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "records" ? "bg-violet-600/10 text-violet-400" : "text-slate-400 hover:bg-white/[0.04]"}`}>
            <Users className="w-5 h-5" /> Patient Records
          </button>
          <button onClick={() => setActiveTab("blog")} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === "blog" ? "bg-violet-600/10 text-violet-400" : "text-slate-400 hover:bg-white/[0.04]"}`}>
            <PenTool className="w-5 h-5" /> Write Blog
          </button>
          <div className="pt-4 mt-4 border-t border-white/[0.06]">
            <Link href="/doctor/xray" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors">
              <FileImage className="w-5 h-5" /> AI X-Ray Tool
            </Link>
          </div>
        </nav>
        <div className="p-4 border-t border-white/[0.06]">
          <Link href="/" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {activeTab === "schedule" && "Today's Appointments"}
              {activeTab === "records" && "Blockchain Patient Records"}
              {activeTab === "blog" && "Publish a Health Blog"}
            </h1>
            <p className="text-slate-400">
              {activeTab === "schedule" && "View and manage your upcoming consultations."}
              {activeTab === "records" && "Securely access Web3 medical histories."}
              {activeTab === "blog" && "Share your expertise with the community."}
            </p>
          </div>

          {/* Schedule View */}
          {activeTab === "schedule" && (
            <div className="space-y-4">
              {[
                { time: "09:00 AM", name: "Rahul Singh", type: "Video Consult", status: "Upcoming" },
                { time: "10:30 AM", name: "Anjali Gupta", type: "Clinic Visit", status: "Upcoming" },
                { time: "11:45 AM", name: "Vikram Mehta", type: "AI Triage Follow-up", status: "Delayed" },
              ].map((apt, i) => (
                <div key={i} className="bg-slate-900/50 border border-white/[0.08] rounded-2xl p-5 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-5">
                    <div className="text-center px-4 py-2 bg-white/[0.03] rounded-xl border border-white/[0.04]">
                      <p className="text-xs text-slate-400">Time</p>
                      <p className="text-sm font-bold text-white">{apt.time}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{apt.name}</h3>
                      <p className="text-sm text-slate-400">{apt.type}</p>
                    </div>
                  </div>
                  <button className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-violet-600/20">
                    Join / View
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Records View */}
          {activeTab === "records" && (
            <div className="bg-slate-900/50 border border-white/[0.08] rounded-3xl p-8 relative overflow-hidden">
              {!recordsUnlocked ? (
                <div className="text-center py-12 relative z-10">
                  <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border border-white/[0.05]">
                    <Lock className="w-10 h-10 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Records Encrypted</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">Patient medical histories are secured on the blockchain. You must request smart-contract permission from the patient to decrypt their data.</p>
                  <button onClick={requestPermission} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-emerald-600/20 inline-flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Request Access
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/[0.06]">
                    <div className="p-3 bg-emerald-500/10 rounded-xl">
                      <Unlock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Access Granted</h3>
                      <p className="text-sm text-emerald-400">Blockchain Decryption Successful</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* Mock Record List */}
                    {["Rahul Singh - Complete Blood Count (2025)", "Anjali Gupta - MRI Scan Report", "Vikram Mehta - Prescriptions History"].map((rec, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-slate-200">{rec}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Blog View */}
          {activeTab === "blog" && (
            <div className="bg-slate-900/50 border border-white/[0.08] rounded-3xl p-8">
              <input 
                type="text" 
                placeholder="Blog Title..." 
                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-slate-600 outline-none mb-6 border-b border-white/[0.06] pb-4 focus:border-violet-500 transition-colors"
              />
              {/* Mock Rich Text Toolbar */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-white/[0.03] rounded-lg border border-white/[0.04]">
                {['B', 'I', 'U', 'H1', 'H2', 'Link', 'Image'].map(cmd => (
                  <button key={cmd} className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors">
                    {cmd}
                  </button>
                ))}
              </div>
              <textarea 
                placeholder="Start writing your health insights here..."
                className="w-full h-64 bg-transparent text-slate-300 placeholder:text-slate-600 outline-none resize-none leading-relaxed"
              ></textarea>
              <div className="flex justify-end pt-4 border-t border-white/[0.06]">
                <button className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-violet-600/20">
                  Publish to Community
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
