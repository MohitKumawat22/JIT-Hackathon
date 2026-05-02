"use client";

import { useState } from "react";
import { UploadCloud, CheckCircle, Shield, Camera, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function DoctorVerify() {
  const [idStep, setIdStep] = useState<"idle" | "uploading" | "verifying" | "done">("idle");
  const [faceStep, setFaceStep] = useState<"idle" | "scanning" | "done">("idle");

  const handleIdUpload = () => {
    setIdStep("uploading");
    setTimeout(() => setIdStep("verifying"), 1000);
    setTimeout(() => setIdStep("done"), 3500);
  };

  const handleFaceScan = () => {
    setFaceStep("scanning");
    setTimeout(() => setFaceStep("done"), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex items-center justify-center p-6 relative">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        
        {/* Step 1: ID Verification */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Identity Verification</h2>
              <p className="text-sm text-slate-400">Powered by Nanonets OCR</p>
            </div>
          </div>

          <div className="space-y-6">
            {idStep === "idle" && (
              <div 
                onClick={handleIdUpload}
                className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group bg-white/[0.02] hover:bg-white/[0.04]"
              >
                <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-emerald-400 transition-colors mb-4" />
                <p className="text-sm font-medium text-slate-300">Click to upload National ID</p>
                <p className="text-xs text-slate-500 mt-2">JPEG, PNG, PDF up to 5MB</p>
              </div>
            )}

            {idStep === "uploading" && (
              <div className="h-48 border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center bg-white/[0.02]">
                <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4" />
                <p className="text-sm text-slate-300 animate-pulse">Uploading document...</p>
              </div>
            )}

            {idStep === "verifying" && (
              <div className="h-48 border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center bg-white/[0.02] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50">
                  <div className="h-full bg-emerald-400 animate-[scan_2s_ease-in-out_infinite]" style={{ width: '30%' }} />
                </div>
                <Shield className="w-10 h-10 text-emerald-400 mb-3 animate-pulse" />
                <p className="text-sm font-medium text-slate-200">Extracting details via Nanonets AI...</p>
                <p className="text-xs text-slate-400 mt-2">Checking authenticity markers</p>
              </div>
            )}

            {idStep === "done" && (
              <div className="h-48 border border-emerald-500/30 rounded-2xl flex flex-col items-center justify-center bg-emerald-500/5">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
                <p className="text-lg font-bold text-emerald-400">ID Verified</p>
                <p className="text-sm text-slate-400 mt-1">Dr. Rajan Sharma matches records</p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Face ID */}
        <div className={`bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl transition-all duration-500 ${idStep !== 'done' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Register Face ID</h2>
              <p className="text-sm text-slate-400">Powered by TensorFlow.js</p>
            </div>
          </div>

          <div className="space-y-6">
            {faceStep === "idle" && (
              <div className="h-48 border border-white/[0.08] rounded-2xl flex flex-col items-center justify-center bg-black/40">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center mb-4">
                  <Camera className="w-8 h-8 text-slate-500" />
                </div>
                <button onClick={handleFaceScan} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-indigo-600/20">
                  Start Camera Scan
                </button>
              </div>
            )}

            {faceStep === "scanning" && (
              <div className="h-48 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center bg-black/40 relative overflow-hidden">
                <div className="w-24 h-24 rounded-full border-2 border-indigo-500 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-t-2 border-white rounded-full animate-spin" />
                  <div className="w-20 h-20 bg-indigo-500/20 rounded-full blur-md animate-pulse" />
                </div>
                <p className="text-sm font-medium text-indigo-300 mt-4 animate-pulse">Mapping facial landmarks...</p>
              </div>
            )}

            {faceStep === "done" && (
              <div className="h-48 border border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center bg-indigo-500/5">
                <CheckCircle className="w-12 h-12 text-indigo-400 mb-3" />
                <p className="text-lg font-bold text-indigo-400">Face ID Registered</p>
                <p className="text-sm text-slate-400 mt-1">Biometric profile secured on-chain</p>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <div className={`col-span-1 md:col-span-2 flex justify-end transition-opacity duration-500 ${idStep === 'done' && faceStep === 'done' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link href="/doctor/subscribe" className="bg-white text-slate-900 font-bold px-8 py-3.5 rounded-xl hover:bg-slate-200 transition-colors shadow-xl inline-flex items-center gap-2">
            Continue to Subscription
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>

      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
}
