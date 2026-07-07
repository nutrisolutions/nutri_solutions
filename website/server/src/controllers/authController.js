import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const signToken = (admin) =>
  jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET || "dev-secret-change-me", {
    expiresIn: "7d"
  });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, admin.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(admin);
    return res.json({
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-passwordHash");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.json({ admin: { id: admin._id, email: admin.email, name: admin.name } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
