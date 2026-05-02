import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reminder from "@/models/Reminder";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { reminderId, scheduledTime, status } = await request.json();

    if (!reminderId || !scheduledTime || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reminder = await Reminder.findById(reminderId);

    if (!reminder) {
      return NextResponse.json({ error: "Reminder not found" }, { status: 404 });
    }

    // Logic for quantity deduction
    if (status === "taken") {
      reminder.remainingQuantity = Math.max(0, reminder.remainingQuantity - reminder.tabletsPerDose);
    }

    // Add log entry
    reminder.takenLog.push({
      scheduledTime: new Date(scheduledTime),
      takenAt: status === "taken" ? new Date() : undefined,
      status: status as "taken" | "missed" | "skipped",
      quantityConsumed: status === "taken" ? reminder.tabletsPerDose : 0
    });

    await reminder.save();

    return NextResponse.json({ reminder }, { status: 200 });
  } catch (error) {
    console.error("Mark Taken Error:", error);
    return NextResponse.json({ error: "Failed to mark reminder as taken" }, { status: 500 });
  }
}
