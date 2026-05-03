"use client";

import Link from"next/link";
import { useState, useEffect, useCallback } from"react";

/* ───────────────────────────────────────────
 Filter / Sort helpers
 ─────────────────────────────────────────── */
const FILTER_OPTIONS = ["All","Hospital","Clinic"];
const SORT_OPTIONS = [
 { value:"distance", label:"Nearest First" },
 { value:"rating", label:"Top Rated" },
];

/* ───────────────────────────────────────────
 Star component
 ─────────────────────────────────────────── */
function Stars({ rating }) {
 const full = Math.floor(rating);
 const half = rating % 1 >= 0.3;
 return (
 <div className="flex items-center gap-0.5">
 {Array.from({ length: 5 }).map((_, i) => (
 <svg key={i} width="14" height="14" viewBox="0 0 24 24"
 fill={i < full ?"#feca57" : i === full && half ?"url(#halfGrad)" :"none"}
 stroke={i < full || (i === full && half) ?"#feca57" :"rgba(255,255,255,0.15)"}
 strokeWidth="1.5">
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
 Save booking to MongoDB
 ─────────────────────────────────────────── */
async function saveBooking(facility) {
 try {
 const patient = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (!patient?.id) return;

 await fetch("/api/bookings", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify({
 patientId: patient.id,
 facilityName: facility.name,
 address: facility.address,
 lat: facility.lat,
 lng: facility.lng,
 rating: facility.rating,
 placeId: facility.placeId || facility.id,
 department: facility.type ==="Hospital" ?"Emergency" :"General",
 status:"upcoming",
 }),
 });
 } catch (e) {
 console.error("Failed to save booking:", e);
 }
}

/* ───────────────────────────────────────────
 Page component
 ─────────────────────────────────────────── */
export default function LocatePage() {
 const [facilities, setFacilities] = useState([]);
 const [filter, setFilter] = useState("All");
 const [sort, setSort] = useState("distance");
 const [selectedId, setSelectedId] = useState(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [userLocation, setUserLocation] = useState(null);
 const [loadState, setLoadState] = useState("locating"); // locating | loading | ready | error
 const [errorMsg, setErrorMsg] = useState("");
 const [dataSource, setDataSource] = useState("");
 const [refillCount, setRefillCount] = useState(0);

 useEffect(() => {
 const patient = JSON.parse(sessionStorage.getItem("medconnect_patient") ||"null");
 if (!patient?.id) return;
 fetch(`/api/reminders?patientId=${patient.id}`)
 .then(res => res.json())
 .then(data => {
 const meds = data.reminders || [];
 const count = meds.filter(m => m.remainingQuantity <= (m.tabletsPerDose * m.refillAlertDays * m.dailyDoses)).length;
 setRefillCount(count);
 })
 .catch(err => console.error(err));
 }, []);

 // Get user location & fetch facilities
 useEffect(() => {
 const fetchFacilities = async (lat, lng) => {
 setUserLocation({ lat, lng });
 setLoadState("loading");

 try {
 const res = await fetch(`/api/places?lat=${lat}&lng=${lng}&radius=5000&type=hospital`);
 const data = await res.json();

 if (data.facilities && data.facilities.length > 0) {
 setFacilities(data.facilities);
 setDataSource(data.source ||"unknown");
 } else {
 setFacilities([]);
 }
 setLoadState("ready");
 } catch (err) {
 console.error("Places fetch error:", err);
 setLoadState("error");
 setErrorMsg("Failed to fetch nearby facilities.");
 }
 };

 if ("geolocation" in navigator) {
 navigator.geolocation.getCurrentPosition(
 (pos) => fetchFacilities(pos.coords.latitude, pos.coords.longitude),
 (err) => {
 console.warn("Geolocation error or denied. Falling back to default coordinates.", err);
 fetchFacilities(28.6139, 77.2090); // Fallback to Central Delhi
 },
 { enableHighAccuracy: true, timeout: 5000 }
 );
 } else {
 fetchFacilities(28.6139, 77.2090);
 }
 }, []);

 // Filter + sort
 const filtered = facilities
 .filter((f) => filter ==="All" || f.type === filter)
 .filter((f) =>
 searchQuery ==="" ||
 f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 (f.address ||"").toLowerCase().includes(searchQuery.toLowerCase())
 )
 .sort((a, b) =>
 sort ==="distance" ? a.distance - b.distance : b.rating - a.rating
 );

 const selected = facilities.find((f) => f.id === selectedId);

 const handleGetDirections = (facility, e) => {
 e.stopPropagation();
 saveBooking(facility);
 // Use name+address search for accurate directions (coords are approximate from Mappls)
 const query = encodeURIComponent(`${facility.name} ${facility.address}`);
 window.open(
 `https://www.google.com/maps/search/?api=1&query=${query}`,"_blank"
 );
 };

 return (
 <div className="flex flex-col h-screen overflow-hidden">
 {/* ── Header ── */}
 <header className="px-6 py-4 flex items-center justify-between border-b border-border shrink-0">
 <Link href="/" className="flex items-center gap-2 no-underline">
 <div className="w-8 h-8 rounded-lg from-primary to-accent flex items-center justify-center shadow">
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
 </div>
 <span className="text-lg font-bold tracking-tight">
 Amrit<span className="text-[#10B981]">Care</span> <span className="text-xs font-medium text-[#059669] bg-[#D1FAE5] px-1.5 py-0.5 rounded-md ml-0.5">AI</span>
 </span>
 </Link>
 <div className="flex items-center gap-4">
 <Link href="/patient/triage" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">AI Triage</Link>
 <Link href="/patient/history" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">History</Link>
 <Link href="/reminders" className="relative text-sm text-text-muted hover:text-foreground transition-colors no-underline flex items-center">
 💊 Reminders
 {refillCount > 0 && (
 <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
 {refillCount}
 </span>
 )}
 </Link>
 <Link href="/patient/login" className="text-sm text-text-muted hover:text-foreground transition-colors no-underline">Patient Portal</Link>
 </div>
 </header>

 <main className="flex-1 flex flex-col lg:flex-row min-h-0">
 {/* ── LEFT: Map ── */}
 <section className="lg:flex-1 relative min-h-[350px] lg:min-h-0 bg-[#0d1420] border-b lg:border-b-0 lg:border-r border-border">
 <div className="absolute inset-0 opacity-[0.04]" style={{
 backgroundImage:"linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
 backgroundSize:"40px 40px",
 }} />
 <div className="absolute inset-0 from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

 {/* Loading states */}
 {(loadState ==="locating" || loadState ==="loading") && (
 <div className="absolute inset-0 flex items-center justify-center z-20">
 <div className="glass rounded-xl px-6 py-4 flex items-center gap-3">
 <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
 <span className="text-sm text-text-secondary">
 {loadState ==="locating" ?"Getting your location..." :"Finding nearby hospitals..."}
 </span>
 </div>
 </div>
 )}

 {loadState ==="error" && (
 <div className="absolute inset-0 flex items-center justify-center z-20">
 <div className="glass rounded-xl px-6 py-4 text-center max-w-xs">
 <p className="text-red-400 text-sm mb-2"> {errorMsg}</p>
 <button onClick={() => window.location.reload()} className="btn-primary text-xs px-4 py-2">
 Retry
 </button>
 </div>
 </div>
 )}

 {/* Real Google Map */}
 {loadState ==="ready" && userLocation && (
 <iframe
 src={`https://maps.google.com/maps?q=${selected
 ? encodeURIComponent(selected.name + ' ' + selected.address)
 : `${userLocation.lat},${userLocation.lng}`}&z=${selected ? 16 : 13}&output=embed`}
 width="100%"
 height="100%"
 style={{ border: 0, filter:"invert(90%) hue-rotate(180deg)" }}
 allowFullScreen=""
 loading="lazy"
 referrerPolicy="no-referrer-when-downgrade"
 className="absolute inset-0 w-full h-full z-10"
 ></iframe>
 )}

 {/* Map badge */}
 <div className="absolute top-4 left-4 glass rounded-xl px-4 py-2.5 flex items-center gap-2 z-10">
 <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
 <span className="text-xs text-text-secondary font-medium">
 {loadState ==="ready"
 ? dataSource ==="mappls" ?"📍 Live — Mappls" : dataSource ==="google" ?"Live — Google Places" :"Live — Your Location"
 :"Locating..."}
 </span>
 </div>

 {/* Selected popup */}
 {selected && (
 <div className="absolute bottom-4 left-4 right-16 lg:right-auto lg:max-w-xs glass rounded-xl p-4 animate-slide-up z-10">
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

 {/* ── RIGHT: Facility List ── */}
 <section className="lg:w-[440px] xl:w-[480px] flex flex-col flex-1 min-h-0">
 {/* Search + Filters */}
 <div className="p-4 space-y-3 border-b border-border">
 <div className="relative">
 <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <circle cx="11" cy="11" r="8" />
 <path d="m21 21-4.3-4.3" />
 </svg>
 <input id="facility-search" type="text" value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search by name or address..."
 className="input-field pl-10 py-2.5 text-sm" />
 </div>
 <div className="flex items-center justify-between gap-3">
 <div className="flex gap-1.5">
 {FILTER_OPTIONS.map((opt) => (
 <button key={opt} id={`filter-${opt.toLowerCase()}`} onClick={() => setFilter(opt)}
 className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
 filter === opt
 ?"bg-primary/15 text-primary border border-primary/30"
 :"bg-surface text-text-muted border border-border hover:border-border-hover hover:text-text-secondary"
 }`}>{opt}</button>
 ))}
 </div>
 <select id="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}
 className="bg-surface border border-border rounded-lg px-2.5 py-1.5 text-xs text-text-secondary outline-none focus:border-primary transition-colors cursor-pointer">
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
 {dataSource ==="fallback" && (
 <span className="text-yellow-400 ml-2">(demo data — add Google API key for real results)</span>
 )}
 </p>
 </div>

 {/* List */}
 <div className="flex-1 overflow-y-auto">
 {loadState !=="ready" && loadState !=="error" && (
 <div className="p-4 space-y-4">
 {[1, 2, 3, 4].map((i) => (
 <div key={i} className="animate-pulse">
 <div className="h-4 bg-surface rounded w-3/4 mb-2" />
 <div className="h-3 bg-surface rounded w-1/2 mb-3" />
 <div className="flex gap-2 mb-3">
 <div className="h-5 bg-surface rounded-full w-16" />
 <div className="h-5 bg-surface rounded-full w-16" />
 </div>
 <div className="h-8 bg-surface rounded w-32" />
 </div>
 ))}
 </div>
 )}

 {loadState ==="ready" && filtered.map((facility, i) => (
 <div key={facility.id} id={`facility-${facility.id}`}
 onClick={() => setSelectedId(facility.id === selectedId ? null : facility.id)}
 className={`p-4 border-b border-border cursor-pointer transition-all hover:bg-surface-hover ${
 selectedId === facility.id ?"bg-primary/[0.04] border-l-2 border-l-primary" :""
 }`}>
 <div className="flex items-start justify-between gap-3 mb-2">
 <div className="flex-1 min-w-0">
 <h3 className="text-sm font-semibold truncate mb-0.5">{facility.name}</h3>
 <p className="text-xs text-text-muted truncate">{facility.address}</p>
 </div>
 <div className="shrink-0 text-right">
 <span className="text-sm font-bold text-primary">{facility.distance}</span>
 <span className="text-xs text-text-muted ml-0.5">km</span>
 </div>
 </div>

 <div className="flex items-center flex-wrap gap-1.5 mb-3">
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
 facility.type ==="Hospital" ?"bg-secondary/10 text-secondary" :"bg-accent/10 text-accent"
 }`}>{facility.type ==="Hospital" ?"🏥" :"🏨"} {facility.type}</span>
 {facility.emergency && (
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400">🚑 24/7 ER</span>
 )}
 <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
 facility.open ?"bg-green-500/10 text-green-400" :"bg-red-500/10 text-red-400"
 }`}>{facility.open ?"Open Now" :"Closed"}</span>
 </div>

 <div className="flex items-center gap-3 mb-3">
 <Stars rating={facility.rating} />
 <span className="text-xs text-text-muted">
 {facility.rating} ({(facility.reviews || 0).toLocaleString()})
 </span>
 </div>

 <div className="flex items-center gap-2">
 <button
 id={`directions-${facility.id}`}
 onClick={(e) => handleGetDirections(facility, e)}
 className="btn-primary text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
 >
 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M3 11l19-9-9 19-2-8-8-2z" />
 </svg>
 Get Directions
 </button>
 </div>
 </div>
 ))}

 {loadState ==="ready" && filtered.length === 0 && (
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
