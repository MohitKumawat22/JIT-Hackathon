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
10. IMPORTANT: If the user explicitly asks to book an appointment, or agrees to see a doctor, YOU MUST append exactly this string at the very end of your response: [BOOK_APPOINTMENT:Specialty_Name] (replace Specialty_Name with the best matching specialty like Cardiologist, Neurologist, Dermatologist, Pediatrician, Orthopedic, or General Physician).

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

export async function POST(request) {
  try {
    const { messages, patientInfo, patientId } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        reply:
          "I'm sorry, the AI service is not configured yet. Please add the GROQ_API_KEY to the environment variables.",
      });
    }

    // Build messages array with system prompt
    const chatMessages = [{ role: "system", content: SYSTEM_PROMPT }];

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
    for (const msg of messages) {
      chatMessages.push({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      });
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
    const reply =
      data.choices?.[0]?.message?.content ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again later." },
      { status: 200 }
    );
  }
}
