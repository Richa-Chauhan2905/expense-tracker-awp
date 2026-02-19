import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional (logged in user)
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },

    issueType: {
      type: String,
      required: true,
      enum: ["general", "support", "feature", "bug", "feedback", "other"],
    },

    urgency: {
      type: String,
      required: true,
      enum: ["low", "medium", "high", "urgent"],
    },

    message: { type: String, required: true, trim: true },

    status: {
      type: String,
      default: "open",
      enum: ["open", "in_progress", "resolved", "closed"],
    },
  },
  { timestamps: true }
);

contactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ContactTicket", contactSchema);
