import mongoose, { Schema, Document, Model } from"mongoose";

export interface IDoctorProfile extends Document {
 userId: mongoose.Types.ObjectId;
 specialty: string;
 hospital: string;
 bio: string;
 photo?: string;
 availableSlots: Array<{
 day: string; // e.g."Monday"
 time: string; // e.g."10:00 AM"
 isBooked: boolean;
 }>;
 createdAt: Date;
}

const DoctorProfileSchema = new Schema<IDoctorProfile>(
 {
 userId: { type: Schema.Types.ObjectId, ref:"User", required: true },
 specialty: { type: String, required: true },
 hospital: { type: String, required: true },
 bio: { type: String, required: true },
 photo: { type: String },
 availableSlots: [
 {
 day: { type: String, required: true },
 time: { type: String, required: true },
 isBooked: { type: Boolean, default: false },
 },
 ],
 },
 { timestamps: true }
);

export default mongoose.models.DoctorProfile || mongoose.model<IDoctorProfile>("DoctorProfile", DoctorProfileSchema);
