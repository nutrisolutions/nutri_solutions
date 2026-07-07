import cron from "node-cron";
import Employee from "../models/Employee.js";
import { istDateString } from "./attendancePolicy.js";

// Cuts off portal access for anyone whose approved resignation's last working
// day has arrived or passed. Runs at boot (to catch up if the server was down)
// and daily at midnight IST.
export const processApprovedResignations = async () => {
  const today = istDateString();
  const candidates = await Employee.find({
    "resignation.status": "approved",
    status: { $ne: "resigned" }
  });

  let count = 0;
  for (const employee of candidates) {
    if (!employee.resignation.lastWorkingDay) continue;
    const lastDay = istDateString(new Date(employee.resignation.lastWorkingDay));
    if (today < lastDay) continue;

    employee.status = "resigned";
    employee.resignedAt = new Date();
    employee.statusHistory.push({
      status: "resigned",
      note: "Resignation effective — last working day reached",
      changedBy: "system",
      changedAt: new Date()
    });
    await employee.save();
    count++;
  }
  return count;
};

export const scheduleResignationCutoff = () => {
  // Runs daily at 00:05 Asia/Kolkata (just after midnight IST).
  cron.schedule(
    "5 0 * * *",
    async () => {
      try {
        const count = await processApprovedResignations();
        console.log(`Resignation cutoff: transitioned ${count} employee(s) to resigned.`);
      } catch (error) {
        console.error("Resignation cutoff failed:", error.message);
      }
    },
    { timezone: "Asia/Kolkata" }
  );
};
