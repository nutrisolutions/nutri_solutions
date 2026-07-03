import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";

const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );

const signEmployeeToken = (employee) =>
  jwt.sign(
    { id: employee._id, email: employee.email, role: "employee" },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );

export const unifiedLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const normalizedEmail = email.toLowerCase().trim();

    const admin = await Admin.findOne({ email: normalizedEmail });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
      const token = signToken(admin);
      return res.json({
        account: "admin",
        token,
        admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
      });
    }

    const employee = await Employee.findOne({ email: normalizedEmail });
    if (employee?.passwordHash && (await bcrypt.compare(password, employee.passwordHash))) {
      const token = signEmployeeToken(employee);
      return res.json({
        account: "employee",
        token,
        employee: { id: employee._id, email: employee.email, fullName: employee.fullName },
        mustSetPassword: employee.mustSetPassword
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

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
      admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-passwordHash");
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    return res.json({ admin: { id: admin._id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
