import mongoose from "mongoose";

const transcriptEntrySchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["assistant", "patient"], required: true },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CallLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "in-progress", "completed", "failed", "cancelled"],
      default: "scheduled",
      index: true,
    },
    callSid: { type: String, default: null },
    // Pre-fetched context snapshot so the webhook doesn't need to re-query DB mid-call
    context: {
      patient: { type: Object, default: null },
      lastTriage: { type: Object, default: null },
      recentBookings: { type: Array, default: [] },
      pastCallSummaries: { type: Array, default: [] },
    },
    // Pre-generated greeting by Grok before the call fires
    greeting: { type: String, default: null },
    transcript: { type: [transcriptEntrySchema], default: [] },
    summary: { type: String, default: null },
    severity: {
      type: String,
      enum: ["critical", "high", "moderate", "low", "info"],
      default: "info",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.CallLog ||
  mongoose.model("CallLog", CallLogSchema);
