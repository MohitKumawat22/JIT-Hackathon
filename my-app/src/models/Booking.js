import mongoose from"mongoose";

const BookingSchema = new mongoose.Schema(
 {
 patientId: { type: mongoose.Schema.Types.ObjectId, ref:"Patient", required: true, index: true },
 facilityName: { type: String, required: true },
 address: { type: String },
 lat: { type: Number },
 lng: { type: Number },
 rating: { type: Number },
 placeId: { type: String },
 department: { type: String, default:"General" },
 status: { type: String, enum: ["upcoming","completed","cancelled"], default:"upcoming" },
 notes: { type: String },
 scheduledDate: { type: String },
 scheduledSlot: { type: String },
 fee: { type: String },
 },
 { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
