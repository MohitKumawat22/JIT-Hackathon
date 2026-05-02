import { NextResponse } from "next/server";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// GET — Search nearby hospitals/clinics via Google Places API
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = searchParams.get("radius") || "5000";
    const type = searchParams.get("type") || "hospital";

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "lat and lng are required." },
        { status: 400 }
      );
    }

    if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "your_google_maps_api_key_here") {
      // Return fallback data when API key is not configured
      return NextResponse.json({
        facilities: getFallbackFacilities(parseFloat(lat), parseFloat(lng)),
        source: "fallback",
        message: "Using demo data. Add GOOGLE_MAPS_API_KEY to .env.local for real results.",
      });
    }

    // Call Google Places Nearby Search
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      return NextResponse.json(
        { error: `Google Places API error: ${data.status}`, facilities: getFallbackFacilities(parseFloat(lat), parseFloat(lng)), source: "fallback" },
        { status: 200 }
      );
    }

    // Normalize results
    const facilities = (data.results || []).map((place, i) => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || "",
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      rating: place.rating || 0,
      reviews: place.user_ratings_total || 0,
      open: place.opening_hours?.open_now ?? true,
      types: place.types || [],
      type: place.types?.includes("hospital") ? "Hospital" : "Clinic",
      emergency: place.types?.includes("hospital"),
      placeId: place.place_id,
      icon: place.icon,
      distance: haversineDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      ),
    }));

    // Sort by distance
    facilities.sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ facilities, source: "google" });
  } catch (error) {
    console.error("Places API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch places.", facilities: [], source: "error" },
      { status: 500 }
    );
  }
}

// Haversine formula for distance (km)
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

// Fallback facilities generated relative to user's actual position
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

  return offsets.map((o, i) => {
    const fLat = lat + o.dLat;
    const fLng = lng + o.dLng;
    return {
      id: `fallback-${i + 1}`,
      name: o.name,
      address: `Near ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`,
      lat: fLat,
      lng: fLng,
      rating: +(3.8 + Math.random() * 1.2).toFixed(1),
      reviews: Math.floor(200 + Math.random() * 2800),
      open: Math.random() > 0.2,
      type: o.type,
      types: o.type === "Hospital" ? ["hospital", "health"] : ["doctor", "health"],
      emergency: o.emergency,
      placeId: `fallback-${i + 1}`,
      distance: haversineDistance(lat, lng, fLat, fLng),
    };
  }).sort((a, b) => a.distance - b.distance);
}
