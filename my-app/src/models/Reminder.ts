import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReminder extends Document {
  patientId: string;
  patientName: string;
  medicineName: string;
  medicineType: "tablet" | "capsule" | "syrup";
  dosage: string;
  frequency: "once_daily" | "twice_daily" | "thrice_daily" | "once_weekly" | "alternate_days";
  times: string[];
  specificDays?: number[];
  startDate: Date;
  totalQuantity: number;
  remainingQuantity: number;
  tabletsPerDose: number;
  refillAlertDays: number;
  isActive: boolean;
  takenLog: {
    scheduledTime: Date;
    takenAt?: Date;
    status: "taken" | "missed" | "skipped";
    quantityConsumed: number;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    medicineName: { type: String, required: true },
    medicineType: { 
      type: String, 
      enum: ["tablet", "capsule", "syrup"], 
      default: "tablet" 
    },
    dosage: { type: String, required: true },
    frequency: { 
      type: String, 
      enum: ["once_daily", "twice_daily", "thrice_daily", "once_weekly", "alternate_days"], 
      required: true 
    },
    times: { type: [String], required: true },
    specificDays: { type: [Number] },
    startDate: { type: Date, required: true },
    totalQuantity: { type: Number, required: true },
    remainingQuantity: { type: Number, required: true },
    tabletsPerDose: { type: Number, default: 1 },
    refillAlertDays: { type: Number, default: 2 },
    isActive: { type: Boolean, default: true },
    takenLog: [
      {
        scheduledTime: { type: Date, required: true },
        takenAt: { type: Date },
        status: { 
          type: String, 
          enum: ["taken", "missed", "skipped"], 
          required: true 
        },
        quantityConsumed: { type: Number, default: 0 }
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

const Reminder: Model<IReminder> = mongoose.models.Reminder ?? mongoose.model<IReminder>("Reminder", ReminderSchema);

export default Reminder;
