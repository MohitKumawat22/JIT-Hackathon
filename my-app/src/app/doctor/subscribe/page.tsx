"use client";

import { useState } from "react";
import { Check, CreditCard, Lock, Zap } from "lucide-react";
import Link from "next/link";

export default function DoctorSubscription() {
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const plans = [
    { name: "Basic", price: "$29", desc: "For individual practitioners starting out.", features: ["50 AI Triage Queries/mo", "Basic Patient Records", "Standard Support"] },
    { name: "Pro", price: "$99", desc: "For busy doctors needing advanced tools.", features: ["Unlimited AI Triage", "Blockchain Medical Records", "X-Ray AI Diagnostics", "Priority 24/7 Support"], popular: true },
    { name: "Enterprise", price: "$299", desc: "For clinics and multi-doctor setups.", features: ["Everything in Pro", "Custom Branding", "API Access", "Dedicated Account Manager"] }
  ];

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-slate-200 py-20 px-6 relative">
      <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Choose Your Plan</h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">Access next-generation AI diagnostics, blockchain-secured patient records, and seamless scheduling.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border ${plan.popular ? 'border-violet-500 shadow-2xl shadow-violet-500/20 transform md:-translate-y-4' : 'border-white/[0.08]'} flex flex-col`}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3" /> Most Popular
              </div>
            )}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-white">{plan.price}</span>
              <span className="text-slate-400">/month</span>
            </div>
            <p className="text-sm text-slate-400 mb-8">{plan.desc}</p>
            <ul className="space-y-4 mb-8 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button 
              onClick={() => { setSelectedPlan(plan.name); setShowModal(true); }}
              className={`w-full py-3.5 rounded-xl font-bold transition-all ${plan.popular ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/25' : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]'}`}
            >
              Select Plan
            </button>
          </div>
        ))}
      </div>

      {/* Stripe Mock Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Lock className="w-5 h-5 text-slate-400" />
                Secure Checkout
              </div>
              <button onClick={() => !isProcessing && !isPaid && setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6">
              {!isPaid ? (
                <form onSubmit={handleCheckout} className="space-y-4 text-slate-900">
                  <div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Subscribing to</p>
                    <p className="text-2xl font-extrabold">{selectedPlan} Plan</p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <input type="email" placeholder="Email Address" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                    <div className="relative">
                      <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="text" placeholder="Card Number" required className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                    </div>
                    <div className="flex gap-3">
                      <input type="text" placeholder="MM/YY" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                      <input type="text" placeholder="CVC" required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white" />
                    </div>
                  </div>
                  <button type="submit" disabled={isProcessing} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl mt-6 transition-colors flex items-center justify-center gap-2">
                    {isProcessing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Pay & Subscribe"}
                  </button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h3>
                  <p className="text-slate-500 mb-8">Your account is now active.</p>
                  <Link href="/doctor/dashboard" className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-violet-600/20 block w-full">
                    Go to Dashboard
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
