"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function PatientRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    confirmPassword: "",
    age: "",
    blood: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return { level: 0, label: "", color: "" };
    let score = 0;
    if (p.length >= 6) score++;
    if (p.length >= 10) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { level: 1, label: "Weak", color: "bg-red-400" };
    if (score <= 3) return { level: 2, label: "Medium", color: "bg-yellow-400" };
    return { level: 3, label: "Strong", color: "bg-green-400" };
  };

  const strength = passwordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName || !form.lastName || !form.email || !form.username || !form.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          username: form.username,
          password: form.password,
          age: form.age ? parseInt(form.age) : null,
          blood: form.blood,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }

      // Save patient session
      sessionStorage.setItem("medconnect_patient", JSON.stringify(data.patient));
      router.push("/patient/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:py-12 relative overflow-hidden bg-[#FAFAFA]">
      {/* Decorative orbs */}
      <div className="absolute top-20 left-[15%] w-72 h-72 rounded-full bg-[#10B981]/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-[#064E3B]/5 blur-3xl animate-float-delayed pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        {/* Back link */}
        <Link
          href="/patient/login"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors mb-6 no-underline"
        >
          ← Back to Login
        </Link>

        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center mb-5 shadow-lg shadow-[#10B981]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-sm text-gray-500">Join AmritCare AI — your health, simplified</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium text-center animate-fade-in flex items-center justify-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold text-gray-700 mb-1.5">First Name *</label>
                <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="Arjun" />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-xs font-bold text-gray-700 mb-1.5">Last Name *</label>
                <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="Mehta" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-gray-700 mb-1.5">Email *</label>
              <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="arjun@example.com" />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
              <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="+91 98765 43210" />
            </div>

            {/* Age + Blood Group */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-xs font-bold text-gray-700 mb-1.5">Age</label>
                <input id="age" name="age" type="number" value={form.age} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="28" />
              </div>
              <div>
                <label htmlFor="blood" className="block text-xs font-bold text-gray-700 mb-1.5">Blood Group</label>
                <select id="blood" name="blood" value={form.blood} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all text-gray-700">
                  <option value="">Select</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold text-gray-700 mb-1.5">Username *</label>
              <input id="username" name="username" value={form.username} onChange={handleChange} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all" placeholder="arjun_m" />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-gray-700 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all pr-16"
                  placeholder="Min 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
              {form.password && (
                <div className="mt-2.5 flex items-center gap-2.5">
                  <div className="flex-1 flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= strength.level ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <span className={`text-xs font-bold ${strength.color.replace("bg-", "text-")}`}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-gray-700 mb-1.5">Confirm Password *</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all"
                placeholder="Re-enter password"
              />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#10B981] focus:ring-[#10B981]"
              />
              <span className="text-xs text-gray-500 leading-relaxed font-medium">
                I agree to the <span className="text-[#10B981] font-bold">Terms of Service</span> and <span className="text-[#10B981] font-bold">Privacy Policy</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10B981] text-white py-3.5 rounded-xl font-bold hover:bg-[#059669] transition-all disabled:opacity-50 mt-4 shadow-lg shadow-[#10B981]/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account Securely"
              )}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-gray-500 mt-8">
            Already have an account?{" "}
            <Link href="/patient/login" className="text-[#10B981] font-bold hover:underline no-underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
