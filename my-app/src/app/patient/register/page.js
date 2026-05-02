"use client";

import Link from "next/link";
import { useState } from "react";

export default function PatientRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen relative overflow-hidden px-4 py-12">
      <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-10 right-[15%] w-80 h-80 rounded-full bg-primary/4 blur-3xl animate-float-delayed pointer-events-none" />

      <div className="absolute top-6 left-6 animate-fade-in">
        <Link href="/patient/login" id="back-login" className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors text-sm no-underline">
          ← Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <span className="text-[#0a0f1a] text-lg font-bold">+</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Med<span className="text-primary">Connect</span></span>
          </div>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-text-muted text-sm">Register as a new patient</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-first-name" className="block text-sm font-medium text-text-secondary mb-2">First Name</label>
                <input id="reg-first-name" type="text" className="input-field" placeholder="John" autoComplete="given-name" />
              </div>
              <div>
                <label htmlFor="reg-last-name" className="block text-sm font-medium text-text-secondary mb-2">Last Name</label>
                <input id="reg-last-name" type="text" className="input-field" placeholder="Doe" autoComplete="family-name" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
              <input id="reg-email" type="email" className="input-field" placeholder="john@example.com" autoComplete="email" />
            </div>

            <div>
              <label htmlFor="reg-phone" className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
              <input id="reg-phone" type="tel" className="input-field" placeholder="+91 9876543210" autoComplete="tel" />
            </div>

            <div>
              <label htmlFor="reg-username" className="block text-sm font-medium text-text-secondary mb-2">Username</label>
              <input id="reg-username" type="text" className="input-field" placeholder="Choose a username" autoComplete="username" />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
              <div className="relative">
                <input id="reg-password" type={showPassword ? "text" : "password"} className="input-field pr-12" placeholder="Create a strong password" autoComplete="new-password" />
                <button type="button" id="toggle-reg-password" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors p-1 text-xs" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {/* Password strength indicator */}
              <div className="mt-2 flex gap-1">
                <div className="h-1 flex-1 rounded-full bg-danger/40" />
                <div className="h-1 flex-1 rounded-full bg-warning/40" />
                <div className="h-1 flex-1 rounded-full bg-border" />
                <div className="h-1 flex-1 rounded-full bg-border" />
              </div>
              <p className="text-xs text-text-muted mt-1">Min. 8 characters with uppercase, lowercase, and number</p>
            </div>

            <div>
              <label htmlFor="reg-confirm-password" className="block text-sm font-medium text-text-secondary mb-2">Confirm Password</label>
              <input id="reg-confirm-password" type="password" className="input-field" placeholder="Confirm your password" autoComplete="new-password" />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="reg-terms"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-primary"
              />
              <label htmlFor="reg-terms" className="text-xs text-text-muted leading-relaxed cursor-pointer">
                I agree to the <a href="#" className="text-primary no-underline hover:text-primary-dark">Terms of Service</a> and <a href="#" className="text-primary no-underline hover:text-primary-dark">Privacy Policy</a>. I consent to the processing of my health data.
              </label>
            </div>

            <button type="submit" id="register-submit" className="btn-primary w-full" disabled={!agreed}>
              Create Account
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button id="register-google" className="btn-secondary text-sm py-3">Google</button>
            <button id="register-aadhaar" className="btn-secondary text-sm py-3">Aadhaar</button>
          </div>
        </div>

        <div className="text-center mt-6 animate-slide-up delay-300">
          <p className="text-text-muted text-sm">
            Already have an account?{" "}
            <Link href="/patient/login" id="go-to-login" className="text-primary hover:text-primary-dark transition-colors font-medium no-underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
