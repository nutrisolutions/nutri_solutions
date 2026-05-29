import mongoose from "mongoose";

const jobApplicationSchema = new mongoose.Schema(
  {
    position: { type: mongoose.Schema.Types.ObjectId, ref: "JobPosition", required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    linkedIn: { type: String, default: "", trim: true },
    portfolioUrl: { type: String, default: "", trim: true },
    resumeUrl: { type: String, default: "", trim: true },
    yearsExperience: { type: String, default: "", trim: true },
    coverLetter: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

jobApplicationSchema.index({ position: 1, createdAt: -1 });

export default mongoose.model("JobApplication", jobApplicationSchema);
