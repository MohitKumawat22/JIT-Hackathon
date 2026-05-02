import Link from "next/link";
import TriageChat from "@/components/patient/TriageChat";

export const metadata = {
  title: "AI Health Triage — AmritCare AI",
  description:
    "Describe your symptoms and get AI-powered triage recommendations with multilingual support.",
};

export default function TriagePage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-10 left-[10%] w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-[10%] w-80 h-80 rounded-full bg-secondary/4 blur-3xl animate-float-delayed pointer-events-none" />

      {/* Top bar */}
      <header className="px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 no-underline"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
            <span className="text-[#0a0f1a] text-sm font-bold">+</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Connect</span>
          </span>
        </Link>
        <Link
          href="/patient/login"
          className="text-sm text-text-muted hover:text-foreground transition-colors no-underline"
        >
          ← Patient Portal
        </Link>
      </header>

      {/* Chat area */}
      <main className="flex-1 flex items-stretch px-4 pb-4">
        <TriageChat />
      </main>
    </div>
  );
}
