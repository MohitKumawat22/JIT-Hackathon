import { NextRequest, NextResponse } from "next/server";

const MAPPLS_KEY = process.env.MAPPLS_API_KEY;

const FALLBACK_DOCTORS = [
  { id: 1, name: "Dr. Priya Sharma",  specialty: "Cardiologist",      fee: "₹500", avatar: "PS", slots: ["10:00 AM", "11:30 AM", "2:00 PM", "4:30 PM"], available: true },
  { id: 2, name: "Dr. Rajesh Kumar",  specialty: "Neurologist",       fee: "₹700", avatar: "RK", slots: ["9:00 AM", "12:00 PM", "3:00 PM"],             available: true },
  { id: 3, name: "Dr. Anita Desai",   specialty: "Dermatologist",     fee: "₹400", avatar: "AD", slots: ["10:30 AM", "1:00 PM", "3:30 PM", "5:00 PM"],  available: true },
  { id: 4, name: "Dr. Vikram Singh",  specialty: "Orthopedic",        fee: "₹600", avatar: "VS", slots: ["9:00 AM", "11:00 AM"],                         available: false },
  { id: 5, name: "Dr. Meera Patel",   specialty: "Pediatrician",      fee: "₹450", avatar: "MP", slots: ["9:30 AM", "11:00 AM", "2:30 PM"],             available: true },
  { id: 6, name: "Dr. Arjun Mehta",   specialty: "General Physician", fee: "₹300", avatar: "AM", slots: ["10:00 AM", "12:30 PM", "4:00 PM", "5:30 PM"], available: true },
];

const ALL_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM", "4:00 PM", "6:00 PM"];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat       = searchParams.get("lat")       || "28.6139";
  const lng       = searchParams.get("lng")       || "77.2090";
  const specialty = searchParams.get("specialty") || "doctor";

  // No API key → return fallback hardcoded list filtered by specialty
  if (!MAPPLS_KEY) {
    const filtered = specialty === "doctor"
      ? FALLBACK_DOCTORS
      : FALLBACK_DOCTORS.filter((d) =>
          d.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
    return NextResponse.json({ doctors: filtered.length ? filtered : FALLBACK_DOCTORS, source: "fallback" });
  }

  try {
    const url =
      `https://search.mappls.com/search/places/nearby/json` +
      `?access_token=${MAPPLS_KEY}` +
      `&refLocation=${lat},${lng}` +
      `&keywords=${encodeURIComponent(specialty === "doctor" ? "clinic hospital" : specialty)}` +
      `&radius=5000`;

    const res  = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.suggestedLocations?.length) {
      console.warn("Mappls nearby returned no results — using fallback");
      return NextResponse.json({ doctors: FALLBACK_DOCTORS, source: "fallback" });
    }

    const doctors = data.suggestedLocations.slice(0, 8).map((loc: any, index: number) => {
      const slots = ALL_SLOTS.sort(() => 0.5 - Math.random()).slice(0, 3).sort((a: string, b: string) =>
        new Date(`1970/01/01 ${a}`).getTime() - new Date(`1970/01/01 ${b}`).getTime()
      );
      const initials = (loc.placeName || "CL").substring(0, 2).toUpperCase();
      return {
        id:        loc.eLoc || index.toString(),
        name:      loc.placeName,
        specialty: specialty === "doctor" ? "General Clinic" : specialty,
        fee:       `₹${Math.floor(Math.random() * 8 + 3) * 100}`,
        avatar:    initials,
        slots,
        distance:  loc.distance ? +(loc.distance / 1000).toFixed(1) : null,
        address:   loc.placeAddress || "",
        phone:     `91${Math.floor(Math.random() * 900000000 + 9000000000)}`,
        available: true,
      };
    });

    return NextResponse.json({ doctors, source: "mappls" });
  } catch (error) {
    console.error("Nearby Doctors API Error:", error);
    return NextResponse.json({ doctors: FALLBACK_DOCTORS, source: "fallback" });
  }
}
