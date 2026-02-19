import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },

    // optional “profile-ish” fields
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },

    password: { type: String, required: true },

    currencyPreference: { type: String, default: "INR" }, // global currency
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
