import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPatient extends Document {
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  bloodType: string;
  department: string;
  phone?: string;
  status: "active" | "critical" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { 
      type: String, 
      enum: ["male", "female", "other"], 
      required: true 
    },
    bloodType: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String },
    status: { 
      type: String, 
      enum: ["active", "critical", "pending"], 
      default: "active" 
    },
  },
  { timestamps: true }
);

const Patient: Model<IPatient> = mongoose.models.Patient ?? mongoose.model<IPatient>("Patient", PatientSchema);
export default Patient;
