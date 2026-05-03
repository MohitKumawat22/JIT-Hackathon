import { NextRequest, NextResponse } from"next/server";
import { getServerSession } from"next-auth";
import { authOptions } from"@/lib/authOptions";
import connectDB from"@/lib/mongodb";
import DoctorProfile from"@/models/DoctorProfile";

export async function POST(req: NextRequest) {
 try {
 const session = await getServerSession(authOptions);

 if (!session || (session.user as any).role !=="doctor") {
 return NextResponse.json({ error:"Unauthorized" }, { status: 401 });
 }

 const { specialty, hospital, bio, photo, availableSlots } = await req.json();

 await connectDB();

 const updatedProfile = await DoctorProfile.findOneAndUpdate(
 { userId: (session.user as any).id },
 {
 specialty,
 hospital,
 bio,
 photo,
 availableSlots,
 },
 { upsert: true, new: true }
 );

 return NextResponse.json({ message:"Profile updated", profile: updatedProfile }, { status: 200 });
 } catch (error: any) {
 console.error("Profile Update Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
