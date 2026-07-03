import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    round: { type: Number, required: true, min: 1 },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 5 },
    meetingId: { type: String, default: "" },
    joinUrl: { type: String, default: "" },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    notes: { type: String, default: "" },
    scheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
  },
  { timestamps: true }
);

interviewSchema.index({ employee: 1, round: 1 });

export default mongoose.model("Interview", interviewSchema);
