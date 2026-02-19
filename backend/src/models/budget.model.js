import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // month in YYYY-MM format for easy lookup
    month: { type: String, required: true }, // e.g. "2026-02"

    amount: { type: Number, required: true, min: 0 },

    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, month: 1 }, { unique: true });

export default mongoose.model("Budget", budgetSchema);
