import { NextResponse } from"next/server";
import connectDB from"@/lib/db";
import Reminder from"@/models/Reminder";

export async function POST(req) {
 try {
 await connectDB();
 const { reminderId, scheduledTime, status } = await req.json();

 const reminder = await Reminder.findById(reminderId);
 if (!reminder) return NextResponse.json({ error:"Not found" }, { status: 404 });

 // Deduct quantity only if actually taken
 if (status ==="taken") {
 reminder.remainingQuantity = Math.max(
 0,
 reminder.remainingQuantity - (reminder.tabletsPerDose || 1)
 );
 }

 reminder.takenLog.push({
 scheduledTime: new Date(scheduledTime),
 takenAt: status ==="taken" ? new Date() : undefined,
 status,
 quantityConsumed: status ==="taken" ? (reminder.tabletsPerDose || 1) : 0,
 });

 await reminder.save();
 return NextResponse.json({ reminder });
 } catch (error) {
 console.error("Mark Taken Error:", error);
 return NextResponse.json({ error:"Internal Server Error" }, { status: 500 });
 }
}
