import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" in IST
    checkInAt: { type: Date, required: true },
    checkOutAt: { type: Date, default: null },
    hoursWorked: { type: Number, default: 0 },
    status: { type: String, enum: ["open", "checked_out", "auto_checked_out"], default: "open" },
    short: { type: Boolean, default: false }
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
