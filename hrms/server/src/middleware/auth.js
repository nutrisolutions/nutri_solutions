import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";

export const HR_DEPARTMENT_NAME = "Human Resources";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");

    if (payload.role === "employee") {
      const employee = await Employee.findById(payload.id).populate("department", "name");
      if (
        !employee ||
        employee.suspended ||
        ["resigned", "terminated"].includes(employee.status) ||
        employee.employmentType !== "permanent" ||
        employee.department?.name !== HR_DEPARTMENT_NAME
      ) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
      req.admin = { id: payload.id, email: payload.email, role: "hr", isHrEmployee: true };
      return next();
    }

    req.admin = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireEmployeeAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    if (payload.role !== "employee") {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    req.employee = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ message: "You do not have permission to perform this action" });
  }
  return next();
};
