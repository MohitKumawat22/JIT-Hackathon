import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "patient") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const appointments = await Appointment.find({ patientId: (session.user as any).id })
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ appointments }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch Patient Appointments Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
