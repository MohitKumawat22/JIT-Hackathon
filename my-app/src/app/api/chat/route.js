import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are AmritCare AI Health Assistant — a caring, knowledgeable medical chatbot.

STRICT RULES:
1. NEVER recommend or prescribe any medicines, drugs, or pharmaceutical products.
2. ONLY suggest home remedies, lifestyle changes, and natural treatments.
3. Always explain the possible REASONS and CAUSES behind the symptoms.
4. Always recommend consulting a specific type of doctor/specialist for proper diagnosis.
5. Keep responses concise (under 200 words), warm, and easy to understand.
6. Use bullet points for clarity.
7. If the user describes an emergency (chest pain, difficulty breathing, severe bleeding), immediately advise them to call emergency services or visit the nearest hospital.

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
    const { messages, patientInfo } = await request.json();

    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      // Fallback response if no API key
      return NextResponse.json({
        reply: "I'm sorry, the AI service is not configured yet. Please ask the admin to add the GROK_API_KEY to the environment variables. In the meantime, please consult a doctor for your concerns.",
      });
    }

    // Build messages array with system prompt
    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add patient context if available
    if (patientInfo) {
      chatMessages.push({
        role: "system",
        content: `Patient info — Name: ${patientInfo.firstName || "Unknown"}, Age: ${patientInfo.age || "Unknown"}, Blood Group: ${patientInfo.blood || "Unknown"}. Use this context to personalize advice.`,
      });
    }

    // Add conversation history
    for (const msg of messages) {
      chatMessages.push({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      });
    }

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini",
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Grok API error:", res.status, errText);
      return NextResponse.json(
        { reply: "I'm having trouble connecting to my AI brain right now. Please try again in a moment, or consult a doctor directly for your concerns." },
        { status: 200 }
      );
    }

    const data = await res.json();
    const reply = data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { reply: "Something went wrong. Please try again later." },
      { status: 200 }
    );
  }
}
