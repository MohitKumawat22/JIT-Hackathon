"use client";

import Link from"next/link";

export default function DoctorLoginPage() {
 return (
 <div className="flex flex-col flex-1 items-center justify-center min-h-screen relative overflow-hidden px-4 py-12">
 <div className="absolute top-10 right-[20%] w-64 h-64 rounded-full bg-secondary/5 blur-3xl animate-float pointer-events-none" />
 <div className="absolute bottom-10 left-[15%] w-80 h-80 rounded-full bg-accent/4 blur-3xl animate-float-delayed pointer-events-none" />

 <div className="absolute top-6 left-6 animate-fade-in">
 <Link href="/" id="back-home" className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors text-sm no-underline">
 ← Back
 </Link>
 </div>

 <div className="w-full max-w-md animate-slide-up">
 <div className="text-center mb-8">
 <div className="inline-flex items-center gap-2 mb-4">
 <div className="w-10 h-10 rounded-xl from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
 </div>
 <span className="text-xl font-bold tracking-tight">Amrit<span className="text-[#10B981]">Care</span> <span className="text-xs font-medium text-[#059669] bg-[#D1FAE5] px-1.5 py-0.5 rounded-md ml-0.5">AI</span></span>
 </div>
 <h1 className="text-2xl font-bold mb-2">Doctor Portal</h1>
 <p className="text-text-muted text-sm">Sign in to your doctor account</p>
 </div>

 <div className="glass rounded-2xl p-8">
 <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
 <div>
 <label htmlFor="doc-email" className="block text-sm font-medium text-text-secondary mb-2">Email or Doctor ID</label>
 <input id="doc-email" type="text" className="input-field" placeholder="Enter your email or Doctor ID" autoComplete="username" />
 </div>
 <div>
 <label htmlFor="doc-password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
 <input id="doc-password" type="password" className="input-field" placeholder="Enter your password" autoComplete="current-password" />
 </div>
 <button type="submit" id="doc-login-submit" className="btn-primary w-full">
 Sign In
 </button>
 </form>
 </div>

 <div className="text-center mt-6">
 <p className="text-text-muted text-xs uppercase tracking-wide">Coming Soon — Full Doctor Portal</p>
 </div>
 </div>
 </div>
 );
}
