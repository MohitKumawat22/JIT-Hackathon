#!/usr/bin/env node
/**
 * call-worker.js — AmritCare AI Call Scheduler
 *
 * Run alongside the Next.js dev server:
 *   node scripts/call-worker.js
 *
 * Requires in .env.local (or set in environment):
 *   MONGODB_URI, GROK_API_KEY, TWILIO_ACCOUNT_SID,
 *   TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, NGROK_URL
 */

// Load env from .env.local (one level up from /scripts)
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

const mongoose = require("mongoose");
const cron = require("node-cron");
const twilio = require("twilio");

// ─── Env validation ────────────────────────────────────────────
const {
  MONGODB_URI,
  GROQ_API_KEY,
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
  NGROK_URL,
} = process.env;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is required in .env.local");
  process.exit(1);
}
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
  console.warn("⚠️  Twilio credentials missing — calls will NOT fire.");
}
if (!NGROK_URL) {
  console.warn("⚠️  NGROK_URL is not set — webhook URL will be empty.");
}

// ─── Mongoose models (inline, no Next.js imports) ─────────────
let Patient, Triage, Booking, CallLog;

function defineModels() {
  // Patient
  const PatientSchema = new mongoose.Schema(
    {
      firstName: String, lastName: String, email: String, phone: String,
      age: Number, blood: String,
    },
    { timestamps: true }
  );
  Patient = mongoose.models.Patient || mongoose.model("Patient", PatientSchema);

  // Triage
  const TriageSchema = new mongoose.Schema(
    {
      patientId: mongoose.Schema.Types.ObjectId,
      title: String, severity: String,
      symptoms: [String], transcript: Array, recommendation: String, lang: String,
    },
    { timestamps: true }
  );
  Triage = mongoose.models.Triage || mongoose.model("Triage", TriageSchema);

  // Booking
  const BookingSchema = new mongoose.Schema(
    {
      patientId: mongoose.Schema.Types.ObjectId,
      facilityName: String, address: String, department: String,
      status: String, notes: String,
    },
    { timestamps: true }
  );
  Booking = mongoose.models.Booking || mongoose.model("Booking", BookingSchema);

  // CallLog
  const transcriptEntrySchema = new mongoose.Schema(
    { role: String, text: String, timestamp: Date },
    { _id: false }
  );
  const CallLogSchema = new mongoose.Schema(
    {
      patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", index: true },
      scheduledAt: Date,
      status: { type: String, default: "scheduled", index: true },
      callSid: { type: String, default: null },
      // ── Retry Logic ──────────────────────────────────────────
      retryCount: { type: Number, default: 0 },
      nextRetryAt: { type: Date, default: null },
      context: {
        patient: { type: Object, default: null },
        lastTriage: { type: Object, default: null },
        recentBookings: { type: Array, default: [] },
        pastCallSummaries: { type: Array, default: [] },
        pastMemories: { type: Array, default: [] },
      },
      greeting: { type: String, default: null },
      transcript: { type: [transcriptEntrySchema], default: [] },
      summary: { type: String, default: null },
      severity: { type: String, default: "info" },
      notes: { type: String, default: "" },
      // ── Post-Call Memory ─────────────────────────────────────
      memory: {
        symptoms: { type: Array, default: [] },
        mood: { type: String, default: null },
        followUpTopics: { type: Array, default: [] },
        rawSummary: { type: String, default: null },
      },
    },
    { timestamps: true }
  );
  CallLog = mongoose.models.CallLog || mongoose.model("CallLog", CallLogSchema);
}

// ─── DB Connection ─────────────────────────────────────────────
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  console.log("✅ MongoDB connected");
  defineModels();
}

// ─── Groq API helper ──────────────────────────────────────────
async function callGroq(messages, maxTokens = 80) {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
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
    throw new Error(`Groq ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

// ─── Context fetcher ──────────────────────────────────────────
async function fetchPatientContext(patientId) {
  const [patient, latestTriages, recentBookings, pastCalls, pastMemoryLogs] = await Promise.all([
    Patient.findById(patientId).lean(),
    Triage.find({ patientId }).sort({ createdAt: -1 }).limit(1).lean(),
    Booking.find({ patientId, status: { $in: ["upcoming", "completed"] } })
      .sort({ createdAt: -1 })
      .limit(2)
      .lean(),
    CallLog.find({ patientId, status: "completed" })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("summary severity createdAt")
      .lean(),
    // Pull last 3 calls that have memory extracted
    CallLog.find({ patientId, status: "completed", "memory.mood": { $ne: null } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select("memory createdAt")
      .lean(),
  ]);

  return {
    patient,
    lastTriage: latestTriages[0] || null,
    recentBookings,
    pastCallSummaries: pastCalls,
    pastMemories: pastMemoryLogs,
  };
}

// ─── Greeting generator ───────────────────────────────────────
async function generateGreeting(context, notes, overrideName) {
  const { patient, lastTriage, pastCallSummaries, pastMemories } = context;
  const displayName = overrideName || patient?.firstName || "there";

  const systemPrompt = `You are AmritCare, a friendly neighborhood family doctor calling for a health checkup.
You are warm, knowledgeable, and approachable — like a doctor who lives in the same colony 
and genuinely knows and cares about their patients.

Address the patient by their first name with "aap" — never Bhaiya/Didi.
Speak in true Hinglish — 50% English and 50% Hindi naturally mixed in every sentence.
Use Polly.Aditi voice-friendly language — natural, conversational, not text-heavy.
Keep the greeting to exactly 2 sentences.
First sentence: greet and introduce the call.
Second sentence: ask how they are feeling in a warm, natural way.

Patient name: ${displayName}
Patient notes: ${notes || "none"}

Example 1 (no notes):
"Ravi, AmritCare ki taraf se call aa raha hai — aapka routine checkup tha aaj. 
Aap kaisa feel kar rahe hain, sab theek chal raha hai?"

Example 2 (patient noted headache):
"Priya, AmritCare se call hai — aapne sir dard mention kiya tha, toh socha aapse 
baat karte hain. Aaj kaisa feel ho raha hai aapko?"

Example 3 (patient noted tiredness):
"Arjun, AmritCare ki taraf se checkup call hai. Aapne thakaan mention ki thi — 
abhi kaisa chal raha hai, better hai kuch?"`;

  let userContent = `Patient: ${displayName}`;

  // Inject structured memory from previous calls
  if (pastMemories?.length) {
    userContent += `\n\nPrevious call history (use this to follow up naturally):`;
    pastMemories.forEach((m, i) => {
      const mem = m.memory || {};
      const dateStr = m.timestamp ? new Date(m.timestamp).toLocaleDateString() : "previous call";
      userContent += `\n- [${dateStr}] Symptoms: ${(mem.symptoms || []).join(", ") || "none"}. Mood: ${mem.mood || "unknown"}. Follow up on: ${(mem.followUpTopics || []).join(", ") || "none"}.`;
    });
    userContent += `\n\nImportant:
- Reference previous symptoms naturally in conversation — do not list them out loud
- Weave follow-ups into the conversation, don't ask them all at once
- If mood was low last time, be extra warm this call
- If symptoms have resolved, express genuine relief`;
  }

  userContent += "\n\nGenerate the 2-sentence greeting now.";

  try {
    return await callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      100
    );
  } catch (e) {
    console.error("Greeting generation failed:", e);
    return `${displayName}, AmritCare ki taraf se call aa raha hai — aapka routine checkup tha aaj. Aap kaisa feel kar rahe hain?`;
  }
}

// ─── Main poll worker ─────────────────────────────────────────
async function processDueCalls() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 30_000); // 30-second look-ahead

  const dueCalls = await CallLog.find({
    status: "scheduled",
    scheduledAt: { $lte: windowEnd },
  }).lean();

  if (dueCalls.length === 0) return;
  console.log(`🔔 Found ${dueCalls.length} due call(s)`);

  for (const call of dueCalls) {
    try {
      console.log(`  → Processing call ${call._id} for patient ${call.patientId}`);

      // Mark in-progress immediately to prevent double-processing
      await CallLog.findByIdAndUpdate(call._id, { status: "in-progress" });

      // 1. Fetch full context
      const context = await fetchPatientContext(call.patientId);

      // 2. Generate greeting (use overrideName from scheduler form if set)
      const greeting = await generateGreeting(context, call.notes, call.overrideName);

      // 3. Save context + greeting
      await CallLog.findByIdAndUpdate(call._id, { context, greeting });

      // 4. Get patient phone — prefer overridePhone set by the scheduler UI
      const phoneNumber = call.overridePhone || context.patient?.phone;
      if (!phoneNumber) {
        console.error(`  ✗ Patient ${call.patientId} has no phone number`);
        await CallLog.findByIdAndUpdate(call._id, { status: "failed" });
        continue;
      }

      if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
        console.warn(`  ⚠ Twilio not configured — skipping actual call for ${call._id}`);
        await CallLog.findByIdAndUpdate(call._id, { status: "failed" });
        continue;
      }

      // 5. Fire Twilio outbound call
      const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      // Embed callLogId in URL to avoid race condition (callSid saved after call fires)
      const webhookUrl = `${NGROK_URL}/api/twilio/voice?callLogId=${call._id}`;
      const statusCallbackUrl = `${NGROK_URL}/api/twilio/voice?callLogId=${call._id}`;

      const twilioCall = await twilioClient.calls.create({
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER,
        url: webhookUrl,
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["completed", "failed", "no-answer", "busy"],
        // ── Voicemail detection ──────────────────────────────────
        machineDetection: "DetectMessageEnd",
        asyncAmd: true,
        asyncAmdStatusCallback: statusCallbackUrl,
        asyncAmdStatusCallbackMethod: "POST",
      });

      await CallLog.findByIdAndUpdate(call._id, { callSid: twilioCall.sid });
      console.log(`  ✓ Call fired: SID ${twilioCall.sid} → ${phoneNumber}`);

      // 6. Auto-schedule next occurrence for recurring calls
      if (call.recurrence && call.recurrence !== "one-time") {
        const nextDate = new Date(call.scheduledAt);
        if (call.recurrence === "weekly") nextDate.setDate(nextDate.getDate() + 7);
        if (call.recurrence === "monthly") nextDate.setDate(nextDate.getDate() + 30);
        await CallLog.create({
          patientId: call.patientId,
          scheduledAt: nextDate,
          notes: call.notes,
          status: "scheduled",
          recurrence: call.recurrence,
          overridePhone: call.overridePhone,
          overrideName: call.overrideName,
          parentCallId: call.parentCallId || call._id,
        });
        console.log(`  ↻ Next ${call.recurrence} call auto-scheduled for ${nextDate.toLocaleString()}`);
      }
    } catch (err) {
      console.error(`  ✗ Failed processing call ${call._id}:`, err.message);
      // ── Retry on transient failures ────────────────────────────
      const freshCall = await CallLog.findById(call._id).lean().catch(() => null);
      if (freshCall && freshCall.retryCount < 2) {
        const nextRetryAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        await CallLog.findByIdAndUpdate(call._id, {
          status: "scheduled",
          retryCount: freshCall.retryCount + 1,
          nextRetryAt,
          scheduledAt: nextRetryAt,
        }).catch(() => {});
        console.log(`  ↩ Retry ${freshCall.retryCount + 1}/2 scheduled at ${nextRetryAt.toLocaleTimeString()}`);
      } else {
        await CallLog.findByIdAndUpdate(call._id, { status: "failed" }).catch(() => {});
        console.log(`  ✗ Max retries reached — marked as failed.`);
      }
    }
  }
}

// ─── Entry point ──────────────────────────────────────────────
(async () => {
  console.log("🚀 AmritCare Call Worker starting...");
  await connectDB();
  defineModels();

  // Run immediately on startup, then every 30 seconds
  await processDueCalls();

  cron.schedule("*/30 * * * * *", async () => {
    try {
      await processDueCalls();
    } catch (err) {
      console.error("Worker poll error:", err);
    }
  });

  console.log("⏱️  Polling every 30 seconds. Press Ctrl+C to stop.");
})();
