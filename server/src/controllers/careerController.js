import JobPosition from "../models/JobPosition.js";
import JobApplication from "../models/JobApplication.js";
import { slugify } from "../utils/slugify.js";

const parseRequirements = (value) => {
  if (Array.isArray(value)) return value.map((s) => String(s).trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const listPublishedPositions = async (_req, res) => {
  try {
    const positions = await JobPosition.find({ published: true }).sort({ createdAt: -1 });
    return res.json({ positions });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getPositionBySlug = async (req, res) => {
  try {
    const position = await JobPosition.findOne({ slug: req.params.slug, published: true });
    if (!position) return res.status(404).json({ message: "Position not found" });
    return res.json({ position });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitApplication = async (req, res) => {
  try {
    const position = await JobPosition.findOne({ slug: req.params.slug, published: true });
    if (!position) return res.status(404).json({ message: "Position not found or no longer open" });

    const body = req.body;
    const fullName = body.fullName?.trim();
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const coverLetter = body.coverLetter?.trim();

    if (!fullName || !email || !phone || !coverLetter) {
      return res.status(400).json({ message: "Name, email, phone, and cover letter are required" });
    }

    const application = await JobApplication.create({
      position: position._id,
      fullName,
      email,
      phone,
      linkedIn: body.linkedIn?.trim() || "",
      portfolioUrl: body.portfolioUrl?.trim() || "",
      resumeUrl: body.resumeUrl?.trim() || "",
      yearsExperience: body.yearsExperience?.trim() || "",
      coverLetter
    });

    return res.status(201).json({ ok: true, applicationId: application._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listAllPositions = async (_req, res) => {
  try {
    const positions = await JobPosition.find().sort({ createdAt: -1 });
    const counts = await JobApplication.aggregate([
      { $group: { _id: "$position", count: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));

    const withCounts = positions.map((p) => ({
      ...p.toObject(),
      applicationCount: countMap[String(p._id)] || 0
    }));

    return res.json({ positions: withCounts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPosition = async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug?.trim() || slugify(body.title);
    const position = await JobPosition.create({
      title: body.title,
      slug,
      department: body.department || "Engineering",
      location: body.location || "",
      employmentType: body.employmentType || "Full-time",
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      requirements: parseRequirements(body.requirements),
      published: Boolean(body.published)
    });
    return res.status(201).json({ position });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const updatePosition = async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      title: body.title,
      slug: body.slug?.trim() || slugify(body.title),
      department: body.department,
      location: body.location,
      employmentType: body.employmentType,
      shortDescription: body.shortDescription,
      description: body.description,
      requirements: parseRequirements(body.requirements),
      published: Boolean(body.published)
    };

    const position = await JobPosition.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!position) return res.status(404).json({ message: "Position not found" });
    return res.json({ position });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const deletePosition = async (req, res) => {
  try {
    const position = await JobPosition.findByIdAndDelete(req.params.id);
    if (!position) return res.status(404).json({ message: "Position not found" });
    await JobApplication.deleteMany({ position: position._id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listApplicationsForPosition = async (req, res) => {
  try {
    const position = await JobPosition.findById(req.params.id);
    if (!position) return res.status(404).json({ message: "Position not found" });

    const applications = await JobApplication.find({ position: position._id }).sort({ createdAt: -1 });
    return res.json({ position, applications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteApplication = async (req, res) => {
  try {
    const application = await JobApplication.findByIdAndDelete(req.params.id);
    if (!application) return res.status(404).json({ message: "Application not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
