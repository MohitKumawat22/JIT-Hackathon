"use client";

import Link from"next/link";
import Image from"next/image";
import { useState, useEffect } from"react";

export default function Home() {
 const [isLoggedIn, setIsLoggedIn] = useState(false);
 const [patientName, setPatientName] = useState("");

 useEffect(() => {
 const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (stored?.id) {
 setIsLoggedIn(true);
 setPatientName(stored.firstName ||"");
 }
 }, []);

 return (
 <div className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">

 {/* ── NAVBAR ── */}
 <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
 <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
 <Link href="/" className="flex items-center gap-2.5 no-underline">
 <div className="w-9 h-9 rounded-xl from-[#10B981] to-[#059669] flex items-center justify-center shadow-md">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
 </div>
 <span className="text-xl font-bold text-gray-900 tracking-tight">Amrit<span className="text-[#10B981]">Care</span> <span className="text-xs font-medium text-[#059669] bg-[#D1FAE5] px-1.5 py-0.5 rounded-md">AI</span></span>
 </Link>

 <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
 <a href="#services" className="hover:text-[#10B981] transition-colors">Services</a>
 <a href="#speciality" className="hover:text-[#10B981] transition-colors">Speciality</a>
 <a href="#schedule" className="hover:text-[#10B981] transition-colors">Schedule</a>
 </div>

 <div className="flex items-center gap-3">
 {isLoggedIn ? (
 <>
 <Link href="/patient/dashboard" className="text-sm font-medium text-[#10B981] hover:underline no-underline">
 Dashboard
 </Link>
 <Link href="/patient/dashboard" className="bg-[#10B981] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#059669] transition-all shadow-md shadow-[#10B981]/20 no-underline">
 Welcome, {patientName} →
 </Link>
 </>
 ) : (
 <>
 <Link href="/patient/login" className="text-sm font-medium text-gray-600 hover:text-[#10B981] transition-colors no-underline">
 Log In
 </Link>
 <Link href="/patient/register" className="bg-[#10B981] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#059669] transition-all shadow-md shadow-[#10B981]/20 no-underline">
 Sign Up Free
 </Link>
 </>
 )}
 </div>
 </div>
 </nav>

 {/* ── HERO ── */}
 <section className="relative overflow-hidden bg-white border-b border-gray-100">
 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
 <div className="absolute top-0 right-0 w-[45%] h-[80%] from-[#10B981]/5 to-transparent rounded-bl-[100px] -z-10" />

 <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row items-center gap-16">
 <div className="flex-1 space-y-6 max-w-xl relative z-10">
 <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 text-gray-700 text-[13px] font-semibold px-3 py-1 rounded-full tracking-wide">
 <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
 Intelligent Healthcare Platform
 </div>
 <h1 className="text-5xl md:text-[3.8rem] font-bold leading-[1.1] text-gray-900 tracking-tight">
 Smart Healthcare,<br/>
 <span className="text-[#10B981]">Simplified.</span>
 </h1>
 <p className="text-lg text-gray-500 leading-relaxed max-w-md font-normal">
 Find doctors, book appointments, and get AI-powered health consultations — all in one secure, unified platform.
 </p>

 <div className="flex flex-wrap items-center gap-4 pt-4">
 {isLoggedIn ? (
 <Link href="/patient/dashboard" className="bg-gray-900 text-white text-sm font-semibold px-6 py-3.5 rounded-lg hover:bg-gray-800 transition-all inline-flex items-center gap-2 no-underline">
 Go to Dashboard
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
 </Link>
 ) : (
 <>
 <Link href="/patient/register" className="bg-[#10B981] text-white text-sm font-semibold px-6 py-3.5 rounded-lg hover:bg-[#059669] transition-all inline-flex items-center gap-2 no-underline">
 Get Started Free
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
 </Link>
 <Link href="/patient/login" className="bg-white text-gray-700 text-sm font-semibold px-6 py-3.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all inline-flex items-center gap-2 no-underline">
 Sign In
 </Link>
 </>
 )}
 </div>

 <div className="flex items-center gap-4 pt-6 mt-4">
 <div className="flex -space-x-2">
 {["A","S","R","P"].map((l, i) => (
 <div key={i} className="w-8 h-8 rounded-full bg-gray-100 border border-white flex items-center justify-center text-gray-600 text-xs font-semibold">
 {l}
 </div>
 ))}
 </div>
 <div>
 <div className="flex items-center gap-1 mb-0.5">
 {[1,2,3,4,5].map(i => (
 <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
 ))}
 </div>
 <p className="text-xs text-gray-500 font-medium">Trusted by 2,500+ Patients</p>
 </div>
 </div>
 </div>

 <div className="flex-1 relative w-full max-w-lg">
 <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
 <Image src="/hero_doctors_1777712257459.png" alt="Doctors" fill className="object-cover" priority />
 </div>
 <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center gap-3 border border-gray-100">
 <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-[#10B981]">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900">150+</p>
 <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">Active Doctors</p>
 </div>
 </div>
 <div className="absolute -top-5 -right-5 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-4 flex items-center gap-3 border border-gray-100">
 <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 12 2.1 12"/><path d="M12 12l8.5 8.5"/></svg>
 </div>
 <div>
 <p className="text-sm font-bold text-gray-900">24/7</p>
 <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">AI Support</p>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ── FEATURES GRID ── */}
 <section className="max-w-7xl mx-auto px-6 md:px-10 py-20 relative z-10">
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, title:"24/7 Available", desc:"Round the clock medical support & emergency care.", bg:"bg-gray-900", text:"text-white",
 iconBg:"text-white bg-white"
 },
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, title:"Easy Booking", desc:"Book appointments with doctors in just 2 clicks.", link:"/patient/login",
 iconBg:"text-[#10B981] bg-emerald-50"
 },
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>, title:"Expert Doctors", desc:"Access certified specialists across 20+ departments.", link:"/doctor/login",
 iconBg:"text-[#10B981] bg-emerald-50"
 },
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, title:"AI Health Chat", desc:"Describe symptoms & get home remedies and doctor recommendations.", link:"/patient/register",
 iconBg:"text-[#10B981] bg-emerald-50"
 },
 ].map((card, i) => (
 <div key={i} className={`rounded-2xl p-6 transition-all hover:-translate-y-1 ${card.bg ||"bg-white border border-gray-200"}`}>
 <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-5 ${card.iconBg}`}>{card.icon}</div>
 <h3 className={`font-semibold text-lg mb-2 ${card.text ||"text-gray-900"}`}>{card.title}</h3>
 <p className={`text-sm leading-relaxed mb-5 ${card.text ?"text-white/70" :"text-gray-500"}`}>{card.desc}</p>
 {card.link && (
 <Link href={card.link} className={`text-[13px] font-semibold inline-flex items-center gap-1 no-underline ${card.text ?"text-white hover:text-gray-300" :"text-gray-900 hover:text-gray-600"}`}>
 Learn More →
 </Link>
 )}
 </div>
 ))}
 </div>
 </section>

 {/* ── SERVICES ── */}
 <section id="services" className="bg-[#FAFAFA] py-24 border-y border-gray-100">
 <div className="max-w-7xl mx-auto px-6 md:px-10">
 <div className="text-center mb-16">
 <h2 className="text-3xl font-bold text-gray-900">What We Offer</h2>
 <p className="text-gray-500 mt-3 text-sm">Comprehensive tools to manage your health seamlessly.</p>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
 {[
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, title:"AI Symptom Triage", desc:"Describe how you feel and our AI analyzes your symptoms to suggest home remedies and the right specialist." },
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title:"Find Nearby Hospitals", desc:"Real-time geolocation-based search to find the nearest hospitals and clinics with directions." },
 { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>, title:"Health Timeline", desc:"Track your complete medical history — every triage, booking, and visit — in a clean, organized timeline." },
 ].map((s, i) => (
 <div key={i} className="bg-white rounded-2xl p-8 border border-gray-200 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
 <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 mb-6 border border-gray-100">{s.icon}</div>
 <h3 className="text-[17px] font-semibold text-gray-900 mb-2">{s.title}</h3>
 <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ── SPECIALITY BANNER ── */}
 <section id="speciality" className="max-w-6xl mx-auto px-6 md:px-10 py-24">
 <div className="bg-gray-900 rounded-[2rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10 overflow-hidden relative">
 <div className="absolute top-0 right-0 w-64 h-full from-[#10B981]/20 to-transparent -z-0"></div>
 <div className="relative z-10 max-w-lg">
 <h2 className="text-4xl md:text-5xl font-bold text-white leading-[1.1] mb-5 tracking-tight">
 Your Health, <br/>Our Priority.
 </h2>
 <p className="text-gray-400 text-[15px] leading-relaxed mb-8">
 Book online consultations 24/7. Get AI-powered home remedy suggestions in seconds. Access your medical records anytime, anywhere.
 </p>
 <div className="flex flex-wrap gap-4">
 {isLoggedIn ? (
 <Link href="/patient/dashboard" className="bg-white text-gray-900 text-sm font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-all inline-flex items-center gap-2 no-underline">
 Open Dashboard
 </Link>
 ) : (
 <>
 <Link href="/patient/register" className="bg-[#10B981] text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-[#059669] transition-all no-underline">
 Create Account
 </Link>
 <Link href="/patient/login" className="border border-gray-700 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-gray-800 transition-all no-underline">
 Sign In
 </Link>
 </>
 )}
 </div>
 </div>

 <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0 z-10">
 <Image src="/schedule_calendar_1777712287936.png" alt="Schedule" fill className="object-contain" />
 </div>
 </div>
 </section>

 {/* ── HOW IT WORKS ── */}
 <section id="schedule" className="bg-white py-24 border-t border-gray-100">
 <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-16">
 <div className="flex-1 relative max-w-sm">
 <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
 <Image src="/service_doctor_1777712272499.png" alt="Doctor" width={400} height={500} className="object-cover w-full h-auto" />
 </div>
 </div>
 <div className="flex-1 space-y-8 max-w-lg">
 <div>
 <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Book in 3 Simple Steps</h2>
 </div>
 <div className="space-y-6">
 {[
 { step:"01", title:"Create Your Account", desc:"Sign up for free in under a minute with just your basic details." },
 { step:"02", title:"Find a Doctor", desc:"Search by specialty, rating, or availability. Our AI can also recommend the right doctor." },
 { step:"03", title:"Book & Consult", desc:"Pick a time slot, confirm your appointment, and you're all set!" },
 ].map((s, i) => (
 <div key={i} className="flex items-start gap-5">
 <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-500 font-semibold text-xs shrink-0">{s.step}</div>
 <div>
 <h4 className="font-semibold text-gray-900 mb-1">{s.title}</h4>
 <p className="text-[13px] text-gray-500 leading-relaxed">{s.desc}</p>
 </div>
 </div>
 ))}
 </div>
 <div className="pt-4">
 {isLoggedIn ? (
 <Link href="/patient/dashboard" className="text-sm font-semibold text-[#10B981] hover:text-[#059669] inline-flex items-center gap-1.5 no-underline">
 Go to Dashboard →
 </Link>
 ) : (
 <Link href="/patient/register" className="text-sm font-semibold text-[#10B981] hover:text-[#059669] inline-flex items-center gap-1.5 no-underline">
 Get Started Now →
 </Link>
 )}
 </div>
 </div>
 </div>
 </section>

 {/* ── FOOTER ── */}
 <footer className="bg-gray-900 text-white py-16">
 <div className="max-w-7xl mx-auto px-6 md:px-10">
 <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl from-[#10B981] to-[#059669] flex items-center justify-center shadow-lg">
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
 </div>
 <span className="text-2xl font-bold tracking-tight">Amrit<span className="text-[#10B981]">Care</span> AI</span>
 </div>
 <div className="flex flex-wrap items-center gap-8 text-sm font-semibold text-gray-400">
 <a href="#services" className="hover:text-white transition-colors">Services</a>
 <a href="#speciality" className="hover:text-white transition-colors">Speciality</a>
 <a href="#schedule" className="hover:text-white transition-colors">How It Works</a>
 <Link href="/patient/login" className="hover:text-white transition-colors no-underline">Login</Link>
 </div>
 </div>
 <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
 <p className="text-sm font-medium text-gray-500">© 2026 AmritCare AI. All rights reserved.</p>
 <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
 Secure • Private • HIPAA Compliant
 </p>
 </div>
 </div>
 </footer>
 </div>
 );
}
