import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CallLog from "@/models/CallLog";

// ─── Severity keyword detection ────────────────────────────────
const SEVERITY_KEYWORDS = {
  critical: [
    // English
    "chest pain", "can't breathe", "cannot breathe", "heart attack", "stroke", "unconscious", "emergency",
    // Hinglish
    "chest mein dard", "saans nahi aa raha", "saans nahi ata", "hosh nahi", "behosh", "dil ka dora"
  ],
  high: [
    // English
    "severe", "hospital", "ambulance", "dizzy", "vomiting", "very bad",
    // Hinglish
    "bahut bura lag raha", "bahut bura lagta", "chakkar", "ulti", "bahut dard", "bahut takleef"
  ],
  moderate: [
    // English
    "pain", "fever", "headache", "nausea", "tired", "weak",
    // Hinglish
    "dard", "bukhar", "sir dard", "thaka hua", "thakaan", "neend nahi", "kamzori", "ulta lagta"
  ],
  low: [
    // English
    "okay", "fine", "better", "good", "normal",
    // Hinglish
    "theek hoon", "better hoon", "sab theek hai", "achha lag raha", "bilkul theek", "theek hai"
  ],
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
  const { patient, lastTriage, recentBookings, pastCallSummaries, pastMemories } = ctx || {};

  let system = `You are AmritCare — a warm, caring health companion who calls patients like a concerned elder sibling (Didi/Bhaiya spirit).

PERSONALITY:
- Sound like a caring family member, NOT a clinical bot or doctor's assistant.
- Use natural Hinglish — English sentences with simple Hindi phrases woven in naturally.
  e.g. "Acha, toh aap bol rahe hain...", "Samajh sakti hoon...", "Tension mat lo...", "Yeh sun ke achha laga!"
- Address the patient as Bhaiya or Didi, or by their first name warmly.

RESPONSE RULES:
- ALWAYS reply in 1-2 sentences max. Under 40 words. No exceptions.
- Use active listening openers:
  * "Acha, toh aap bol rahe hain..."
  * "Samajh sakta/sakti hoon..."
  * "Yeh sun ke thoda chinta hui..." (if they sound unwell)
  * "Yeh sun ke bahut achha laga!" (if they sound well)
- If patient sounds unwell: be warm FIRST, advice second.
  e.g. "Yeh sun ke thoda chinta hui — shayad thoda rest karein aur paani peete rahein."
- NEVER say "I recommend" or "you should" — say "shayad aap try kar sakte hain" or "agar ho sake toh...".
- NEVER prescribe medicines, diagnose, or use clinical language.
- If emergency keywords (chest pain, saans nahi aa raha): immediately say to call emergency services.
- Sound like a person on a phone call, not reading from a script.`;

  if (patient) {
    system += `\n\nPatient info: ${patient.firstName} ${patient.lastName || ""}, Age: ${patient.age || "unknown"}, Blood Group: ${patient.blood || "unknown"}.`;
  }
  if (lastTriage) {
    system += `\nLast AI triage — Symptoms: ${(lastTriage.symptoms || []).join(", ")}. Severity: ${lastTriage.severity}.`;
  }
  if (recentBookings?.length) {
    system += `\nRecent bookings: ${recentBookings.map((b) => b.facilityName).join(", ")}.`;
  }
  if (pastCallSummaries?.length) {
    system += `\nPast call summaries: ${pastCallSummaries.map((c) => c.summary).join(" | ")}.`;
  }
  // ── Inject structured memory from previous calls ──────────────────────
  if (pastMemories?.length) {
    system += `\n\nPrevious call memories (most recent first):`;
    pastMemories.forEach((m, i) => {
      const mem = m.memory || {};
      system += `\n- Call ${i + 1}: Symptoms: ${(mem.symptoms || []).join(", ") || "none"}. Mood: ${mem.mood || "unknown"}. Follow up on: ${(mem.followUpTopics || []).join(", ") || "none"}.`;
    });
    system += `\nWeave these into the conversation naturally in Hinglish — like a caring sibling who remembers. e.g. "Bhaiya, pichli baar aapne sir dard mention kiya tha — woh ab kaisa hai?" Don't list them robotically.`;
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
  <Gather input="speech" action="${gatherActionUrl}" timeout="${timeout}" speechTimeout="auto" language="hi-IN">
    <Say voice="Polly.Aditi">Haan, boliye.</Say>
  </Gather>
  <Say voice="Polly.Aditi">Main aapki awaaz nahi sun saka. Apna khayal rakhein! Alvida.</Say>
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

    const { CallSid, SpeechResult, CallStatus, AnsweredBy } = params;
    console.log(`[Twilio] CallSid=${CallSid} Status=${CallStatus || "voice"} AnsweredBy=${AnsweredBy || "human"} Speech=${SpeechResult ? SpeechResult.substring(0, 50) : "none"}`);

    const ngrokUrl = process.env.NGROK_URL || "";
    const webhookUrl = `${ngrokUrl}/api/twilio/voice`;

    // ── 0. Voicemail detection — hang up immediately ────────────────
    if (AnsweredBy === "machine_end_beep" || AnsweredBy === "machine_end_silence" || AnsweredBy === "machine_start") {
      console.log(`[Twilio] Voicemail detected (${AnsweredBy}) — hanging up and scheduling retry.`);

      // Schedule retry via DB
      const vmLog = await CallLog.findOne({ callSid: CallSid });
      if (vmLog) {
        if (vmLog.retryCount < 2) {
          const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000);
          vmLog.status = "scheduled";
          vmLog.retryCount = vmLog.retryCount + 1;
          vmLog.nextRetryAt = nextRetryAt;
          vmLog.scheduledAt = nextRetryAt;
          await vmLog.save();
          console.log(`[Twilio] Voicemail retry ${vmLog.retryCount}/2 → ${nextRetryAt.toLocaleTimeString()}`);
        } else {
          vmLog.status = "failed";
          await vmLog.save();
          console.log(`[Twilio] Max retries reached after voicemail — failed.`);
        }
      }

      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Hangup/></Response>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // ── 1. Status callback — call ended ──────────────────────────
    if (CallStatus === "completed" || CallStatus === "failed" || CallStatus === "no-answer" || CallStatus === "busy") {
      const callLog = await CallLog.findOne({ callSid: CallSid });
      if (callLog && callLog.status === "in-progress") {

        // ── Handle no-answer / busy with retry ────────────────────────────
        if (CallStatus === "no-answer" || CallStatus === "busy") {
          if (callLog.retryCount < 2) {
            const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000);
            callLog.status = "scheduled";
            callLog.retryCount = callLog.retryCount + 1;
            callLog.nextRetryAt = nextRetryAt;
            callLog.scheduledAt = nextRetryAt;
            await callLog.save();
            console.log(`[Twilio] ${CallStatus} → retry ${callLog.retryCount}/2 at ${nextRetryAt.toLocaleTimeString()}`);
          } else {
            callLog.status = "failed";
            await callLog.save();
            console.log(`[Twilio] Max retries reached — call marked failed.`);
          }
          return new Response(
            `<?xml version="1.0" encoding="UTF-8"?><Response/>`,
            { status: 200, headers: { "Content-Type": "text/xml" } }
          );
        }

        // ── Completed: generate summary + extract memory ───────────────────
        let summary = "";
        let severity = "info";
        let memory = { symptoms: [], mood: null, followUpTopics: [], rawSummary: null };

        if (callLog.transcript.length > 0) {
          const transcriptText = callLog.transcript
            .map((t) => `${t.role === "assistant" ? "AI" : "Patient"}: ${t.text}`)
            .join("\n");

          try {
            summary = await callGroq(
              [
                {
                  role: "system",
                  content: `Summarize this health checkup call in 2-3 sentences, as if writing a warm note for a caring family member to read.
Mention the key symptoms the patient described and their overall mood during the call.
Write in simple, warm Hinglish — not clinical language. Sound human, not like a medical report.
Example style: "Ravi Bhaiya ne aaj sir dard aur thakaan ki baat ki — kaafi dinon se yeh feel kar rahe hain. Unka mood thoda low tha lekin baat karte karte better laga."`,
                },
                { role: "user", content: transcriptText },
              ],
              150
            );
            memory.rawSummary = summary;
          } catch (e) {
            console.error("Summary generation failed:", e);
            summary = "Summary could not be generated.";
          }

          severity = detectSeverity(callLog.transcript);

          // ── Post-call memory extraction ──────────────────────────────
          try {
            const memoryRaw = await callGroq(
              [
                {
                  role: "system",
                  content: `Extract structured memory from this health call transcript.
Respond ONLY with a valid JSON object — no extra text, no markdown:
{
  "symptoms": ["short Hinglish phrase, max 5 words each — e.g. sir dard, thakaan, neend nahi"],
  "mood": "one word only: anxious | better | low | neutral | worried",
  "followUpTopics": ["natural Hinglish follow-up question for next call, max 6 words — e.g. sir dard ab kaisa hai?, neend theek ho gayi?"]
}
Keep each item short and conversational. followUpTopics should sound like a caring sibling asking, not a clinical form.`,
                },
                { role: "user", content: transcriptText },
              ],
              200
            );
            const jsonMatch = memoryRaw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              memory.symptoms = parsed.symptoms || [];
              memory.mood = parsed.mood || null;
              memory.followUpTopics = parsed.followUpTopics || [];
            }
            console.log(`[Memory] mood=${memory.mood}, symptoms=${memory.symptoms.join(", ")}`);
          } catch (e) {
            console.error("Memory extraction failed:", e);
          }
        }

        callLog.status = "completed";
        callLog.summary = summary;
        callLog.severity = severity;
        callLog.memory = memory;
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
        `Namaste ${callLog.context?.patient?.firstName || "ji"}! Main AmritCare AI bol raha hoon. Aap ki tabiyat kaisi hai aaj?`;

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

    let aiReply = "Theek hai, samajh gaya. Apna khayal rakhein aur paani peete rahein. Aur kuch share karna chahenge?";
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

    // Cap conversation at 20 turns to avoid runaway calls
    if (callLog.transcript.length >= 20) {
      return twimlEnd(
        `${aiReply} AmritCare AI se baat karke acha laga. Apna khayal rakhein! Alvida.`
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
