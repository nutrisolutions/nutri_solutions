// Must run before any other import — several modules (e.g. config/cloudinary.js)
// read process.env at import time, so dotenv has to populate it first.
import "dotenv/config";

import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import contentRoutes from "./routes/contentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import techStackRoutes from "./routes/techStackRoutes.js";
import careerRoutes from "./routes/careerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import { seedDatabase } from "./utils/seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Nutri Solutions API" });
});

app.use("/api/content", contentRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/tech-stack", techStackRoutes);
app.use("/api/careers", careerRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);

connectDb()
  .then(async () => {
    await seedDatabase();
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Change PORT in server/.env (macOS often uses 5000 for AirPlay).`
        );
        process.exit(1);
      }
      throw err;
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
