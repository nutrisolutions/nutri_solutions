import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true },
    company: { type: String, default: "", trim: true },
    topic: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

contactInquirySchema.index({ createdAt: -1 });

export default mongoose.model("ContactInquiry", contactInquirySchema);
