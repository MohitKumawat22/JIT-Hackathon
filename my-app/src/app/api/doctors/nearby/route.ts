import { NextRequest, NextResponse } from"next/server";

const MAPPLS_KEY = process.env.MAPPLS_API_KEY;
const PHI = Math.PI * (3 - Math.sqrt(5)); // golden angle for spiral spread

const ALL_SLOTS = ["9:00 AM","10:30 AM","12:00 PM","2:30 PM","4:00 PM","6:00 PM","7:30 PM"];

function randomSlots() {
 return ALL_SLOTS.sort(() => 0.5 - Math.random()).slice(0, 3).sort((a, b) =>
 new Date(`1970/01/01 ${a}`).getTime() - new Date(`1970/01/01 ${b}`).getTime()
 );
}

// Approximate lat/lng from distance using golden-angle spiral
function approxCoords(userLat: number, userLng: number, distMetres: number, index: number) {
 const angle = index * PHI;
 const R = 6371000;
 const dLat = (distMetres * Math.cos(angle)) / R * (180 / Math.PI);
 const dLng = (distMetres * Math.sin(angle)) / R * (180 / Math.PI) / Math.cos(userLat * Math.PI / 180);
 return {
 lat: +(userLat + dLat).toFixed(6),
 lng: +(userLng + dLng).toFixed(6),
 };
}

export async function GET(req: NextRequest) {
 const { searchParams } = new URL(req.url);
 const lat = searchParams.get("lat") ||"28.6139";
 const lng = searchParams.get("lng") ||"77.2090";
 const specialty = searchParams.get("specialty") ||"";
 const userLat = parseFloat(lat);
 const userLng = parseFloat(lng);

 if (!MAPPLS_KEY) {
 return NextResponse.json({ doctors: [], source:"no_key" });
 }

 try {
 // Search for both hospitals and clinics in parallel using single keywords that Mappls accepts
 const keywords = ["hospital","clinic","doctor"];
 const allResults = await Promise.all(
 keywords.map(async (kw) => {
 const url =
 `https://search.mappls.com/search/places/nearby/json` +
 `?access_token=${MAPPLS_KEY}` +
 `&refLocation=${userLat},${userLng}` +
 `&keywords=${encodeURIComponent(kw)}` +
 `&radius=5000`;

 const res = await fetch(url);
 if (!res.ok || res.status === 204) return [];
 const data = await res.json().catch(() => ({}));
 return (data.suggestedLocations || []).map((loc: any) => ({ ...loc, _kw: kw }));
 })
 );

 // De-duplicate by eLoc
 const seen = new Set<string>();
 const merged = allResults.flat().filter((loc: any) => {
 if (seen.has(loc.eLoc)) return false;
 seen.add(loc.eLoc);
 return true;
 });

 if (merged.length === 0) {
 return NextResponse.json({ doctors: [], source:"empty" });
 }

 // Filter by specialty keyword if provided
 const filtered = specialty
 ? merged.filter((loc: any) =>
 (loc.placeName ||"").toLowerCase().includes(specialty.toLowerCase()) ||
 (loc.placeAddress ||"").toLowerCase().includes(specialty.toLowerCase())
 )
 : merged;

 const results = (filtered.length > 0 ? filtered : merged).slice(0, 9);

 const doctors = results.map((loc: any, index: number) => {
 const distMetres = loc.distance || (index + 1) * 350;
 const distKm = +(distMetres / 1000).toFixed(2);
 const coords = approxCoords(userLat, userLng, distMetres, index);
 const name = loc.placeName ||"Nearby Clinic";
 const initials = name.substring(0, 2).toUpperCase();
 const isHospital = name.toLowerCase().includes("hospital") ||
 (loc.keywords || []).some((k: string) => k ==="HLTHSP");

 return {
 id: loc.eLoc || `doc-${index}`,
 name,
 specialty: isHospital ?"Hospital" :"General Clinic",
 fee: `₹${Math.floor(Math.random() * 8 + 3) * 100}`,
 avatar: initials,
 slots: randomSlots(),
 rating: +(3.5 + Math.random() * 1.5).toFixed(1),
 experience:`${Math.floor(Math.random() * 15 + 2)} yrs`,
 available: true,
 distance: distKm,
 address: loc.placeAddress ||"",
 lat: coords.lat,
 lng: coords.lng,
 phone: `91${Math.floor(Math.random() * 900000000 + 9000000000)}`,
 };
 });

 return NextResponse.json({ doctors, source:"mappls" });
 } catch (error) {
 console.error("Nearby Doctors API Error:", error);
 return NextResponse.json({ doctors: [], source:"error" });
 }
}
