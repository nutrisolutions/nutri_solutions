// Must run before any other import — several modules (e.g. config/cloudinary.js)
// read process.env at import time, so dotenv has to populate it first.
import "dotenv/config";

import cors from "cors";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { seedDatabase, seedDefaultDepartments } from "./utils/seed.js";
import { initSocket } from "./realtime/socket.js";
import { closeStaleOpenAttendance, scheduleAttendanceAutoCheckout } from "./utils/attendanceCron.js";
import { processApprovedResignations, scheduleResignationCutoff } from "./utils/resignationCron.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5002;

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5174"
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "Nutri Solutions HRMS API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/chat", chatRoutes);

connectDb()
  .then(async () => {
    await seedDatabase();
    await seedDefaultDepartments();
    await closeStaleOpenAttendance();
    scheduleAttendanceAutoCheckout();
    await processApprovedResignations();
    scheduleResignationCutoff();
    const server = app.listen(PORT, () => {
      console.log(`HRMS server running on port ${PORT}`);
    });
    initSocket(server);

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use. Change PORT in hrms/server/.env.`
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
