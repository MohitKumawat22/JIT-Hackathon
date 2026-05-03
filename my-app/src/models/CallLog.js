import mongoose from"mongoose";

const transcriptEntrySchema = new mongoose.Schema(
 {
 role: { type: String, enum: ["assistant","patient"], required: true },
 text: { type: String, required: true },
 timestamp: { type: Date, default: Date.now },
 },
 { _id: false }
);

const CallLogSchema = new mongoose.Schema(
 {
 patientId: {
 type: mongoose.Schema.Types.ObjectId,
 ref:"Patient",
 required: true,
 index: true,
 },
 scheduledAt: { type: Date, required: true },
 status: {
 type: String,
 enum: ["scheduled","in-progress","completed","failed","cancelled"],
 default:"scheduled",
 index: true,
 },
 callSid: { type: String, default: null },

 // ── Retry Logic ──────────────────────────────────────────────
 retryCount: { type: Number, default: 0, max: 2 },
 nextRetryAt: { type: Date, default: null },

 // Pre-fetched context snapshot so the webhook doesn't need to re-query DB mid-call
 context: {
 patient: { type: Object, default: null },
 lastTriage: { type: Object, default: null },
 recentBookings: { type: Array, default: [] },
 pastCallSummaries: { type: Array, default: [] },
 // Last 3 call memories injected for follow-up context
 pastMemories: { type: Array, default: [] },
 },
 // Pre-generated greeting by Grok before the call fires
 greeting: { type: String, default: null },
 transcript: { type: [transcriptEntrySchema], default: [] },
 summary: { type: String, default: null },
 severity: {
 type: String,
 enum: ["critical","high","moderate","low","info"],
 default:"info",
 },
 notes: { type: String, default:"" },

 // ── Scheduling ────────────────────────────────────────────────
 recurrence: {
 type: String,
 enum: ["one-time","weekly","monthly"],
 default:"one-time",
 },
 // Optional override: if set, the worker calls this number instead of the patient's stored phone
 overridePhone: { type: String, default: null },
 // Display name used in the greeting / UI (falls back to patient firstName)
 overrideName: { type: String, default: null },
 // For recurring calls — the root/parent call that spawned this one
 parentCallId: { type: mongoose.Schema.Types.ObjectId, ref:"CallLog", default: null },

 // ── Post-Call Memory ─────────────────────────────────────────
 memory: {
 symptoms: { type: [String], default: [] },
 mood: { type: String, default: null },
 followUpTopics: { type: [String], default: [] },
 rawSummary: { type: String, default: null },
 },
 },
 { timestamps: true }
);

export default mongoose.models.CallLog ||
 mongoose.model("CallLog", CallLogSchema);
