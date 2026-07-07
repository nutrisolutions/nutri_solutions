import Announcement from "../models/Announcement.js";
import Employee from "../models/Employee.js";
import Admin from "../models/Admin.js";

const currentIdentity = async (req) => {
  if (req.admin.isHrEmployee) {
    const employee = await Employee.findById(req.admin.id).select("fullName");
    return { id: employee._id, kind: "employee", name: employee.fullName };
  }
  const admin = await Admin.findById(req.admin.id).select("name");
  return { id: admin._id, kind: "admin", name: admin.name };
};

export const listAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("team", "name")
      .populate("employees", "fullName email")
      .sort({ createdAt: -1 });
    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createAnnouncement = async (req, res) => {
  try {
    const title = (req.body.title || "").trim();
    const message = (req.body.message || "").trim();
    const { audience, team, employees } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    if (!["all", "team", "employees"].includes(audience)) {
      return res.status(400).json({ message: "audience must be 'all', 'team', or 'employees'" });
    }
    if (audience === "team" && !team) {
      return res.status(400).json({ message: "Please select a team" });
    }
    if (audience === "employees" && (!Array.isArray(employees) || employees.length === 0)) {
      return res.status(400).json({ message: "Please select at least one employee" });
    }

    const createdBy = await currentIdentity(req);

    const announcement = await Announcement.create({
      title,
      message,
      audience,
      team: audience === "team" ? team : null,
      employees: audience === "employees" ? employees : [],
      createdBy
    });

    return res.status(201).json({ announcement });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
