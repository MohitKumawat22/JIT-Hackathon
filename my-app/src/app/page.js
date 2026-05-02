"use client";

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [hoveredRole, setHoveredRole] = useState(null);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen relative overflow-hidden">
      {/* Decorative floating orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-96 h-96 rounded-full bg-secondary/5 blur-3xl animate-float-delayed pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl animate-pulse-glow pointer-events-none" />

      {/* Header / Branding */}
      <div className="animate-slide-up text-center mb-12 px-4">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#0a0f1a]"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">
            Med<span className="text-primary">Connect</span>
          </h1>
        </div>
        <p className="text-text-secondary text-lg max-w-md mx-auto leading-relaxed">
          Your intelligent healthcare companion. Choose how you'd like to get
          started.
        </p>
      </div>

      {/* Role Selection Cards */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-6 w-full max-w-4xl animate-slide-up delay-200">
        {/* Patient Card */}
        <Link
          href="/patient/login"
          id="role-patient"
          className="group flex-1 glass rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.06] hover:border-primary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_40px_rgba(0,212,170,0.1)] no-underline"
          onMouseEnter={() => setHoveredRole("patient")}
          onMouseLeave={() => setHoveredRole(null)}
        >
          <div className="flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                hoveredRole === "patient"
                  ? "bg-primary/15 shadow-[0_0_30px_rgba(0,212,170,0.15)]"
                  : "bg-primary/8"
              }`}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-300 ${
                  hoveredRole === "patient"
                    ? "text-primary"
                    : "text-text-secondary"
                }`}
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors duration-300">
                I am a Patient
              </h2>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                Book appointments, access medical records, and connect with
                healthcare professionals seamlessly.
              </p>
            </div>

            {/* Arrow indicator */}
            <div
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                hoveredRole === "patient"
                  ? "text-primary translate-x-1"
                  : "text-text-muted"
              }`}
            >
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>

        {/* Divider */}
        <div className="hidden md:flex items-center">
          <div className="w-px h-48 bg-gradient-to-b from-transparent via-border to-transparent" />
        </div>
        <div className="flex md:hidden items-center justify-center">
          <div className="h-px w-48 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Doctor Card */}
        <Link
          href="/doctor/login"
          id="role-doctor"
          className="group flex-1 glass rounded-2xl p-8 md:p-10 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:bg-white/[0.06] hover:border-secondary/30 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_40px_rgba(108,92,231,0.1)] no-underline"
          onMouseEnter={() => setHoveredRole("doctor")}
          onMouseLeave={() => setHoveredRole(null)}
        >
          <div className="flex flex-col items-center text-center gap-6">
            {/* Icon */}
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                hoveredRole === "doctor"
                  ? "bg-secondary/15 shadow-[0_0_30px_rgba(108,92,231,0.15)]"
                  : "bg-secondary/8"
              }`}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-colors duration-300 ${
                  hoveredRole === "doctor"
                    ? "text-secondary"
                    : "text-text-secondary"
                }`}
              >
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
                <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
                <circle cx="20" cy="10" r="2" />
              </svg>
            </div>

            {/* Content */}
            <div>
              <h2 className="text-xl font-semibold mb-2 text-foreground group-hover:text-secondary transition-colors duration-300">
                I am a Doctor
              </h2>
              <p className="text-text-muted text-sm leading-relaxed max-w-xs">
                Manage your practice, view patient records, and provide
                consultations through our secure platform.
              </p>
            </div>

            {/* Arrow indicator */}
            <div
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                hoveredRole === "doctor"
                  ? "text-secondary translate-x-1"
                  : "text-text-muted"
              }`}
            >
              Get Started
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Footer tagline */}
      <div className="animate-slide-up delay-400 mt-12 text-center px-4">
        <p className="text-text-muted text-xs tracking-wide uppercase">
          Secure &bull; Private &bull; HIPAA Compliant
        </p>
      </div>
    </div>
  );
}
