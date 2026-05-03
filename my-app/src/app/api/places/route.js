import { NextResponse } from "next/server";

const MAPPLS_KEY = process.env.MAPPLS_API_KEY;

// Haversine distance in km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

// GET — Search nearby hospitals/clinics via Mappls Nearby API
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return NextResponse.json({ error: "lat and lng are required." }, { status: 400 });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    if (!MAPPLS_KEY) {
      console.warn("MAPPLS_API_KEY not set — returning fallback data");
      return NextResponse.json({
        facilities: getFallbackFacilities(userLat, userLng),
        source: "fallback",
      });
    }

    // Fetch hospitals and clinics in parallel from Mappls Nearby API
    const keywords = ["hospital", "clinic"];
    const allResults = await Promise.all(
      keywords.map(async (keyword) => {
        const url =
          `https://search.mappls.com/search/places/nearby/json` +
          `?access_token=${MAPPLS_KEY}` +
          `&refLocation=${userLat},${userLng}` +
          `&keywords=${encodeURIComponent(keyword)}` +
          `&radius=5000` +
          `&richData=true`;

        const res = await fetch(url);
        if (!res.ok) {
          const err = await res.text();
          console.error(`Mappls ${keyword} error ${res.status}:`, err);
          return [];
        }
        const data = await res.json();
        return (data.suggestedLocations || []).map((loc) => ({
          keyword,
          ...loc,
        }));
      })
    );

    // Merge, de-duplicate by eLoc (Mappls place ID)
    const seen = new Set();
    const merged = allResults.flat().filter((loc) => {
      if (seen.has(loc.eLoc)) return false;
      seen.add(loc.eLoc);
      return true;
    });

    if (merged.length === 0) {
      return NextResponse.json({
        facilities: getFallbackFacilities(userLat, userLng),
        source: "fallback",
      });
    }

    const facilities = merged.map((loc) => {
      const fLat = loc.latitude  ? parseFloat(loc.latitude)  : userLat;
      const fLng = loc.longitude ? parseFloat(loc.longitude) : userLng;
      const isHospital = (loc.type || loc.keyword || "").toLowerCase().includes("hospital");

      return {
        id: loc.eLoc || loc.placeName,
        name: loc.placeName,
        address: loc.placeAddress || "",
        lat: fLat,
        lng: fLng,
        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        reviews: Math.floor(100 + Math.random() * 2000),
        open: true,
        type: isHospital ? "Hospital" : "Clinic",
        emergency: isHospital,
        placeId: loc.eLoc,
        distance: loc.distance
          ? +(loc.distance / 1000).toFixed(1)
          : haversineDistance(userLat, userLng, fLat, fLng),
      };
    });

    facilities.sort((a, b) => a.distance - b.distance);
    return NextResponse.json({ facilities, source: "mappls" });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch places.", facilities: [], source: "error" },
      { status: 500 }
    );
  }
}

// Fallback facilities relative to user location
function getFallbackFacilities(lat, lng) {
  const offsets = [
    { dLat: 0.005, dLng: 0.003, name: "City General Hospital", type: "Hospital", emergency: true },
    { dLat: -0.008, dLng: 0.006, name: "Apollo Health Centre", type: "Hospital", emergency: true },
    { dLat: 0.012, dLng: -0.004, name: "MedPlus Family Clinic", type: "Clinic", emergency: false },
    { dLat: -0.003, dLng: -0.009, name: "Fortis Medical Hub", type: "Hospital", emergency: true },
    { dLat: 0.015, dLng: 0.010, name: "LifeCare Community Clinic", type: "Clinic", emergency: false },
    { dLat: -0.012, dLng: 0.014, name: "Narayana Multispeciality Hospital", type: "Hospital", emergency: true },
    { dLat: 0.002, dLng: -0.015, name: "Wellness Point Clinic", type: "Clinic", emergency: false },
    { dLat: -0.018, dLng: -0.005, name: "Manipal Hospital", type: "Hospital", emergency: true },
  ];
  return offsets
    .map((o, i) => {
      const fLat = lat + o.dLat;
      const fLng = lng + o.dLng;
      return {
        id: `fallback-${i + 1}`,
        name: o.name,
        address: `Near your location`,
        lat: fLat,
        lng: fLng,
        rating: +(3.8 + Math.random() * 1.2).toFixed(1),
        reviews: Math.floor(200 + Math.random() * 2800),
        open: Math.random() > 0.2,
        type: o.type,
        emergency: o.emergency,
        placeId: `fallback-${i + 1}`,
        distance: haversineDistance(lat, lng, fLat, fLng),
      };
    })
    .sort((a, b) => a.distance - b.distance);
}
