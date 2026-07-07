import mongoose from "mongoose";

const calendarEventSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    type: { type: String, enum: ["holiday", "wfh"], required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }
  },
  { timestamps: true }
);

calendarEventSchema.index({ date: 1 });

export default mongoose.model("CalendarEvent", calendarEventSchema);
