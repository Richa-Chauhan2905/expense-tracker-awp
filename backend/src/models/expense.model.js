import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // required fields
    expenseDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0 },
    title: { type: String, required: true, trim: true }, // description/title
    category: { type: String, required: true, trim: true },

    // optional receipt
    receipt: {
      url: { type: String, default: "" },      // e.g. /uploads/receipts/abc.pdf
      fileName: { type: String, default: "" },
      fileType: { type: String, default: "" }, // image/png, application/pdf
      fileSize: { type: Number, default: 0 },
    },

    // helpful for reports
    currencyAtTime: { type: String, default: "INR" }, // store user currency when saved (optional)
  },
  { timestamps: true }
);

// Quick index for fast month queries
expenseSchema.index({ user: 1, expenseDate: -1 });

export default mongoose.model("Expense", expenseSchema);
