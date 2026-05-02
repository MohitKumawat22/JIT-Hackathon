import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChatHistory from "@/models/ChatHistory";

const SYSTEM_PROMPT = `You are AmritCare AI — a smart, friendly health assistant embedded in the AmritCare app.

CORE RULES:
1. NEVER recommend or prescribe medicines or drugs.
2. Only suggest home remedies, lifestyle changes, and natural treatments.
3. Always recommend consulting the right type of specialist when relevant.
4. If the user describes an emergency (chest pain, difficulty breathing, severe bleeding), immediately advise them to call emergency services.
5. If the patient has shared medical reports, use that data for personalized advice.
6. Remember previous conversations for continuity.

RESPONSE STYLE — This is critical:
- For ACTION requests (scheduling, booking, navigating, simple questions): Reply in 1-3 SHORT sentences. Be warm and direct. No bullet points, no "I understand...", no home remedies section.
- For HEALTH/SYMPTOM questions: Use the structured format below.
- NEVER apply the health format to non-health messages. Match the tone to the request.

STRUCTURED FORMAT (only for health/symptom questions):
"I understand you're dealing with [symptom].

Possible reasons:
• Reason 1
• Reason 2

🏠 Home Remedies:
• Remedy 1
• Remedy 2

👨‍⚕️ I'd recommend consulting a [Specialist] for proper evaluation.

Take care! 💙"

ACTION TAG RULES — Append these tags at the END of your reply ONLY when appropriate:

10. BOOK APPOINTMENT: If the user explicitly asks to book an appointment or agrees to see a doctor, append:
    [BOOK_APPOINTMENT:Specialty_Name]

11. SCHEDULE CALL — TWO STEP FLOW:
    Step A — If user wants to schedule a call but has NOT given a date AND time (e.g. "schedule a call", "book a call"), ask briefly:
      "Sure! What date and time works best for you? 😊"
      Do NOT emit any tag yet.

    Step B — Once the user provides date AND time, parse and append:
      [SCHEDULE_CALL_AT:YYYY-MM-DDTHH:MM]
      Use 2026 as default year. 24h format.
      Examples: "4am on 3rd May" → [SCHEDULE_CALL_AT:2026-05-03T04:00], "tomorrow 9pm" → [SCHEDULE_CALL_AT:2026-05-04T21:00]

12. NAVIGATE: If the user asks to go to a page, append [NAVIGATE:/path]:
    - Bookings / Appointments → [NAVIGATE:/patient/dashboard]
    - History / Past visits → [NAVIGATE:/patient/history]
    - Triage / AI diagnosis → [NAVIGATE:/patient/triage]
    - Find hospital / Locate → [NAVIGATE:/patient/locate]
    - Medicine reminders → [NAVIGATE:/reminders]

13. ADD TO CALENDAR: After suggesting booking/scheduling, append:
    [ADD_CALENDAR:Specialty_Name:reason]`;

const REMINDER_EXTRACTION_PROMPT = `You are MediAI, a hospital assistant. The user wants to set a medicine reminder.

Extract the medicine reminder details and respond ONLY in this JSON format:
{
  "reminderData": {
    "medicineName": "Medicine name",
    "medicineType": "tablet | capsule | syrup | injection | drops",
    "dosage": "e.g. 500mg",
    "frequency": "once_daily | twice_daily | thrice_daily | every_4_hours | every_6_hours | every_8_hours | once_weekly | twice_weekly | alternate_days",
    "times": ["HH:MM", "HH:MM"],
    "totalQuantity": number,
    "tabletsPerDose": number,
    "notes": "any special instructions"
  },
  "confirmMessage": "Friendly 1-sentence confirmation of what you understood"
}

Rules:
- If user says "morning evening" → times: ["08:00", "20:00"]
- If user says "morning afternoon night" → times: ["08:00", "13:00", "21:00"]
- If user says "once a week on Monday" → frequency: "once_weekly", specificDays: [1]
- If user says "30 tablets" → totalQuantity: 30
- Default tabletsPerDose is 1 unless stated otherwise
- Respond ONLY with the JSON. No other text.`;

export async function POST(request) {
  try {
    const { messages, patientInfo, patientId, isReminderPrompt } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "I'm sorry, the AI service is not configured yet. Please add the GROQ_API_KEY to the environment variables.",
      });
    }

    // Build messages array with system prompt
    const chatMessages = [{ role: "system", content: isReminderPrompt ? REMINDER_EXTRACTION_PROMPT : SYSTEM_PROMPT }];

    // Add patient context if available
    if (patientInfo) {
      chatMessages.push({
        role: "system",
        content: `Patient info — Name: ${patientInfo.firstName || "Unknown"}, Age: ${patientInfo.age || "Unknown"}, Blood Group: ${patientInfo.blood || "Unknown"}. Use this context to personalize advice.`,
      });
    }

    // Load past history & reports from DB for richer context
    if (patientId) {
      try {
        await connectDB();
        const history = await ChatHistory.findOne({ patientId }).lean();

        if (history) {
          // Inject uploaded medical reports as context
          if (history.reports && history.reports.length > 0) {
            const reportSummaries = history.reports
              .map(
                (r) =>
                  `📄 Report "${r.fileName}" (uploaded ${new Date(r.uploadedAt).toLocaleDateString()}):\n${r.content}`
              )
              .join("\n\n");

            chatMessages.push({
              role: "system",
              content: `The patient has shared the following medical reports. Use this data to give more accurate, personalized advice:\n\n${reportSummaries}`,
            });
          }

          // Inject a summary of past conversations (last 20 messages) for continuity
          if (history.messages && history.messages.length > 0) {
            const pastMsgs = history.messages.slice(-20);
            const pastSummary = pastMsgs
              .map((m) => `${m.role === "user" ? "Patient" : "AI"}: ${m.text}`)
              .join("\n");

            chatMessages.push({
              role: "system",
              content: `Here is a summary of the patient's PREVIOUS conversations with you. Use this for continuity — reference past symptoms, recommendations, or concerns when relevant:\n\n${pastSummary}`,
            });
          }
        }
      } catch (dbErr) {
        console.error("DB context load error (non-fatal):", dbErr);
        // Continue without DB context — still respond
      }
    }

    // Add current conversation messages
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        chatMessages.push({
          role: msg.role === "bot" || msg.role === "assistant" ? "assistant" : "user",
          content: msg.text || msg.content || "",
        });
      }
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Groq API error:", res.status, errText);
      return NextResponse.json(
        {
          reply:
            "I'm having trouble connecting right now. Please try again in a moment, or consult a doctor directly.",
        },
        { status: 200 }
      );
    }

    const data = await res.json();
    let reply =
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    // If it was a reminder prompt, try to parse JSON
    if (isReminderPrompt) {
      try {
        // Find JSON block if it's wrapped in backticks
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : reply;
        const parsed = JSON.parse(jsonStr);
        return NextResponse.json(parsed);
      } catch (err) {
        console.error("Failed to parse reminder JSON", reply);
        return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
      }
    }

    // Parse action tags from the reply
    const actions = [];

    // Parse [BOOK_APPOINTMENT:Specialty]
    const bookMatch = reply.match(/\[BOOK_APPOINTMENT:(.*?)\]/);
    if (bookMatch) {
      actions.push({ type: "book_appointment", specialty: bookMatch[1].trim() });
      reply = reply.replace(bookMatch[0], "").trim();
    }

    // Parse [SCHEDULE_CALL_AT:datetime]
    const callAtMatch = reply.match(/\[SCHEDULE_CALL_AT:([\d\-T:]+)\]/);
    if (callAtMatch) {
      actions.push({ type: "schedule_call_at", datetime: callAtMatch[1].trim() });
      reply = reply.replace(callAtMatch[0], "").trim();
    }

    // Parse legacy [SCHEDULE_CALL:reason] (kept for backward compat)
    const callMatch = reply.match(/\[SCHEDULE_CALL:(.*?)\]/);
    if (callMatch) {
      actions.push({ type: "schedule_call", reason: callMatch[1].trim() });
      reply = reply.replace(callMatch[0], "").trim();
    }

    // Parse [NAVIGATE:/path]
    const navMatch = reply.match(/\[NAVIGATE:(.*?)\]/);
    if (navMatch) {
      actions.push({ type: "navigate", path: navMatch[1].trim() });
      reply = reply.replace(navMatch[0], "").trim();
    }

    // Parse [ADD_CALENDAR:specialty:reason]
    const calMatch = reply.match(/\[ADD_CALENDAR:(.*?)\]/);
    if (calMatch) {
      const parts = calMatch[1].split(":");
      actions.push({
        type: "add_calendar",
        specialty: parts[0]?.trim() || "General Physician",
        reason: parts[1]?.trim() || "Health consultation",
      });
      reply = reply.replace(calMatch[0], "").trim();
    }

    return NextResponse.json({ reply, actions });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again later." },
      { status: 200 }
    );
  }
}
