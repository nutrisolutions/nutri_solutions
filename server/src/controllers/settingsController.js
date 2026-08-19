import SiteSettings from "../models/SiteSettings.js";

export const DEFAULT_SITE_SETTINGS = {
  key: "default",
  email: "info@nutrisolutions.co.in",
  phone: "+91 91001 19741",
  phoneTel: "+919100119741",
  address:
    "Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd, Hyderabad, Telangana 500032",
  streetAddress: "Orbit, Plot No 30/C, Sy No 83/1, Raidurgam, Knowledge City Rd",
  addressLocality: "Hyderabad",
  addressRegion: "Telangana",
  postalCode: "500032",
  addressCountry: "IN",
  mapUrl: "https://maps.google.com/?q=Orbit+Plot+30+C+Knowledge+City+Rd+Raidurgam+Hyderabad+500032",
  previewImage: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=800&q=80",
  socialLinks: [
    { label: "Instagram", url: "https://www.instagram.com/nutrisolutionspvtltd/", icon: "instagram" },
    { label: "Facebook", url: "https://www.facebook.com/profile.php?id=61591288857715", icon: "facebook" },
    { label: "LinkedIn", url: "https://www.linkedin.com/company/nutri-solutions-pvt-ltd", icon: "linkedin" }
  ]
};

const ALLOWED_SOCIAL_ICONS = new Set(["instagram", "facebook", "linkedin"]);

export const toPhoneTel = (phone, fallback = "") => {
  const raw = String(phone || "").trim();
  if (!raw) return fallback;
  const digits = raw.replace(/[^\d+]/g, "");
  if (!digits) return fallback;
  return digits.startsWith("+") ? digits : `+${digits}`;
};

const serialize = (doc) => {
  const settings = doc.toObject();
  delete settings.__v;
  return settings;
};

export const getOrCreateSiteSettings = async () => {
  let doc = await SiteSettings.findOne({ key: "default" });
  if (!doc) {
    doc = await SiteSettings.create(DEFAULT_SITE_SETTINGS);
  }
  return doc;
};

const sanitizeSocialLinks = (links) => {
  if (!Array.isArray(links)) return undefined;
  return links
    .map((link) => ({
      label: String(link.label || "").trim(),
      url: String(link.url || "").trim(),
      icon: ALLOWED_SOCIAL_ICONS.has(String(link.icon || "").toLowerCase())
        ? String(link.icon).toLowerCase()
        : "linkedin"
    }))
    .filter((link) => link.label && link.url);
};

export const getPublicSettings = async (_req, res) => {
  try {
    const doc = await getOrCreateSiteSettings();
    return res.json({ settings: serialize(doc) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAdminSettings = async (_req, res) => {
  try {
    const doc = await getOrCreateSiteSettings();
    return res.json({ settings: serialize(doc) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const body = req.body || {};
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const address = body.address?.trim();

    if (!email || !phone || !address) {
      return res.status(400).json({ message: "Email, phone, and address are required" });
    }

    const updates = {
      email,
      phone,
      phoneTel: toPhoneTel(body.phoneTel || phone, toPhoneTel(phone)),
      address,
      streetAddress: body.streetAddress?.trim() || "",
      addressLocality: body.addressLocality?.trim() || "",
      addressRegion: body.addressRegion?.trim() || "",
      postalCode: body.postalCode?.trim() || "",
      addressCountry: body.addressCountry?.trim() || "IN",
      mapUrl: body.mapUrl?.trim() || "",
      previewImage: body.previewImage?.trim() || ""
    };

    const socialLinks = sanitizeSocialLinks(body.socialLinks);
    if (socialLinks) updates.socialLinks = socialLinks;

    const doc = await SiteSettings.findOneAndUpdate({ key: "default" }, updates, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true
    });

    return res.json({ settings: serialize(doc) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
