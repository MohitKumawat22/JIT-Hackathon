import mongoose from "mongoose";

const MedicineReminderSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
    medicineName: { type: String, required: true },
    time: { type: String, required: true }, // Format: HH:mm
    frequency: { type: String, default: "daily" }, // daily, once
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Prevent model recompilation during hot-reload
export default mongoose.models.MedicineReminder || mongoose.model("MedicineReminder", MedicineReminderSchema);
