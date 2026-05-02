"use client";

import Link from "next/link";
import { useState } from "react";

const AUTH_MODES = [
  { id: "password", label: "Password" },
  { id: "otp", label: "OTP / SMS" },
  { id: "biometric", label: "Biometric" },
  { id: "face", label: "Face ID" },
];

export default function PatientLoginPage() {
  const [authMode, setAuthMode] = useState("password");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen relative overflow-hidden px-4 py-12">
      <div className="absolute top-10 right-[20%] w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-10 left-[15%] w-80 h-80 rounded-full bg-secondary/4 blur-3xl animate-float-delayed pointer-events-none" />

      <div className="absolute top-6 left-6 animate-fade-in">
        <Link href="/" id="back-home" className="flex items-center gap-2 text-text-muted hover:text-foreground transition-colors text-sm no-underline">
          ← Back
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
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-text-muted text-sm">Sign in to your patient account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="mb-6">
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted mb-3">Authentication Method</p>
            <div className="grid grid-cols-2 gap-2">
              {AUTH_MODES.map((mode) => (
                <button key={mode.id} id={`auth-mode-${mode.id}`} className={`auth-mode-btn ${authMode === mode.id ? "active" : ""}`} onClick={() => setAuthMode(mode.id)}>
                  <span className="text-sm">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-border mb-6" />

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            {authMode === "password" && (
              <>
                <div>
                  <label htmlFor="login-username" className="block text-sm font-medium text-text-secondary mb-2">Username or Email</label>
                  <input id="login-username" type="text" className="input-field" placeholder="Enter your username or email" autoComplete="username" />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                  <div className="relative">
                    <input id="login-password" type={showPassword ? "text" : "password"} className="input-field pr-12" placeholder="Enter your password" autoComplete="current-password" />
                    <button type="button" id="toggle-password" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors p-1 text-xs" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="mt-2 text-right">
                    <a href="#" id="forgot-password" className="text-xs text-primary hover:text-primary-dark transition-colors no-underline">Forgot password?</a>
                  </div>
                </div>
              </>
            )}

            {authMode === "otp" && (
              <>
                <div>
                  <label htmlFor="login-phone" className="block text-sm font-medium text-text-secondary mb-2">Phone Number</label>
                  <input id="login-phone" type="tel" className="input-field" placeholder="+91 9876543210" autoComplete="tel" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">One-Time Password</label>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input key={i} id={`otp-digit-${i}`} type="text" maxLength={1} className="input-field text-center text-lg font-mono w-12 h-12 p-0" placeholder="·" />
                    ))}
                  </div>
                  <button type="button" id="send-otp" className="mt-3 text-xs text-primary hover:text-primary-dark transition-colors font-medium">Send OTP →</button>
                </div>
              </>
            )}

            {authMode === "biometric" && (
              <div className="text-center py-8">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-primary text-4xl">👆</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Touch Fingerprint Sensor</h3>
                <p className="text-text-muted text-sm">Place your finger on the biometric sensor to authenticate</p>
              </div>
            )}

            {authMode === "face" && (
              <div className="text-center py-8">
                <div className="w-24 h-24 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <span className="text-secondary text-4xl">🤳</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Face Recognition</h3>
                <p className="text-text-muted text-sm">Position your face within the camera frame to authenticate</p>
              </div>
            )}

            <button type="submit" id="login-submit" className="btn-primary w-full">
              {authMode === "password" ? "Sign In" : authMode === "otp" ? "Verify OTP" : "Authenticate"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button id="login-google" className="btn-secondary text-sm py-3">Google</button>
            <button id="login-aadhaar" className="btn-secondary text-sm py-3">Aadhaar</button>
          </div>
        </div>

        <div className="text-center mt-6 animate-slide-up delay-300">
          <p className="text-text-muted text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/patient/register" id="go-to-register" className="text-primary hover:text-primary-dark transition-colors font-medium no-underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
