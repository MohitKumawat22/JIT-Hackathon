import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import Patient from "@/models/Patient";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { firstName, lastName, email, phone, username, password, age, blood } = body;

    // Validation
    if (!firstName || !lastName || !email || !username || !password) {
      return NextResponse.json(
        { error: "First name, last name, email, username, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Check duplicates
    const existingEmail = await Patient.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const existingUsername = await Patient.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return NextResponse.json(
        { error: "This username is already taken." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create patient
    const patient = await Patient.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      username: username.toLowerCase().trim(),
      password: hashedPassword,
      age: age || null,
      blood: blood || "",
    });

    return NextResponse.json(
      {
        message: "Registration successful",
        patient: {
          id: patient._id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          email: patient.email,
          username: patient.username,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
