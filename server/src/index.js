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
import { seedDatabase } from "./utils/seed.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

const allowedOrigins = [
  "https://nutrisolutions.co.in",
  "https://www.nutrisolutions.co.in",
];

if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (e.g. server-to-server requests, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Nutri Solutions Website API" });
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

connectDb()
  .then(async () => {
    await seedDatabase();
    const server = app.listen(PORT, () => {
      console.log(`Website server running on port ${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Change PORT in website/server/.env (macOS often uses 5000 for AirPlay).`,
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
