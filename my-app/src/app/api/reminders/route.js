import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Reminder from "@/models/Reminder";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");
    
    if (!patientId) return NextResponse.json({ error: "patientId required" }, { status: 400 });

    const reminders = await Reminder.find({ patientId }).sort({ time: 1 });
    return NextResponse.json({ reminders });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();
    const reminder = await Reminder.create(body);
    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await Reminder.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, isActive } = body;
    const reminder = await Reminder.findByIdAndUpdate(id, { isActive }, { new: true });
    return NextResponse.json({ reminder });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
