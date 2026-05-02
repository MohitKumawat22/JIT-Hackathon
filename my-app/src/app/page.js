"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const stored = JSON.parse(sessionStorage.getItem("medconnect_patient") || "null");
    if (stored?.id) {
      setIsLoggedIn(true);
      setPatientName(stored.firstName || "");
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md">
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
      <section className="relative">
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-[#D1FAE5]/60 via-[#D1FAE5]/30 to-transparent rounded-bl-[120px] -z-10 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#6EE7B7]/20 blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-60 h-60 rounded-full bg-[#10B981]/5 blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-7 max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#D1FAE5] text-[#064E3B] text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#064E3B]" /> AI-Powered Healthcare
            </div>
            <h1 className="text-5xl md:text-[3.5rem] font-extrabold leading-[1.1] text-[#064E3B] tracking-tight">
              Smart Healthcare,<br/>
              <span className="text-[#10B981]">Simplified.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-md">
              Find doctors, book appointments, and get AI-powered health consultations — all in one place. No medicine prescriptions, just smart home remedies & expert guidance.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {isLoggedIn ? (
                <Link href="/patient/dashboard" className="bg-[#10B981] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/25 inline-flex items-center gap-2 no-underline">
                  Go to Dashboard
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Link>
              ) : (
                <>
                  <Link href="/patient/register" className="bg-[#10B981] text-white text-base font-semibold px-8 py-4 rounded-full hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/25 inline-flex items-center gap-2 no-underline">
                    Get Started Free
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                  <Link href="/patient/login" className="text-[#064E3B] text-base font-semibold px-8 py-4 rounded-full border-2 border-gray-200 hover:border-[#10B981] hover:text-[#10B981] transition-all inline-flex items-center gap-2 no-underline">
                    Sign In
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2.5">
                {["A", "S", "R", "P"].map((l, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6EE7B7] to-[#10B981] border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">2,500+ Patients</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative w-full max-w-lg">
            <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#10B981]/10">
              <Image src="/hero_doctors_1777712257459.png" alt="Doctors" fill className="object-cover" priority />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100 animate-float">
              <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center"><span className="text-lg">✅</span></div>
              <div>
                <p className="text-sm font-bold text-gray-800">150+</p>
                <p className="text-xs text-gray-400">Active Doctors</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-gray-100 animate-float-delayed">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center"><span className="text-lg">🤖</span></div>
              <div>
                <p className="text-sm font-bold text-gray-800">24/7</p>
                <p className="text-xs text-gray-400">AI Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-10 -mt-8 relative z-10 mb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "🕐", title: "24/7 Available", desc: "Round the clock medical support & emergency care.", bg: "bg-[#064E3B]", text: "text-white" },
            { icon: "📅", title: "Easy Booking", desc: "Book appointments with doctors in just 2 clicks.", link: "/patient/login" },
            { icon: "🩺", title: "Expert Doctors", desc: "Access certified specialists across 20+ departments.", link: "/doctor/login" },
            { icon: "🤖", title: "AI Health Chat", desc: "Describe symptoms & get home remedies and doctor recommendations.", link: "/patient/register" },
          ].map((card, i) => (
            <div key={i} className={`rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${card.bg || "bg-white border border-gray-100 shadow-sm"}`}>
              <div className="text-3xl mb-4">{card.icon}</div>
              <h3 className={`font-bold text-base mb-2 ${card.text || "text-gray-800"}`}>{card.title}</h3>
              <p className={`text-sm leading-relaxed mb-4 ${card.text ? "text-white/70" : "text-gray-400"}`}>{card.desc}</p>
              {card.link && (
                <Link href={card.link} className="text-[#10B981] text-sm font-semibold hover:underline inline-flex items-center gap-1 no-underline">
                  Learn More →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="bg-[#F0FDF4] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="text-center mb-14">
            <span className="text-[#10B981] font-semibold text-sm tracking-wider uppercase">Our Services</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#064E3B] mt-2">What We Offer</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "💊", title: "AI Symptom Triage", desc: "Describe how you feel and our AI analyzes your symptoms to suggest home remedies and the right specialist." },
              { icon: "📍", title: "Find Nearby Hospitals", desc: "Real-time geolocation-based search to find the nearest hospitals and clinics with directions." },
              { icon: "📋", title: "Health Timeline", desc: "Track your complete medical history — every triage, booking, and visit — in a beautiful timeline." },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-[#D1FAE5] flex items-center justify-center text-2xl mb-5 group-hover:scale-110 transition-transform">{s.icon}</div>
                <h3 className="text-lg font-bold text-[#064E3B] mb-3">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALITY BANNER ── */}
      <section id="speciality" className="max-w-6xl mx-auto px-6 md:px-10 py-20">
        <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-[2rem] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-[#10B981]/15 relative overflow-hidden">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-md pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />

          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-snug mb-4">
              Your Health, <br/>Our Priority.
            </h2>
            <p className="text-white/80 text-base leading-relaxed mb-6">
              Book online consultations 24/7. Get AI-powered home remedy suggestions in seconds. Access your medical records anytime, anywhere.
            </p>
            <div className="flex flex-wrap gap-3">
              {isLoggedIn ? (
                <Link href="/patient/dashboard" className="bg-white text-[#064E3B] font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition-all shadow-md inline-flex items-center gap-2 no-underline">
                  Open Dashboard →
                </Link>
              ) : (
                <>
                  <Link href="/patient/register" className="bg-white text-[#064E3B] font-semibold px-7 py-3 rounded-full hover:bg-gray-100 transition-all shadow-md no-underline">
                    Create Account
                  </Link>
                  <Link href="/patient/login" className="border-2 border-white/40 text-white font-semibold px-7 py-3 rounded-full hover:bg-white/10 transition-all no-underline">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="relative w-64 h-64 md:w-80 md:h-80 shrink-0">
            <Image src="/schedule_calendar_1777712287936.png" alt="Schedule" fill className="object-contain drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="schedule" className="bg-[#F0FDF4] py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 relative max-w-sm">
            <Image src="/service_doctor_1777712272499.png" alt="Doctor" width={400} height={500} className="rounded-3xl shadow-xl object-cover" />
          </div>
          <div className="flex-1 space-y-6 max-w-lg">
            <span className="text-[#10B981] font-semibold text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#064E3B]">Book in 3 Simple Steps</h2>
            <div className="space-y-5">
              {[
                { step: "01", title: "Create Your Account", desc: "Sign up for free in under a minute with just your basic details." },
                { step: "02", title: "Find a Doctor", desc: "Search by specialty, rating, or availability. Our AI can also recommend the right doctor." },
                { step: "03", title: "Book & Consult", desc: "Pick a time slot, confirm your appointment, and you're all set!" },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#D1FAE5] flex items-center justify-center text-[#064E3B] font-bold text-sm shrink-0">{s.step}</div>
                  <div>
                    <h4 className="font-bold text-gray-800 mb-1">{s.title}</h4>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2">
              {isLoggedIn ? (
                <Link href="/patient/dashboard" className="bg-[#10B981] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 inline-flex items-center gap-2 no-underline">
                  Go to Dashboard →
                </Link>
              ) : (
                <Link href="/patient/register" className="bg-[#10B981] text-white font-semibold px-7 py-3.5 rounded-full hover:bg-[#059669] transition-all shadow-lg shadow-[#10B981]/20 inline-flex items-center gap-2 no-underline">
                  Get Started Now →
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#064E3B] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <span className="text-xl font-bold">Amrit<span className="text-[#6EE7B7]">Care</span> AI</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#services" className="hover:text-white transition-colors">Services</a>
              <a href="#speciality" className="hover:text-white transition-colors">Speciality</a>
              <a href="#schedule" className="hover:text-white transition-colors">How It Works</a>
              <Link href="/patient/login" className="hover:text-white transition-colors no-underline">Login</Link>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">© 2026 AmritCare AI. All rights reserved.</p>
            <p className="text-sm text-white/40">Secure • Private • HIPAA Compliant</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
