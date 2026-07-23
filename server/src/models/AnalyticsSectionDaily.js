import mongoose from "mongoose";

const analyticsSectionDailySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, index: true },
    sectionId: { type: String, required: true, index: true },
    path: { type: String, default: "", index: true },
    count: { type: Number, default: 0 }
  },
  { timestamps: true }
);

analyticsSectionDailySchema.index({ date: 1, sectionId: 1, path: 1 }, { unique: true });

export default mongoose.model("AnalyticsSectionDaily", analyticsSectionDailySchema);
