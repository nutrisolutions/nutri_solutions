import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "Administrator" },
    role: { type: String, enum: ["superadmin", "hr", "manager"], default: "hr" }
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
