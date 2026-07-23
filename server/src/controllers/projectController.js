import Project from "../models/Project.js";
import { slugify } from "../utils/slugify.js";

const parseList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const listPublishedProjects = async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = { published: true };
    if (featured === "true") filter.featured = true;

    const projects = await Project.find(filter).sort({ order: -1, createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, published: true });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json({ project });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listAllProjects = async (_req, res) => {
  try {
    const projects = await Project.find().sort({ order: -1, createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug?.trim() || slugify(body.title);
    const project = await Project.create({
      title: body.title,
      slug,
      image: body.image,
      applicationType: body.applicationType,
      shortDescription: body.shortDescription || "",
      description: body.description || "",
      banner: body.banner || body.image,
      techStack: parseList(body.techStack),
      screenshots: parseList(body.screenshots),
      homeMockupImage: body.homeMockupImage?.trim() || "",
      published: body.published !== false,
      featured: Boolean(body.featured),
      order: Number(body.order) || 0
    });
    return res.status(201).json({ project });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      title: body.title,
      slug: body.slug?.trim() || slugify(body.title),
      image: body.image,
      applicationType: body.applicationType,
      shortDescription: body.shortDescription,
      description: body.description,
      banner: body.banner,
      techStack: parseList(body.techStack),
      screenshots: parseList(body.screenshots),
      homeMockupImage: body.homeMockupImage?.trim() || "",
      published: body.published,
      featured: body.featured,
      order: Number(body.order) || 0
    };

    const project = await Project.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json({ project });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
