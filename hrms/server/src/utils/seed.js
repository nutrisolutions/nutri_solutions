import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Department from "../models/Department.js";

const DEFAULT_DEPARTMENTS = [
  "Engineering",
  "Quality Assurance",
  "Human Resources",
  "Sales & Marketing",
  "Business Development",
  "Finance & Accounts",
  "Administration",
  "Customer Support"
];

export const seedDatabase = async () => {
  await Admin.updateMany({ role: { $exists: false } }, { $set: { role: "superadmin" } });

  const admins = await Admin.countDocuments();
  if (admins > 0) return;

  const adminEmail = process.env.ADMIN_EMAIL || "admin@nutrisolutions.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await Admin.create({ email: adminEmail, passwordHash, name: "Site Admin", role: "superadmin" });
  console.log(`Empty database — admin seeded: ${adminEmail}`);
};

export const seedDefaultDepartments = async () => {
  const count = await Department.countDocuments();
  if (count > 0) return;

  await Department.insertMany(DEFAULT_DEPARTMENTS.map((name) => ({ name })));
  console.log("No departments found — seeded default departments");
};
