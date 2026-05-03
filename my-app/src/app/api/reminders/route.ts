import { NextRequest, NextResponse } from"next/server";
import connectDB from"@/lib/mongodb";
import Reminder from"@/models/Reminder";

export async function GET(request: NextRequest) {
 try {
 await connectDB();
 const { searchParams } = new URL(request.url);
 const patientId = searchParams.get("patientId");
 const query: any = { isActive: true };
 if (patientId) query.patientId = patientId;

 const reminders = await Reminder.find(query).sort({ createdAt: -1 });
 return NextResponse.json({ reminders }, { status: 200 });
 } catch (error) {
 console.error("GET Reminders Error:", error);
 return NextResponse.json({ error:"Failed to fetch reminders" }, { status: 500 });
 }
}

export async function POST(request: NextRequest) {
 try {
 await connectDB();
 const body = await request.json();

 // Automatically set remainingQuantity equal to totalQuantity
 const newReminder = await Reminder.create({
 ...body,
 remainingQuantity: body.totalQuantity,
 });

 return NextResponse.json({ reminder: newReminder }, { status: 201 });
 } catch (error) {
 console.error("POST Reminder Error:", error);
 return NextResponse.json({ error:"Failed to create reminder" }, { status: 500 });
 }
}
