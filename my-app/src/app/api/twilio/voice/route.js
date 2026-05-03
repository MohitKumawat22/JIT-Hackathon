import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CallLog from "@/models/CallLog";

// ─── Severity keyword detection ─────────────────────────────────────────────
const SEVERITY_KEYWORDS = {
  critical: [
    "chest pain", "can't breathe", "cannot breathe", "heart attack", "stroke", "unconscious", "emergency",
    "chest mein dard", "saans nahi aa raha", "saans nahi ata", "hosh nahi", "behosh", "bahut bura condition"
  ],
  high: [
    "severe", "hospital", "ambulance", "dizzy", "vomiting", "very bad",
    "bahut bura lag raha", "chakkar aa raha", "chakkar", "ulti ho rahi", "ulti", "bahut tez dard", "bahut takleef"
  ],
  moderate: [
    "pain", "fever", "headache", "nausea", "tired", "weak",
    "dard ho raha", "bukhar hai", "bukhar", "sir dard", "thaka hua", "thakaan", "neend nahi ho rahi", "neend nahi", "kamzori"
  ],
  low: [
    "okay", "fine", "better", "good", "normal",
    "theek hoon", "better hoon", "sab theek hai", "achha lag raha", "improve hua", "bilkul theek"
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
  const firstName = patient?.firstName || "aap";

  let system = `You are AmritCare, a friendly neighborhood family doctor calling for a health checkup.
You are warm, knowledgeable, and approachable — like a doctor who lives in the same colony and genuinely knows and cares about their patients.

PERSONALITY & LANGUAGE RULES:
- Speak in smooth Hinglish — grammatically correct sentences where Hindi and English words blend naturally.
- NEVER mix random Hindi words mid-sentence. Each sentence should be complete and fluid.
- Address the patient as ${firstName} with "aap" — never Bhaiya/Didi, never "tum" or "tu".
- Use warm, everyday spoken Hindi — not textbook formal Hindi, not broken fragments.
- Keep sentences short — one clear idea per sentence, spoken naturally.
- Never use filler phrases like "Certainly!", "Of course!", "Great question!".
- Sound like a caring family doctor, not a bot reading a script.

RESPONSE RULES:
- Reply in 1-2 complete, grammatically correct sentences. Strictly under 40 words total.
- Always acknowledge what the patient said before responding.
- If unwell: show genuine concern first, then ask one specific follow-up question.
- If fine: show warm relief, then ask one gentle follow-up about sleep, food, or energy.
- NEVER say "I recommend" or "you should" — say "shayad aap try kar sakte hain" or "ek kaam karein".
- NEVER diagnose. For serious symptoms, gently guide towards seeing a doctor in person.
- End every response with either a question OR a warm reassurance — never leave a thought incomplete.
- If emergency (chest pain, can't breathe): immediately ask them to call emergency services.

HINGLISH STYLE GUIDE — these phrases are natural and clear:
- Concern: "Yeh sun ke thodi fikr hui."
- Relief: "Yeh sun ke bahut achha laga!"
- Encouraging: "Aap bilkul sahi direction mein hain."
- Advice: "Shayad aap thoda rest try kar sakte hain."
- Acknowledging: "Haan, bilkul samajh aa raha hai."
- Follow-up: "Aur kuch feel ho raha hai?"
- Wrap-up: "Apna dhyan rakhein."

FEW-SHOT EXAMPLES — match this exact tone, grammar, and length:
Patient has headache → "Yeh sun ke achha nahi laga — ${firstName}, yeh sir dard kaafi time se hai ya aaj se shuru hua?"
Patient feels fine → "Yeh sun ke bahut achha laga! Neend aur khana theek se ho raha hai na aapka?"
Patient has fever → "Bukhar mein bahut takleef hoti hai — temperature kitna hai aapka, check kiya kya?"
Patient very tired → "Itni thakaan bahut uncomfortable hoti hai. Yeh kab se feel ho rahi hai aapko?"
Patient worsening → "Yeh sun ke thodi fikr hui — ek kaam karein, kal doctor se zaroor milein."
Patient says goodbye → "Bilkul, apna dhyan rakhein ${firstName} — AmritCare hamesha aapke saath hai. Take care!"`;

  if (patient) {
    system += `\n\nPatient info: ${firstName} ${patient.lastName || ""}, Age: ${patient.age || "unknown"}, Blood Group: ${patient.blood || "unknown"}.`;
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
  // ── Inject structured memory from previous calls ──────────────────────────
  if (pastMemories?.length) {
    system += `\n\nPrevious call history (use this to follow up naturally):`;
    pastMemories.forEach((m, i) => {
      const mem = m.memory || {};
      system += `\n- Call ${i + 1}: Symptoms: ${(mem.symptoms || []).join(", ") || "none"}. Mood: ${mem.mood || "unknown"}. Follow up on: ${(mem.followUpTopics || []).join(", ") || "none"}.`;
    });
    system += `\n\nImportant memory rules:
- Reference previous symptoms naturally — do not list them out loud robotically.
- Weave follow-ups into conversation, don't ask them all at once.
- If mood was low last time, be extra warm this call.
- If symptoms have resolved, express genuine relief.
- Example: "${firstName}, pichli baar aapne sir dard mention kiya tha — woh ab kaisa hai, better hua kya?"`;
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
  <Gather input="speech" action="${gatherActionUrl}" timeout="15" speechTimeout="3" language="en-IN"/>
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
    console.log(`[Twilio] CallSid=${CallSid} Status=${CallStatus || "voice"} AnsweredBy=${AnsweredBy || "?"}  Speech=${SpeechResult ? SpeechResult.substring(0, 60) : "none"}`);

    const ngrokUrl = process.env.NGROK_URL || "";

    // Read callLogId from URL query param (eliminates race condition)
    const { searchParams } = new URL(request.url, "https://placeholder.local");
    const callLogId = searchParams.get("callLogId");
    const webhookUrl = `${ngrokUrl}/api/twilio/voice${callLogId ? `?callLogId=${callLogId}` : ""}`;

    // ── 0a. AMD human confirmation callback — ignore, call is already in progress
    // Twilio fires asyncAmdStatusCallback with AnsweredBy=human + CallStatus=in-progress.
    // This is purely informational — return empty TwiML so we don't replay the greeting.
    if (AnsweredBy === "human" && CallStatus === "in-progress") {
      console.log(`[Twilio] AMD human-confirmed callback — ignoring (call already live).`);
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response/>`,
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // ── 0b. Voicemail detection — hang up immediately ────────────────
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
                  content: `Summarize this health checkup call in 2-3 sentences in natural Hinglish.
Write it as a warm clinical note — like a family doctor writing a quick update that a caring family member could also understand.
Mention: key symptoms the patient reported, their mood during the call, and whether they need follow-up.
Keep it human, warm, and simple — not a medical report.

Few-shot examples of the exact style to use:
Example 1: "Ravi ne aaj sir dard aur thakaan ki baat ki — kaafi dinon se feel ho raha hai unhe. Call ke dauran mood thoda low tha lekin baat karte waqt better laga. Doctor se milna suggest kiya gaya hai agar symptoms kal bhi rahein."
Example 2: "Priya bilkul theek hain — neend aur khana दोनों sahi chal raha hai. Koi specific symptoms nahi the इस call mein, overall mood positive tha. Next checkup regularly schedule karna recommend kiya."`,
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

    // ── 2. Find CallLog — prefer callLogId URL param, fall back to callSid ─
    const callLog = callLogId
      ? await CallLog.findById(callLogId)
      : await CallLog.findOne({ callSid: CallSid });

    if (!callLog) {
      console.error(`[Twilio] CallLog not found (callLogId=${callLogId}, callSid=${CallSid})`);
      return twimlEnd("Namaste! AmritCare se call aa raha tha. Abhi system busy hai, hum baad mein try karenge. Dhanyawad!");
    }

    // ── 3. First turn — no SpeechResult yet ──────────────────────
    if (!SpeechResult) {
      const greeting =
        callLog.greeting ||
        `AmritCare ki taraf se call aa raha hai — aapka routine checkup tha aaj. Aap kaisa feel kar rahe hain, sab theek chal raha hai?`;

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

    let aiReply = "Haan, samajh aa raha hai — aur kuch feel ho raha hai aapko, batayein?";
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
