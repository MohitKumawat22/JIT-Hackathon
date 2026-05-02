import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { message, conversationHistory } = await req.json();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const systemPrompt = `You are MediAI, a smart hospital assistant. When the user gives a command, respond with a JSON object like this:
{ 
  "intent": "book_appointment"|"set_reminder"|"get_appointments"|"find_doctor"|"chat", 
  "data": { ... },
  "message": "A friendly confirmation message"
}

For book_appointment: data = { "doctorName": string, "date": "YYYY-MM-DD", "time": "HH:MM", "complaint": string }
For set_reminder: data = { "medicineName": string, "dosage": string, "frequency": "once_daily"|"twice_daily"|"thrice_daily", "times": ["HH:MM"] }
For find_doctor: data = { "specialty": string }
For get_appointments: data = {}
For chat: data = { "reply": string }

Current Date: ${new Date().toISOString().split('T')[0]}
Current Time: ${new Date().toTimeString().slice(0, 5)}

Only respond with the JSON, no extra text.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory.map((m: any) => ({
        role: m.role,
        content: m.content
      })).concat([{ role: "user", content: message }]),
    });

    const text = (response.content[0] as any).text;
    let parsed;
    try {
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { intent: "chat", data: { reply: text }, message: text };
    }

    let actionResult = null;
    let success = true;

    // Perform real DB actions based on intent
    try {
      if (parsed.intent === "book_appointment" && session?.user) {
        // 1. Find doctor
        const doctorsRes = await fetch(`${baseUrl}/api/doctors`);
        const { doctors } = await doctorsRes.json();
        const doctor = doctors.find((d: any) => 
          d.userId.name.toLowerCase().includes(parsed.data.doctorName.toLowerCase())
        );

        if (doctor) {
          // 2. Book appointment
          const bookRes = await fetch(`${baseUrl}/api/appointments`, {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "Cookie": req.headers.get("cookie") || "" // Pass session cookie
            },
            body: JSON.stringify({
              doctorId: doctor.userId._id,
              patientInfo: {
                name: session.user.name,
                age: 30, // Mock age if not in session
                phone: "9999999999", // Mock phone
                complaint: parsed.data.complaint || "General checkup"
              },
              slot: {
                day: parsed.data.date, // Simplification for demo
                time: parsed.data.time
              }
            }),
          });
          actionResult = await bookRes.json();
        }
      } else if (parsed.intent === "set_reminder") {
        const res = await fetch(`${baseUrl}/api/reminders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...parsed.data,
            patientId: (session?.user as any)?.id || "guest",
            patientName: session?.user?.name || "Guest"
          }),
        });
        actionResult = await res.json();
      } else if (parsed.intent === "find_doctor") {
        const res = await fetch(`${baseUrl}/api/doctors`);
        const { doctors } = await res.json();
        actionResult = doctors.filter((d: any) => 
          d.specialty.toLowerCase().includes(parsed.data.specialty.toLowerCase())
        );
      } else if (parsed.intent === "get_appointments") {
        const res = await fetch(`${baseUrl}/api/appointments/patient`, {
          headers: { "Cookie": req.headers.get("cookie") || "" }
        });
        const data = await res.json();
        actionResult = data.appointments;
      }
    } catch (err) {
      console.error("Action execution failed:", err);
      success = false;
    }

    return NextResponse.json({
      message: parsed.message || parsed.data.reply || "Processing complete.",
      intent: parsed.intent,
      actionData: parsed.data,
      result: actionResult,
      success
    });

  } catch (error: any) {
    console.error("Chat API Error:", error);
    return NextResponse.json({
      message: "I had trouble processing that request.",
      intent: "error",
      success: false
    });
  }
}
