import mongoose from "mongoose";

const leaveTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    defaultDaysPerYear: { type: Number, required: true, default: 12 },
    paid: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model("LeaveType", leaveTypeSchema);
