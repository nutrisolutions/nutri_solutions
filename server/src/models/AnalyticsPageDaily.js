import mongoose from "mongoose";

/** Page view counts per path per day. */
const analyticsPageDailySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    path: { type: String, required: true, index: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

analyticsPageDailySchema.index({ date: 1, path: 1 }, { unique: true });

export default mongoose.model("AnalyticsPageDaily", analyticsPageDailySchema);
