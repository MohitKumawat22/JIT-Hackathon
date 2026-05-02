"use client";

import Link from "next/link";
import { useState } from "react";

/* ───────────────────────────────────────────
   Dummy facility data
   ─────────────────────────────────────────── */
const FACILITIES = [
  {
    id: 1,
    name: "Apollo Multispeciality Hospital",
    type: "Hospital",
    address: "154, Bannerghatta Rd, Opp. IIM, Bangalore 560076",
    distance: 1.2,
    rating: 4.6,
    reviews: 2340,
    open: true,
    emergency: true,
    specialties: ["Cardiology", "Neurology", "Orthopaedics"],
    phone: "+91 80 2630 4050",
    lat: 12.9177,
    lng: 77.5996,
  },
  {
    id: 2,
    name: "Fortis Hospital",
    type: "Hospital",
    address: "14, Cunningham Rd, Vasanth Nagar, Bangalore 560052",
    distance: 2.8,
    rating: 4.4,
    reviews: 1876,
    open: true,
    emergency: true,
    specialties: ["Oncology", "Gastroenterology", "Pulmonology"],
    phone: "+91 80 6621 4444",
    lat: 12.9856,
    lng: 77.5867,
  },
  {
    id: 3,
    name: "Sakra World Hospital",
    type: "Hospital",
    address: "SY NO. 52/2 & 52/3, Devarabeesanahalli, Bangalore 560103",
    distance: 4.1,
    rating: 4.5,
    reviews: 1204,
    open: true,
    emergency: true,
    specialties: ["Paediatrics", "Nephrology", "Urology"],
    phone: "+91 80 4969 4969",
    lat: 12.9364,
    lng: 77.6982,
  },
  {
    id: 4,
    name: "MedPlus Family Clinic",
    type: "Clinic",
    address: "23, 1st Cross, Koramangala 4th Block, Bangalore 560034",
    distance: 0.8,
    rating: 4.2,
    reviews: 312,
    open: true,
    emergency: false,
    specialties: ["General Medicine", "Dermatology"],
    phone: "+91 80 4112 3344",
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    id: 5,
    name: "Narayana Health City",
    type: "Hospital",
    address: "258/A, Bommasandra Industrial Area, Bangalore 560099",
    distance: 6.5,
    rating: 4.7,
    reviews: 3102,
    open: true,
    emergency: true,
    specialties: ["Cardiac Surgery", "Transplant", "Oncology"],
    phone: "+91 80 7122 2222",
    lat: 12.8090,
    lng: 77.6877,
  },
  {
    id: 6,
    name: "CureBay Community Clinic",
    type: "Clinic",
    address: "78, HSR Layout Sector 2, Bangalore 560102",
    distance: 1.5,
    rating: 4.0,
    reviews: 189,
    open: false,
    emergency: false,
    specialties: ["General Medicine", "Paediatrics"],
    phone: "+91 80 4223 5566",
    lat: 12.9116,
    lng: 77.6474,
  },
  {
    id: 7,
    name: "Manipal Hospital — Old Airport Road",
    type: "Hospital",
    address: "98, HAL Old Airport Rd, Bangalore 560017",
    distance: 3.3,
    rating: 4.5,
    reviews: 2780,
    open: true,
    emergency: true,
    specialties: ["Neurosurgery", "Orthopaedics", "IVF"],
    phone: "+91 80 2502 4444",
    lat: 12.9592,
    lng: 77.6474,
  },
  {
    id: 8,
    name: "Pristyn Care Clinic",
    type: "Clinic",
    address: "45, Indiranagar Double Rd, Bangalore 560038",
    distance: 2.1,
    rating: 4.3,
    reviews: 456,
    open: true,
    emergency: false,
    specialties: ["ENT", "Ophthalmology", "General Surgery"],
    phone: "+91 80 4998 7766",
    lat: 12.9784,
    lng: 77.6408,
  },
];

/* ───────────────────────────────────────────
   Filter / Sort helpers
   ─────────────────────────────────────────── */
const FILTER_OPTIONS = ["All", "Hospital", "Clinic"];
const SORT_OPTIONS = [
  { value: "distance", label: "Nearest First" },
  { value: "rating", label: "Top Rated" },
];

/* ───────────────────────────────────────────
   Map pin component (SVG)
   ─────────────────────────────────────────── */
function MapPin({ x, y, label, active, onClick }) {
  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      <circle r="6" fill={active ? "#00d4aa" : "#6c5ce7"} opacity="0.3">
        <animate attributeName="r" values="6;12;6" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle r="5" fill={active ? "#00d4aa" : "#6c5ce7"} stroke="#0a0f1a" strokeWidth="2" />
      {active && (
        <text y="-14" textAnchor="middle" fill="#e8edf5" fontSize="10" fontWeight="600" className="select-none">
          {label}
        </text>
      )}
    </g>
  );
}

/* ───────────────────────────────────────────
   Star component
   ─────────────────────────────────────────── */
function Stars({ rating }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.3;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill={i < full ? "#feca57" : i === full && half ? "url(#halfGrad)" : "none"}
          stroke={i < full || (i === full && half) ? "#feca57" : "rgba(255,255,255,0.15)"}
          strokeWidth="1.5"
        >
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#feca57" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────
   Page component
   ─────────────────────────────────────────── */
export default function LocatePage() {
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("distance");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter + sort
  const filtered = FACILITIES
    .filter((f) => filter === "All" || f.type === filter)
    .filter((f) =>
      searchQuery === "" ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) =>
      sort === "distance" ? a.distance - b.distance : b.rating - a.rating
    );

  const selected = FACILITIES.find((f) => f.id === selectedId);

  /* Map pin positions — project lat/lng onto SVG viewport (simplified) */
  const latMin = 12.78, latMax = 13.02, lngMin = 77.55, lngMax = 77.72;
  const toX = (lng) => ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const toY = (lat) => (1 - (lat - latMin) / (latMax - latMin)) * 100;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Header ── */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow">
            <span className="text-[#0a0f1a] text-sm font-bold">+</span>
          </div>
          <span className="text-lg font-bold tracking-tight">
            Med<span className="text-primary">Connect</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/patient/triage" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">
            AI Triage
          </Link>
          <Link href="/patient/login" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">
            Patient Portal
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* ────────────────────────────────────
           LEFT: Interactive Map Placeholder
           ──────────────────────────────────── */}
        <section className="lg:flex-1 relative min-h-[350px] lg:min-h-0 bg-[#0d1420] border-b lg:border-b-0 lg:border-r border-border">
          {/* Faux-map grid background */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

          {/* Map SVG with pins */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Faint road lines */}
            <line x1="10" y1="35" x2="90" y2="35" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <line x1="10" y1="65" x2="90" y2="65" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <line x1="30" y1="10" x2="30" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <line x1="60" y1="10" x2="60" y2="90" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
            <path d="M15 20 Q 40 50, 85 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
            <path d="M10 70 Q 50 40, 90 80" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />

            {/* User location */}
            <circle cx="50" cy="50" r="3" fill="#00d4aa" opacity="0.2">
              <animate attributeName="r" values="3;8;3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="50" cy="50" r="3" fill="#00d4aa" />
            <text x="50" y="44" textAnchor="middle" fill="#00d4aa" fontSize="3" fontWeight="600">You</text>

            {/* Facility pins */}
            {FACILITIES.map((f) => (
              <MapPin
                key={f.id}
                x={toX(f.lng)}
                y={toY(f.lat)}
                label={f.name.split(" ")[0]}
                active={selectedId === f.id}
                onClick={() => setSelectedId(f.id === selectedId ? null : f.id)}
              />
            ))}
          </svg>

          {/* Map badge */}
          <div className="absolute top-4 left-4 glass rounded-xl px-4 py-2.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-text-secondary font-medium">Live Map — Integrate Maps API here</span>
          </div>

          {/* Zoom controls placeholder */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button className="w-9 h-9 glass rounded-lg flex items-center justify-center text-text-secondary hover:text-foreground transition-colors text-lg font-light">+</button>
            <button className="w-9 h-9 glass rounded-lg flex items-center justify-center text-text-secondary hover:text-foreground transition-colors text-lg font-light">−</button>
          </div>

          {/* Selected facility popup */}
          {selected && (
            <div className="absolute bottom-4 left-4 right-16 lg:right-auto lg:max-w-xs glass rounded-xl p-4 animate-slide-up">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold mb-1">{selected.name}</h3>
                  <p className="text-xs text-text-muted mb-2">{selected.address}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-primary font-medium">{selected.distance} km</span>
                    <Stars rating={selected.rating} />
                  </div>
                </div>
                <button onClick={() => setSelectedId(null)} className="text-text-muted hover:text-foreground text-sm p-1 shrink-0">✕</button>
              </div>
            </div>
          )}
        </section>

        {/* ────────────────────────────────────
           RIGHT: Facility List
           ──────────────────────────────────── */}
        <section className="lg:w-[440px] xl:w-[480px] flex flex-col max-h-screen lg:max-h-none">
          {/* Search + Filters */}
          <div className="p-4 space-y-3 border-b border-border">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                id="facility-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or specialty..."
                className="input-field pl-10 py-2.5 text-sm"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Type filter */}
              <div className="flex gap-1.5">
                {FILTER_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    id={`filter-${opt.toLowerCase()}`}
                    onClick={() => setFilter(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filter === opt
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-surface text-text-muted border border-border hover:border-border-hover hover:text-text-secondary"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-secondary outline-none focus:border-primary transition-colors cursor-pointer"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results count */}
          <div className="px-4 py-2 border-b border-border">
            <p className="text-xs text-text-muted">
              <span className="text-foreground font-medium">{filtered.length}</span> facilities found near you
            </p>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((facility, i) => (
              <div
                key={facility.id}
                id={`facility-${facility.id}`}
                onClick={() => setSelectedId(facility.id === selectedId ? null : facility.id)}
                className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-surface-hover ${
                  selectedId === facility.id ? "bg-primary/[0.04] border-l-2 border-l-primary" : ""
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold truncate">{facility.name}</h3>
                    </div>
                    <p className="text-xs text-text-muted truncate">{facility.address}</p>
                  </div>

                  {/* Distance badge */}
                  <div className="shrink-0 text-right">
                    <span className="text-sm font-bold text-primary">{facility.distance}</span>
                    <span className="text-xs text-text-muted ml-0.5">km</span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex items-center flex-wrap gap-1.5 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    facility.type === "Hospital"
                      ? "bg-secondary/10 text-secondary"
                      : "bg-accent/10 text-accent"
                  }`}>
                    {facility.type === "Hospital" ? "🏥" : "🏨"} {facility.type}
                  </span>

                  {facility.emergency && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">
                      🚑 24/7 ER
                    </span>
                  )}

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    facility.open
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                  }`}>
                    {facility.open ? "Open Now" : "Closed"}
                  </span>
                </div>

                {/* Rating + specialties */}
                <div className="flex items-center gap-3 mb-3">
                  <Stars rating={facility.rating} />
                  <span className="text-xs text-text-muted">
                    {facility.rating} ({facility.reviews.toLocaleString()})
                  </span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {facility.specialties.map((spec) => (
                    <span key={spec} className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs text-text-muted">
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${facility.lat},${facility.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    id={`directions-${facility.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-primary text-xs px-4 py-2 rounded-lg no-underline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 11l19-9-9 19-2-8-8-2z" />
                    </svg>
                    Get Directions
                  </a>

                  <a
                    href={`tel:${facility.phone}`}
                    id={`call-${facility.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-secondary text-xs px-4 py-2 rounded-lg no-underline"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.11 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    Call
                  </a>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-text-muted text-sm">No facilities match your search.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
