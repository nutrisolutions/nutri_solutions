import Department from "../models/Department.js";
import Employee from "../models/Employee.js";

export const listDepartments = async (_req, res) => {
  try {
    const departments = await Department.find().populate("manager", "email name").sort({ name: 1 });
    return res.json({ departments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create({
      name: req.body.name,
      description: req.body.description || "",
      manager: req.body.manager || null
    });
    return res.status(201).json({ department });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Department name already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        manager: req.body.manager || null
      },
      { new: true, runValidators: true }
    );
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.json({ department });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Department name already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const inUse = await Employee.countDocuments({ department: req.params.id });
    if (inUse > 0) {
      return res.status(409).json({ message: "Cannot delete a department with employees assigned to it" });
    }
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
