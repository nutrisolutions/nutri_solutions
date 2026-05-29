import TechStack from "../models/TechStack.js";

const sortQuery = { order: -1, createdAt: -1 };

export const listPublishedTechStack = async (_req, res) => {
  try {
    const items = await TechStack.find({ published: true }).sort(sortQuery);
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listAllTechStack = async (_req, res) => {
  try {
    const items = await TechStack.find().sort(sortQuery);
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTechStack = async (req, res) => {
  try {
    const top = await TechStack.findOne().sort({ order: -1 }).select("order").lean();
    const order = (top?.order ?? 0) + 1;

    const item = await TechStack.create({
      name: req.body.name,
      category: req.body.category || "General",
      published: req.body.published !== false,
      order
    });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTechStack = async (req, res) => {
  try {
    const item = await TechStack.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        category: req.body.category,
        published: Boolean(req.body.published)
      },
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reorderTechStack = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ message: "ids array required" });
    }

    await Promise.all(
      ids.map((id, index) => TechStack.findByIdAndUpdate(id, { order: ids.length - index }))
    );

    const items = await TechStack.find().sort(sortQuery);
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTechStack = async (req, res) => {
  try {
    const item = await TechStack.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
