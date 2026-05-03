import mongoose, { Schema, Document, Model } from"mongoose";

export interface IUser extends Document {
 name: string;
 email: string;
 password?: string;
 role:"doctor" |"patient";
 createdAt: Date;
}

const UserSchema = new Schema<IUser>(
 {
 name: { type: String, required: true },
 email: { type: String, required: true, unique: true },
 password: { type: String },
 role: { type: String, enum: ["doctor","patient"], required: true },
 },
 { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
