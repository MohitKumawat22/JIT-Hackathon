import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Appointment from "@/models/Appointment";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    );
    if (!updatedAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error: any) {
    console.error("PUT Appointment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const deletedAppointment = await Appointment.findByIdAndDelete(id);
    if (!deletedAppointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Appointment deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("DELETE Appointment Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
