"use client";

import { useState } from "react";
import { UploadCloud, FileImage, ShieldAlert, CheckCircle, Activity, Loader } from "lucide-react";
import Link from "next/link";

export default function DoctorXRayTool() {
  const [step, setStep] = useState<"idle" | "analyzing" | "result">("idle");

  const handleUpload = () => {
    setStep("analyzing");
    // Mock TensorFlow model execution time
    setTimeout(() => {
      setStep("result");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 flex flex-col items-center justify-center p-6 relative">
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-3xl z-10">
        <Link href="/doctor/dashboard" className="text-slate-400 hover:text-white mb-8 inline-block transition-colors">
          ← Back to Dashboard
        </Link>
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan-500/20">
            <Activity className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">AI X-Ray Diagnostics</h1>
          <p className="text-slate-400">Powered by TensorFlow Vision Models</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 md:p-12 shadow-2xl">
          
          {step === "idle" && (
            <div 
              onClick={handleUpload}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform">
                <FileImage className="w-10 h-10 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Drag & Drop X-Ray Scan</h3>
              <p className="text-sm text-slate-400 max-w-xs">Upload a chest X-Ray image (JPEG, PNG, DICOM) for immediate AI analysis.</p>
            </div>
          )}

          {step === "analyzing" && (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-cyan-500 rounded-full blur-xl animate-pulse opacity-50" />
                <Loader className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Running TensorFlow Model...</h3>
              <p className="text-slate-400">Analyzing lung opacities and pleural effusions.</p>
              
              {/* Fake progress bar */}
              <div className="w-full max-w-sm h-2 bg-slate-800 rounded-full mt-8 overflow-hidden">
                <div className="h-full bg-cyan-500 w-1/2 animate-[progress_3s_ease-in-out_forwards]" />
              </div>
            </div>
          )}

          {step === "result" && (
            <div className="animate-slide-up">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/2 bg-slate-800 rounded-2xl flex items-center justify-center p-4 aspect-square border border-white/[0.05]">
                  {/* Mock image placeholder since we didn't actually upload a file */}
                  <div className="text-center text-slate-500">
                    <FileImage className="w-16 h-16 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Scanned Image</p>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-400 text-sm font-bold mb-3 border border-red-500/20">
                      <ShieldAlert className="w-4 h-4" /> High Probability
                    </div>
                    <h3 className="text-3xl font-extrabold text-white mb-2">Pneumonia Detected</h3>
                    <p className="text-slate-400">Confidence Score: <span className="text-white font-bold">94.2%</span></p>
                  </div>
                  
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                    <h4 className="text-sm font-bold text-white mb-2">AI Findings:</h4>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        Consolidation observed in lower right lobe.
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        No signs of active Tuberculosis.
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep("idle")} className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white py-3 rounded-xl font-bold transition-colors">
                      Scan Another
                    </button>
                    <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold transition-colors shadow-lg shadow-cyan-600/20">
                      Attach to Record
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <style jsx global>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
