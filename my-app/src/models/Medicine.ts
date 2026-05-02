import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMedicine extends Document {
  name: string;
  type: "tablet" | "capsule" | "syrup" | "injection";
  stock: number;
  unit: string;
  expiryDate?: Date;
  lowStockThreshold: number;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { 
      type: String, 
      enum: ["tablet", "capsule", "syrup", "injection"], 
      default: "tablet" 
    },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: "units" },
    expiryDate: { type: Date },
    lowStockThreshold: { type: Number, default: 30 },
  },
  { timestamps: true }
);

const Medicine: Model<IMedicine> = mongoose.models.Medicine ?? mongoose.model<IMedicine>("Medicine", MedicineSchema);
export default Medicine;
