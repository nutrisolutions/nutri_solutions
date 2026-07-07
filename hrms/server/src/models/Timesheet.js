import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    date: { type: String, required: true }, // "YYYY-MM-DD" in IST
    workUpdate: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

timesheetSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Timesheet", timesheetSchema);
