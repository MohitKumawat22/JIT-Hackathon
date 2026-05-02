"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const AUTH_MODES = [
  { id: "password", label: "Password", icon: "🔒" },
  { id: "otp", label: "OTP", icon: "📱" },
  { id: "biometric", label: "Biometric", icon: "👆" },
  { id: "faceid", label: "Face ID", icon: "🤳" },
];

export default function PatientLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("password");
  const [form, setForm] = useState({ username: "", password: "" });
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleOtpChange = (i, val) => {
    if (val.length > 1) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "password") {
      if (!form.username || !form.password) {
        setError("Please fill in all fields.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Login failed.");
          setLoading(false);
          return;
        }

        // Save session
        sessionStorage.setItem("medconnect_patient", JSON.stringify(data.patient));
        router.push("/patient/dashboard");
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
      }
    } else {
      setError("This auth mode is a demo — use Password login.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-80 h-80 rounded-full bg-secondary/4 blur-3xl animate-float-delayed pointer-events-none" />

      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-foreground transition-colors mb-6 no-underline">
          ← Back to Home
        </Link>

        <div className="glass rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg">
              <span className="text-[#0a0f1a] text-xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Patient Login</h1>
            <p className="text-sm text-text-muted">Access your AmritCare AI portal</p>
          </div>

          {/* Auth mode tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-surface mb-6">
            {AUTH_MODES.map((m) => (
              <button
                key={m.id}
                id={`mode-${m.id}`}
                onClick={() => { setMode(m.id); setError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m.id
                    ? "bg-primary/15 text-primary shadow-sm"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <span>{m.icon}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Password Mode */}
            {mode === "password" && (
              <>
                <div>
                  <label htmlFor="username" className="block text-xs text-text-muted mb-1.5">Username or Email</label>
                  <input id="username" name="username" value={form.username} onChange={handleChange} className="input-field text-sm" placeholder="Enter your username or email" />
                </div>
                <div>
                  <label htmlFor="password" className="block text-xs text-text-muted mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={handleChange}
                      className="input-field text-sm pr-16"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-foreground"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="accent-primary" />
                    <span className="text-xs text-text-muted">Remember me</span>
                  </label>
                  <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
                </div>
              </>
            )}

            {/* OTP Mode */}
            {mode === "otp" && (
              <>
                <div>
                  <label htmlFor="otpPhone" className="block text-xs text-text-muted mb-1.5">Phone Number</label>
                  <input id="otpPhone" value={otpPhone} onChange={(e) => setOtpPhone(e.target.value)} className="input-field text-sm" placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1.5">Enter OTP</label>
                  <div className="flex gap-2">
                    {otp.map((digit, i) => (
                      <input key={i} id={`otp-${i}`} maxLength={1} value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="input-field text-center text-lg w-full py-3"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Biometric Mode */}
            {mode === "biometric" && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-4xl">👆</span>
                </div>
                <p className="text-sm text-text-muted">Place your finger on the sensor</p>
                <p className="text-xs text-text-muted mt-1">(Demo only — use Password login)</p>
              </div>
            )}

            {/* Face ID Mode */}
            {mode === "faceid" && (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center mb-4 animate-pulse">
                  <span className="text-4xl">🤳</span>
                </div>
                <p className="text-sm text-text-muted">Position your face in frame</p>
                <p className="text-xs text-text-muted mt-1">(Demo only — use Password login)</p>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm disabled:opacity-50">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#0a0f1a]/30 border-t-[#0a0f1a] rounded-full animate-spin" />
                  Signing In...
                </span>
              ) : (
                mode === "password" ? "Sign In" : mode === "otp" ? "Verify OTP" : "Authenticate"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-muted">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-secondary py-2.5 text-xs">🔵 Google</button>
            <button className="btn-secondary py-2.5 text-xs">🟠 Aadhaar</button>
          </div>

          <p className="text-center text-xs text-text-muted mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/patient/register" className="text-primary hover:underline no-underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
