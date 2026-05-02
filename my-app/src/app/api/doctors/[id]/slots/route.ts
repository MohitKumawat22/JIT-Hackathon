import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import DoctorProfile from "@/models/DoctorProfile";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;

    const profile = await DoctorProfile.findOne({ userId: id });

    if (!profile) {
      return NextResponse.json({ error: "Doctor profile not found" }, { status: 404 });
    }

    // Filter slots that are NOT booked
    const availableSlots = profile.availableSlots.filter((slot: any) => !slot.isBooked);

    return NextResponse.json({ availableSlots }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Slots Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
