import { NextRequest, NextResponse } from "next/server";

const MAPPLS_API_KEY = "smnqwhllvviswabgqruxhoplcqknivrdwxru";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat") || "28.6139";
  const lng = searchParams.get("lng") || "77.2090";
  const specialty = searchParams.get("specialty") || "doctor";

  try {
    const url = `https://search.mappls.com/search/places/nearby/json?access_token=${MAPPLS_API_KEY}&refLocation=${lat},${lng}&keywords=${encodeURIComponent(specialty)}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.suggestedLocations) {
      console.error("Mappls error response:", data);
      throw new Error("Mappls API failed");
    }

    // Map the locations to our expected Doctor format
    const doctors = data.suggestedLocations.map((loc: any, index: number) => {
      const name = loc.placeName;

      // Generate random fee between 300 and 1000
      const fee = `₹${Math.floor(Math.random() * 8 + 3) * 100}`;
      
      // Generate some random available slots
      const allSlots = ["9:00 AM", "10:30 AM", "12:00 PM", "2:30 PM", "4:00 PM", "6:00 PM"];
      const slots = allSlots.sort(() => 0.5 - Math.random()).slice(0, 3).sort((a, b) => {
        // Simple time sort
        const timeA = new Date(`1970/01/01 ${a}`);
        const timeB = new Date(`1970/01/01 ${b}`);
        return timeA.getTime() - timeB.getTime();
      });

      return {
        id: loc.eLoc || index.toString(),
        name: name,
        specialty: specialty === "doctor" ? "General Clinic" : specialty,
        fee: fee,
        avatar: name.substring(0, 2).toUpperCase(),
        slots: slots,
        distance: loc.distance,
        address: loc.placeAddress,
        available: true
      };
    });

    return NextResponse.json({ doctors });
  } catch (error) {
    console.error("Nearby Doctors API Error:", error);
    return NextResponse.json({ error: "Failed to fetch nearby doctors" }, { status: 500 });
  }
}
