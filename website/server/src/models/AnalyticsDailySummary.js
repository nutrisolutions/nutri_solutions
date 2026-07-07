import mongoose from "mongoose";

/** Per-day rolled-up counters (updated on each event ingest). */
const analyticsDailySummarySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true, index: true },
    pageViews: { type: Number, default: 0 },
    sectionViews: { type: Number, default: 0 },
    transitions: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.model("AnalyticsDailySummary", analyticsDailySummarySchema);
