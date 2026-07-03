import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Project from "../models/Project.js";
import Blog from "../models/Blog.js";
import TechStack from "../models/TechStack.js";
import JobPosition from "../models/JobPosition.js";
import LeaveType from "../models/LeaveType.js";

const DEFAULT_LEAVE_TYPES = [
  { name: "Casual Leave", defaultDaysPerYear: 12, paid: true },
  { name: "Sick Leave", defaultDaysPerYear: 12, paid: true },
  { name: "Earned Leave", defaultDaysPerYear: 15, paid: true },
  { name: "Loss of Pay", defaultDaysPerYear: 0, paid: false }
];

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
  await Admin.updateMany({ role: { $exists: false } }, { $set: { role: "superadmin" } });

  const empty = await isDatabaseEmpty();
  if (!empty) return;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@nutrisolutions.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await Admin.create({ email: adminEmail, passwordHash, name: "Site Admin", role: "superadmin" });
  console.log(`Empty database — admin seeded: ${adminEmail}`);
};

export const seedDefaultLeaveTypes = async () => {
  const count = await LeaveType.countDocuments();
  if (count > 0) return;

  await LeaveType.insertMany(DEFAULT_LEAVE_TYPES);
  console.log("No leave types found — seeded default leave types");
};
