import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, required: true },
  },
  { _id: false }
);

const TriageSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    title: { type: String, required: true },
    severity: { type: String, enum: ["critical", "high", "moderate", "low", "info"], default: "info" },
    symptoms: [{ type: String }],
    transcript: [messageSchema],
    recommendation: { type: String },
    lang: { type: String, default: "en" },
  },
  { timestamps: true }
);

export default mongoose.models.Triage || mongoose.model("Triage", TriageSchema);
