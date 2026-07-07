import mongoose from "mongoose";

const techStackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "General" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true }
  },
  { timestamps: true }
);

techStackSchema.index({ published: 1, order: -1 });

export default mongoose.model("TechStack", techStackSchema);
