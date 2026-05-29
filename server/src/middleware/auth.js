import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const token = header.slice(7);
    req.admin = jwt.verify(token, process.env.JWT_SECRET || "dev-secret-change-me");
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
