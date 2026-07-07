import mongoose from "mongoose";

/** One row per visitor per day — powers unique daily visitor counts. */
const analyticsVisitorDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    visitorId: { type: String, required: true, index: true }
  },
  { timestamps: true }
);

analyticsVisitorDaySchema.index({ date: 1, visitorId: 1 }, { unique: true });

export default mongoose.model("AnalyticsVisitorDay", analyticsVisitorDaySchema);
