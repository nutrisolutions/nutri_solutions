import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    author: { type: String, default: "Nutri Solutions" },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date }
  },
  { timestamps: true }
);

blogSchema.index({ published: 1, publishedAt: -1 });

export default mongoose.model("Blog", blogSchema);
