import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["pageview", "section_view", "page_transition"],
      required: true,
      index: true
    },
    path: { type: String, default: "", index: true },
    sectionId: { type: String, default: "", index: true },
    fromPath: { type: String, default: "" },
    toPath: { type: String, default: "" },
    visitorId: { type: String, required: true, index: true },
    sessionId: { type: String, default: "" }
  },
  { timestamps: true }
);

analyticsEventSchema.index({ createdAt: -1 });
analyticsEventSchema.index({ type: 1, createdAt: -1 });

export default mongoose.model("AnalyticsEvent", analyticsEventSchema);
