import { NextRequest, NextResponse } from"next/server";
import connectDB from"@/lib/mongodb";
import User from"@/models/User";
import bcrypt from"bcryptjs";

export async function POST(req: NextRequest) {
 try {
 const { name, email, password, role } = await req.json();

 if (!name || !email || !password || !role) {
 return NextResponse.json({ error:"Missing fields" }, { status: 400 });
 }

 await connectDB();

 const existingUser = await User.findOne({ email });
 if (existingUser) {
 return NextResponse.json({ error:"User already exists" }, { status: 400 });
 }

 const hashedPassword = await bcrypt.hash(password, 12);

 const newUser = await User.create({
 name,
 email,
 password: hashedPassword,
 role,
 });

 return NextResponse.json(
 { message:"User registered successfully", userId: newUser._id },
 { status: 201 }
 );
 } catch (error: any) {
 console.error("Registration Error:", error);
 return NextResponse.json({ error: error.message }, { status: 500 });
 }
}
