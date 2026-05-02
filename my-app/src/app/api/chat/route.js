import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import ChatHistory from "@/models/ChatHistory";

const SYSTEM_PROMPT = `You are AmritCare AI Health Assistant — a caring, knowledgeable medical chatbot.

STRICT RULES:
1. NEVER recommend or prescribe any medicines, drugs, or pharmaceutical products.
2. ONLY suggest home remedies, lifestyle changes, and natural treatments.
3. Always explain the possible REASONS and CAUSES behind the symptoms.
4. Always recommend consulting a specific type of doctor/specialist for proper diagnosis.
5. Keep responses concise (under 200 words), warm, and easy to understand.
6. Use bullet points for clarity.
7. If the user describes an emergency (chest pain, difficulty breathing, severe bleeding), immediately advise them to call emergency services or visit the nearest hospital.
8. If the patient has shared medical reports, use that data to give more personalized and accurate advice.
9. Remember and reference previous conversations when relevant to provide continuity of care.

ACTION TAGS — You MUST append these tags at the very end of your response when appropriate:

10. BOOK APPOINTMENT: If the user explicitly asks to book an appointment, or agrees to see a doctor, append:
    [BOOK_APPOINTMENT:Specialty_Name]
    (replace Specialty_Name with the best matching specialty like Cardiologist, Neurologist, Dermatologist, Pediatrician, Orthopedic, or General Physician)

11. SCHEDULE CALL: If the user asks to schedule a call with a doctor, or wants a follow-up call, or says "call me", append:
    [SCHEDULE_CALL:reason]
    (replace reason with a brief reason like "headache follow-up" or "chest pain consultation")

12. ADD TO CALENDAR: After you suggest booking or scheduling, also append:
    [ADD_CALENDAR:Specialty_Name:reason]
    so the user can add the event to their calendar.

You can combine multiple tags. For example if a user wants to book AND get a calendar reminder, include both tags.

RESPONSE FORMAT:
- Start with empathy ("I understand you're feeling...")
- Explain possible reasons/causes
- Suggest 2-3 home remedies
- Recommend which type of doctor to consult
- End with a caring note

Example response structure:
"I understand you're dealing with [symptom]. Here are some possible reasons:
• Reason 1
• Reason 2

🏠 Home Remedies:
• Remedy 1
• Remedy 2

👨‍⚕️ I'd recommend consulting a [Specialist Type] for proper evaluation.

Take care! 💙"`;

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

    // Parse [SCHEDULE_CALL:reason]
    const callMatch = reply.match(/\[SCHEDULE_CALL:(.*?)\]/);
    if (callMatch) {
      actions.push({ type: "schedule_call", reason: callMatch[1].trim() });
      reply = reply.replace(callMatch[0], "").trim();
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
