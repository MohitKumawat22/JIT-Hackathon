import { NextRequest, NextResponse } from"next/server";
import connectDB from"@/lib/mongodb";
import DoctorProfile from"@/models/DoctorProfile";
import User from"@/models/User";

export async function GET() {
 try {
 await connectDB();
 // Find all users with role 'doctor' and populate their profiles
 const doctors = await DoctorProfile.find().populate("userId","name email");
 return NextResponse.json({ doctors }, { status: 200 });
 } catch (error: any) {
 console.error("Fetch Doctors Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
