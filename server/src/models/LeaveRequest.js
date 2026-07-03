import mongoose from "mongoose";

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    leaveType: { type: mongoose.Schema.Types.ObjectId, ref: "LeaveType", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    halfDay: { type: Boolean, default: false },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ["pending", "approved", "rejected", "cancelled"], default: "pending" },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "" }
  },
  { timestamps: true }
);

leaveRequestSchema.index({ employee: 1, status: 1 });

export default mongoose.model("LeaveRequest", leaveRequestSchema);
