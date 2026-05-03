"use client";

import { useState } from"react";
import { useRouter } from"next/navigation";
import Link from"next/link";

export default function RegisterPage() {
 const [role, setRole] = useState<"patient" |"doctor">("patient");
 const [formData, setFormData] = useState({ name:"", email:"", password:"" });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState("");
 const router = useRouter();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setLoading(true);
 setError("");

 try {
 const res = await fetch("/api/auth/register", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({ ...formData, role }),
 });

 const data = await res.json();

 if (res.ok) {
 router.push("/login?registered=true");
 } else {
 setError(data.error ||"Registration failed");
 }
 } catch (err) {
 setError("Something went wrong. Please try again.");
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 lg:px-8">
 <div className="sm:mx-auto sm:w-full sm:max-w-md">
 <div className="text-center">
 <span className="text-4xl">🏥</span>
 <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
 <p className="mt-2 text-sm text-gray-600">
 Or{""}
 <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
 sign in to your existing account
 </Link>
 </p>
 </div>

 <div className="mt-8 bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
 {/* Tabs */}
 <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
 <button
 onClick={() => setRole("patient")}
 className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
 role ==="patient" ?"bg-white text-emerald-600 shadow-sm" :"text-gray-500 hover:text-gray-700"
 }`}
 >
 I am a Patient
 </button>
 <button
 onClick={() => setRole("doctor")}
 className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
 role ==="doctor" ?"bg-white text-emerald-600 shadow-sm" :"text-gray-500 hover:text-gray-700"
 }`}
 >
 I am a Doctor
 </button>
 </div>

 <form className="space-y-6" onSubmit={handleSubmit}>
 {error && (
 <div className="bg-red-50 border-l-4 border-red-400 p-4 text-red-700 text-sm rounded-lg">
 {error}
 </div>
 )}

 <div>
 <label className="block text-sm font-bold text-gray-700">Full Name</label>
 <div className="mt-1">
 <input
 required
 type="text"
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
 placeholder="John Doe"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-700">Email address</label>
 <div className="mt-1">
 <input
 required
 type="email"
 value={formData.email}
 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
 className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
 placeholder="john@example.com"
 />
 </div>
 </div>

 <div>
 <label className="block text-sm font-bold text-gray-700">Password</label>
 <div className="mt-1">
 <input
 required
 type="password"
 value={formData.password}
 onChange={(e) => setFormData({ ...formData, password: e.target.value })}
 className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-all"
 placeholder="••••••••"
 />
 </div>
 </div>

 <div>
 <button
 type="submit"
 disabled={loading}
 className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-all transform active:scale-95"
 >
 {loading ?"Creating account..." : `Register as ${role ==="doctor" ?"Doctor" :"Patient"}`}
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 );
}
