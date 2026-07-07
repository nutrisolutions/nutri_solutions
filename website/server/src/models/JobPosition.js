import mongoose from "mongoose";

const jobPositionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, default: "Engineering", trim: true },
    location: { type: String, default: "Hyderabad, India", trim: true },
    employmentType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      default: "Full-time"
    },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    requirements: { type: [String], default: [] },
    published: { type: Boolean, default: false }
  },
  { timestamps: true }
);

jobPositionSchema.index({ published: 1, createdAt: -1 });

export default mongoose.model("JobPosition", jobPositionSchema);
