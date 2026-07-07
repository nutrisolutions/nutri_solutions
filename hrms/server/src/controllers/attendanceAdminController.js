import Attendance from "../models/Attendance.js";
import { istDateString } from "../utils/attendancePolicy.js";

export const listAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const filter = { date: date || istDateString() };
    if (employeeId) filter.employee = employeeId;

    const records = await Attendance.find(filter)
      .populate("employee", "fullName email")
      .sort({ checkInAt: -1 });

    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
