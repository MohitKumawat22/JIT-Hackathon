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
      context: {
        patient: { type: Object, default: null },
        lastTriage: { type: Object, default: null },
        recentBookings: { type: Array, default: [] },
        pastCallSummaries: { type: Array, default: [] },
      },
      greeting: { type: String, default: null },
      transcript: { type: [transcriptEntrySchema], default: [] },
      summary: { type: String, default: null },
      severity: { type: String, default: "info" },
      notes: { type: String, default: "" },
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
  const [patient, latestTriages, recentBookings, pastCalls] = await Promise.all([
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
  ]);

  return {
    patient,
    lastTriage: latestTriages[0] || null,
    recentBookings,
    pastCallSummaries: pastCalls,
  };
}

// ─── Greeting generator ───────────────────────────────────────
async function generateGreeting(context, notes) {
  const { patient, lastTriage, pastCallSummaries } = context;

  const systemPrompt = `You are AmritCare AI about to call a patient for a scheduled health checkup call.
Generate a warm, personalized greeting in EXACTLY 1-2 short sentences that ends with an open health question.
Never prescribe medicines. Speak naturally.`;

  let userContent = `Patient: ${patient?.firstName || "there"}, Age: ${patient?.age || "unknown"}, Blood: ${patient?.blood || "unknown"}.`;

  if (lastTriage) {
    userContent += ` Last symptoms: ${(lastTriage.symptoms || []).join(", ") || "none"}. Severity: ${lastTriage.severity}.`;
  }
  if (pastCallSummaries?.length) {
    userContent += ` Last call summary: "${pastCallSummaries[0].summary}".`;
  }
  if (notes) {
    userContent += ` Patient's notes for this call: "${notes}".`;
  }

  userContent += " Generate the greeting now.";

  try {
    return await callGroq(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      80
    );
  } catch (e) {
    console.error("Greeting generation failed:", e);
    return `Hello ${patient?.firstName || "there"}! I'm AmritCare AI calling for your scheduled health checkup. How are you feeling today?`;
  }
}

// ─── Main poll worker ─────────────────────────────────────────
async function processDueCalls() {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + 30_000); // 30-second look-ahead

  const dueCalls = await CallLog.find({
    status: "scheduled",
    scheduledAt: { $gte: now, $lte: windowEnd },
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

      // 2. Generate greeting
      const greeting = await generateGreeting(context, call.notes);

      // 3. Save context + greeting
      await CallLog.findByIdAndUpdate(call._id, { context, greeting });

      // 4. Get patient phone
      const phoneNumber = context.patient?.phone;
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
      const webhookUrl = `${NGROK_URL}/api/twilio/voice`;
      const statusCallbackUrl = `${NGROK_URL}/api/twilio/voice`;

      const twilioCall = await twilioClient.calls.create({
        to: phoneNumber,
        from: TWILIO_PHONE_NUMBER,
        url: webhookUrl,
        statusCallback: statusCallbackUrl,
        statusCallbackMethod: "POST",
        statusCallbackEvent: ["completed", "failed", "no-answer", "busy"],
      });

      await CallLog.findByIdAndUpdate(call._id, { callSid: twilioCall.sid });
      console.log(`  ✓ Call fired: SID ${twilioCall.sid} → ${phoneNumber}`);
    } catch (err) {
      console.error(`  ✗ Failed processing call ${call._id}:`, err.message);
      await CallLog.findByIdAndUpdate(call._id, { status: "failed" }).catch(() => {});
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
