import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import { expireOfferIfNeeded, offerBlockedMessage, OFFER_BLOCKED_STATUSES, SUSPENDED_MESSAGE } from "../utils/offerExpiry.js";

const signEmployeeToken = (employee) =>
  jwt.sign(
    { id: employee._id, email: employee.email, role: "employee" },
    process.env.JWT_SECRET || "dev-secret-change-me",
    { expiresIn: "7d" }
  );

export const employeeLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (!employee || !employee.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, employee.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (employee.suspended) {
      return res.status(403).json({ message: SUSPENDED_MESSAGE });
    }

    await expireOfferIfNeeded(employee);
    if (OFFER_BLOCKED_STATUSES.includes(employee.status)) {
      return res.status(403).json({ message: offerBlockedMessage(employee.status) });
    }

    const token = signEmployeeToken(employee);
    return res.json({
      token,
      employee: { id: employee._id, email: employee.email, fullName: employee.fullName },
      mustSetPassword: employee.mustSetPassword
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const employeeSetPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters" });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.employmentType !== "permanent") {
      return res.status(403).json({ message: "Only permanent employees can change their password" });
    }

    const valid = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!valid) return res.status(401).json({ message: "Current password is incorrect" });

    employee.passwordHash = await bcrypt.hash(newPassword, 10);
    employee.mustSetPassword = false;
    await employee.save();

    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
