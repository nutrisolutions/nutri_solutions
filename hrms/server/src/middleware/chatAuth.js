import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";

/**
 * Chat is shared company-wide: any authenticated Admin or Employee (any
 * department, any status) can use it — unlike requireAuth's HR-only bridge
 * for the admin panel. Resolves the JWT into a normalized identity used
 * throughout the chat feature.
 */
export const resolveChatIdentity = async (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");

  if (payload.role === "employee") {
    const employee = await Employee.findById(payload.id).select("fullName suspended");
    if (!employee || employee.suspended) return null;
    return { id: employee._id, kind: "employee", name: employee.fullName };
  }

  const admin = await Admin.findById(payload.id).select("name");
  if (!admin) return null;
  return { id: admin._id, kind: "admin", name: admin.name };
};

export const requireChatAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const identity = await resolveChatIdentity(header.slice(7));
    if (!identity) return res.status(401).json({ message: "Invalid or expired token" });
    req.identity = identity;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
