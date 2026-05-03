"use client";

import { useState } from"react";
import Link from"next/link";
import { useRouter } from"next/navigation";
import { User, Mail, Lock, Stethoscope, ArrowRight } from"lucide-react";

export default function DoctorSignup() {
 const router = useRouter();
 const [isLoading, setIsLoading] = useState(false);

 const handleSignup = (e: React.FormEvent) => {
 e.preventDefault();
 setIsLoading(true);
 // Mock signup delay, then route to the Verification flow
 setTimeout(() => {
 router.push("/doctor/verify");
 }, 1500);
 };

 return (
 <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-6 relative">
 {/* Ambient background blur */}
 <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
 <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
 <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[120px]" />
 </div>

 <div className="w-full max-w-md bg-slate-900 border border-white/[0.08] rounded-3xl p-8 shadow-2xl relative z-10">
 <div className="text-center mb-8">
 <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-600/30">
 <Stethoscope className="w-7 h-7 text-white" />
 </div>
 <h1 className="text-3xl font-extrabold text-white mb-2">Doctor Portal</h1>
 <p className="text-slate-400 text-sm">Create your provider account to access AI diagnostics and patient records.</p>
 </div>

 <form onSubmit={handleSignup} className="space-y-4">
 <div className="relative">
 <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
 <input type="text" placeholder="Full Name (e.g. Dr. Rajan)" required className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-colors"
 />
 </div>
 <div className="relative">
 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
 <input type="email" placeholder="Professional Email" required className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-colors"
 />
 </div>

 <div className="relative">
 <Stethoscope className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
 <input type="text" placeholder="Medical License Number" required className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-colors"
 />
 </div>

 <div className="relative">
 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
 <input type="password" placeholder="Create Password" required className="w-full pl-12 pr-4 py-3.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.05] transition-colors"
 />
 </div>

 <button type="submit" disabled={isLoading}
 className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 mt-6"
 >
 {isLoading ? (
 <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
 ) : (
 <>Create Account <ArrowRight className="w-5 h-5" /></>
 )}
 </button>
 </form>

 <p className="text-center text-slate-400 text-sm mt-8">
 Already have an account?{' '}
 <Link href="/doctor/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
 Sign in
 </Link>
 </p>
 </div>
 </div>
 );
}
