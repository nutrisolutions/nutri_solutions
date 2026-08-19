import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Project from "../models/Project.js";
import Blog from "../models/Blog.js";
import TechStack from "../models/TechStack.js";
import JobPosition from "../models/JobPosition.js";
import { getOrCreateSiteSettings } from "../controllers/settingsController.js";

const isDatabaseEmpty = async () => {
  const [admins, projects, blogs, tech, careers] = await Promise.all([
    Admin.countDocuments(),
    Project.countDocuments(),
    Blog.countDocuments(),
    TechStack.countDocuments(),
    JobPosition.countDocuments()
  ]);

  return admins + projects + blogs + tech + careers === 0;
};

export const seedDatabase = async () => {
  await getOrCreateSiteSettings();

  const empty = await isDatabaseEmpty();
  if (!empty) return;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@nutrisolutions.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await Admin.create({ email: adminEmail, passwordHash, name: "Site Admin" });
  console.log(`Empty database — admin seeded: ${adminEmail}`);
};
