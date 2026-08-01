import mongoose from "mongoose";

export const APPLICATION_TYPES = [
  "Web Application",
  "Mobile Application",
  "Custom Software",
  "Cloud & DevOps",
  "UI/UX Design"
];

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    image: { type: String, required: true },
    applicationType: { type: String, enum: APPLICATION_TYPES, required: true },
    shortDescription: { type: String, default: "" },
    description: { type: String, default: "" },
    banner: { type: String, default: "" },
    techStack: [{ type: String }],
    screenshots: [{ type: String }],
    /** Screenshot shown inside device frame on home page marquee */
    homeMockupImage: { type: String, default: "" },
    liveDemoAvailable: { type: Boolean, default: false },
    liveDemoLink: { type: String, default: "" },
    published: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

projectSchema.index({ published: 1, order: -1, createdAt: -1 });

export default mongoose.model("Project", projectSchema);
