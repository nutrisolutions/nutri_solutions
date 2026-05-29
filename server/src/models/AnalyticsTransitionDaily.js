import mongoose from "mongoose";

const analyticsTransitionDailySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    fromPath: { type: String, required: true },
    toPath: { type: String, required: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

analyticsTransitionDailySchema.index({ date: 1, fromPath: 1, toPath: 1 }, { unique: true });

export default mongoose.model("AnalyticsTransitionDaily", analyticsTransitionDailySchema);
