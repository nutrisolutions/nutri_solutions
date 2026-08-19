import mongoose from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    icon: { type: String, default: "linkedin", trim: true }
  },
  { _id: false }
);

const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    phoneTel: { type: String, default: "", trim: true },
    address: { type: String, required: true, trim: true },
    streetAddress: { type: String, default: "", trim: true },
    addressLocality: { type: String, default: "", trim: true },
    addressRegion: { type: String, default: "", trim: true },
    postalCode: { type: String, default: "", trim: true },
    addressCountry: { type: String, default: "IN", trim: true },
    mapUrl: { type: String, default: "", trim: true },
    previewImage: { type: String, default: "", trim: true },
    socialLinks: { type: [socialLinkSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("SiteSettings", siteSettingsSchema);
