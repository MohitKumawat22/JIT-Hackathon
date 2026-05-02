import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import DoctorProfile from "@/models/DoctorProfile";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "patient") {
      return NextResponse.json({ error: "Only patients can book appointments" }, { status: 401 });
    }

    const { doctorId, patientInfo, slot } = await req.json();

    if (!doctorId || !patientInfo || !slot) {
      return NextResponse.json({ error: "Missing booking information" }, { status: 400 });
    }

    await connectDB();

    // 1. Check if the slot is still available and mark it as booked
    const doctorProfile = await DoctorProfile.findOne({ userId: doctorId });
    if (!doctorProfile) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const slotIndex = doctorProfile.availableSlots.findIndex(
      (s: any) => s.day === slot.day && s.time === slot.time && !s.isBooked
    );

    if (slotIndex === -1) {
      return NextResponse.json({ error: "Slot no longer available" }, { status: 400 });
    }

    // Mark slot as booked
    doctorProfile.availableSlots[slotIndex].isBooked = true;
    await doctorProfile.save();

    // 2. Create the appointment record
    const appointment = await Appointment.create({
      doctorId,
      patientId: (session.user as any).id,
      patientInfo,
      slot,
      status: "pending",
    });

    return NextResponse.json({ message: "Appointment booked", appointment }, { status: 201 });
  } catch (error: any) {
    console.error("Booking Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
