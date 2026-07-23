import Blog from "../models/Blog.js";
import { slugify } from "../utils/slugify.js";

export const listPublishedBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find({ published: true }).sort({ publishedAt: -1, createdAt: -1 });
    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, published: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json({ blog });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listAllBlogs = async (_req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ blogs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createBlog = async (req, res) => {
  try {
    const body = req.body;
    const slug = body.slug?.trim() || slugify(body.title);
    const blog = await Blog.create({
      title: body.title,
      slug,
      excerpt: body.excerpt || "",
      content: body.content || "",
      coverImage: body.coverImage || "",
      author: body.author || "Nutri Solutions",
      published: Boolean(body.published),
      publishedAt: body.published ? body.publishedAt || new Date() : null
    });
    return res.status(201).json({ blog });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const body = req.body;
    const updates = {
      title: body.title,
      slug: body.slug?.trim() || slugify(body.title),
      excerpt: body.excerpt,
      content: body.content,
      coverImage: body.coverImage,
      author: body.author,
      published: Boolean(body.published),
      publishedAt: body.published ? body.publishedAt || new Date() : null
    };

    const blog = await Blog.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json({ blog });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Slug already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
