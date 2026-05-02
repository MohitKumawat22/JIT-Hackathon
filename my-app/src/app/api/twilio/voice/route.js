import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CallLog from "@/models/CallLog";

// ─── Severity keyword detection ────────────────────────────────
const SEVERITY_KEYWORDS = {
  critical: ["chest pain", "can't breathe", "cannot breathe", "heart attack", "stroke", "unconscious", "emergency"],
  high: ["severe", "hospital", "ambulance", "dizzy", "vomiting", "very bad"],
  moderate: ["pain", "fever", "headache", "nausea", "tired", "weak"],
  low: ["okay", "fine", "better", "good", "normal"],
};

function detectSeverity(transcript) {
  const fullText = transcript
    .map((t) => t.text)
    .join(" ")
    .toLowerCase();

  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some((kw) => fullText.includes(kw))) return level;
  }
  return "info";
}

// ─── Groq AI helpers ──────────────────────────────────────────
async function callGroq(messages, maxTokens = 80) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY not configured");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// Build mid-call system prompt using stored context
function buildMidCallSystemPrompt(ctx) {
  const { patient, lastTriage, recentBookings, pastCallSummaries } = ctx || {};
  let system = `You are AmritCare AI — a caring health assistant speaking to a patient over a phone call.

RULES:
- Reply in EXACTLY 1–2 short, clear sentences. No more.
- Never prescribe medicines or diagnose.
- Suggest home remedies or recommend a specialist if symptoms sound serious.
- If the patient describes an emergency (chest pain, can't breathe, etc.) immediately tell them to call emergency services.
- Speak naturally as if in a phone conversation.`;

  if (patient) {
    system += `\n\nPatient: ${patient.firstName} ${patient.lastName}, Age: ${patient.age || "unknown"}, Blood Group: ${patient.blood || "unknown"}.`;
  }
  if (lastTriage) {
    system += `\nLast AI triage — Symptoms: ${(lastTriage.symptoms || []).join(", ")}. Severity: ${lastTriage.severity}. Recommendation: ${lastTriage.recommendation || "none"}.`;
  }
  if (recentBookings?.length) {
    system += `\nRecent bookings: ${recentBookings.map((b) => b.facilityName).join(", ")}.`;
  }
  if (pastCallSummaries?.length) {
    system += `\nPast call summaries: ${pastCallSummaries.map((c) => c.summary).join(" | ")}.`;
  }

  return system;
}

// Build TwiML response — always returns valid XML
function twiml(sayText, gatherActionUrl, timeout = 8) {
  const escaped = sayText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">${escaped}</Say>
  <Gather input="speech" action="${gatherActionUrl}" timeout="${timeout}" speechTimeout="auto" language="en-IN">
    <Say voice="Polly.Aditi">Please go ahead.</Say>
  </Gather>
  <Say voice="Polly.Aditi">I didn't hear anything. Take care! Goodbye.</Say>
</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

function twimlEnd(sayText) {
  const escaped = sayText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Aditi">${escaped}</Say>
  <Hangup/>
</Response>`,
    { headers: { "Content-Type": "text/xml" } }
  );
}

// ─── Main webhook handler ──────────────────────────────────────
// Twilio POSTs to this endpoint during a live call
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.text();
    const params = Object.fromEntries(new URLSearchParams(body));

    const { CallSid, SpeechResult, CallStatus } = params;
    console.log(`[Twilio] CallSid=${CallSid} Status=${CallStatus || "voice"} Speech=${SpeechResult ? SpeechResult.substring(0, 50) : "none"}`);

    const ngrokUrl = process.env.NGROK_URL || "";
    const webhookUrl = `${ngrokUrl}/api/twilio/voice`;

    // ── 1. Status callback — call ended ──────────────────────────
    if (CallStatus === "completed" || CallStatus === "failed" || CallStatus === "no-answer" || CallStatus === "busy") {
      const callLog = await CallLog.findOne({ callSid: CallSid });
      if (callLog && callLog.status === "in-progress") {
        // Generate summary via Groq
        let summary = "";
        let severity = "info";

        if (callLog.transcript.length > 0) {
          const transcriptText = callLog.transcript
            .map((t) => `${t.role === "assistant" ? "AI" : "Patient"}: ${t.text}`)
            .join("\n");

          try {
            summary = await callGroq(
              [
                {
                  role: "system",
                  content:
                    "Summarize the following medical phone call in 2-3 sentences. Mention key symptoms, the patient's mood, and overall condition.",
                },
                { role: "user", content: transcriptText },
              ],
              150
            );
          } catch (e) {
            console.error("Summary generation failed:", e);
            summary = "Summary could not be generated.";
          }

          severity = detectSeverity(callLog.transcript);
        }

        callLog.status = CallStatus === "completed" ? "completed" : "failed";
        callLog.summary = summary;
        callLog.severity = severity;
        await callLog.save();
      }

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response/>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // ── 2. Find the active CallLog by Sid ─────────────────────────
    const callLog = await CallLog.findOne({ callSid: CallSid });
    if (!callLog) {
      return twimlEnd("Hello, I'm AmritCare AI. I couldn't find your appointment details. Please contact support. Goodbye!");
    }

    // ── 3. First turn — no SpeechResult yet ──────────────────────
    if (!SpeechResult) {
      const greeting =
        callLog.greeting ||
        `Hello ${callLog.context?.patient?.firstName || "there"}! I'm AmritCare AI calling for your scheduled health checkup. How are you feeling today?`;

      return twiml(greeting, webhookUrl);
    }

    // ── 4. Mid-call turn — patient spoke ─────────────────────────
    const patientTurn = {
      role: "patient",
      text: SpeechResult,
      timestamp: new Date(),
    };
    callLog.transcript.push(patientTurn);

    // Build Groq messages
    const systemPrompt = buildMidCallSystemPrompt(callLog.context);
    const groqMessages = [{ role: "system", content: systemPrompt }];

    for (const turn of callLog.transcript) {
      groqMessages.push({
        role: turn.role === "patient" ? "user" : "assistant",
        content: turn.text,
      });
    }

    let aiReply = "I understand. Please take care and stay hydrated. Is there anything else you'd like to share?";
    try {
      aiReply = await callGroq(groqMessages, 80);
    } catch (e) {
      console.error("Mid-call Groq error:", e);
    }

    const asTurn = {
      role: "assistant",
      text: aiReply,
      timestamp: new Date(),
    };
    callLog.transcript.push(asTurn);
    await callLog.save();

    // Cap conversation at 10 turns to avoid runaway calls
    if (callLog.transcript.length >= 20) {
      return twimlEnd(
        `${aiReply} Thank you for speaking with AmritCare AI today. Take good care of yourself! Goodbye.`
      );
    }

    return twiml(aiReply, webhookUrl);
  } catch (error) {
    console.error("Twilio webhook error:", error);
    return twimlEnd(
      "I'm sorry, something went wrong with the AmritCare AI assistant. Please try again later. Goodbye!"
    );
  }
}
