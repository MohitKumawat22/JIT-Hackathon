import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "bot"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChatHistorySchema = new mongoose.Schema({
  patientId: { type: String, required: true, index: true },
  messages: [MessageSchema],
  // Stores extracted text from uploaded medical reports
  reports: [
    {
      fileName: String,
      content: String, // extracted text content
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ChatHistorySchema.pre("save", function () {
  this.updatedAt = new Date();
});

export default mongoose.models.ChatHistory ||
  mongoose.model("ChatHistory", ChatHistorySchema);
