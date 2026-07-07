import cron from "node-cron";
import Attendance from "../models/Attendance.js";
import { REQUIRED_DAILY_HOURS, hoursBetween, istCheckoutInstant, istDateString } from "./attendancePolicy.js";

const closeRecord = async (record) => {
  const checkoutAt = istCheckoutInstant(record.date);
  record.checkOutAt = checkoutAt;
  record.hoursWorked = hoursBetween(record.checkInAt, checkoutAt);
  record.short = record.hoursWorked < REQUIRED_DAILY_HOURS;
  record.status = "auto_checked_out";
  await record.save();
};

// Closes today's open records once 6pm IST has passed.
export const autoCheckoutOpenAttendance = async () => {
  const today = istDateString();
  const openRecords = await Attendance.find({ date: today, status: "open" });
  for (const record of openRecords) {
    await closeRecord(record);
  }
  return openRecords.length;
};

// Catches any record left open from a previous day (e.g. server was down at 6pm) so it
// doesn't stay "open" forever — closed using that day's own 6pm IST instant.
export const closeStaleOpenAttendance = async () => {
  const today = istDateString();
  const staleRecords = await Attendance.find({ date: { $ne: today }, status: "open" });
  for (const record of staleRecords) {
    await closeRecord(record);
  }
  return staleRecords.length;
};

export const scheduleAttendanceAutoCheckout = () => {
  // Runs daily at 18:00 Asia/Kolkata (6:00 PM IST).
  cron.schedule(
    "0 18 * * *",
    async () => {
      try {
        const count = await autoCheckoutOpenAttendance();
        console.log(`Attendance auto-checkout: closed ${count} open record(s).`);
      } catch (error) {
        console.error("Attendance auto-checkout failed:", error.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
};
