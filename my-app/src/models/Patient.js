import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number },
    blood: { type: String },
  },
  { timestamps: true }
);

// Prevent model recompilation during hot-reload
export default mongoose.models.Patient || mongoose.model("Patient", PatientSchema);
