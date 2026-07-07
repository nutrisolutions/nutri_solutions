import Employee from "../models/Employee.js";
import Interview from "../models/Interview.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import { createJitsiMeeting } from "../services/jitsiService.js";

const pushHistory = (employee, status, note, changedBy) => {
  employee.status = status;
  employee.statusHistory.push({ status, note, changedBy, changedAt: new Date() });
};

export const listInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ employee: req.params.id }).sort({ round: 1 });
    return res.json({ interviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const scheduleInterview = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!["draft", "interviewing"].includes(employee.status)) {
      return res.status(400).json({ message: "Interviews can only be scheduled before a candidate is marked selected" });
    }

    const { round, date, time, durationMinutes } = req.body;
    if (!round || !date || !time || !durationMinutes) {
      return res.status(400).json({ message: "round, date, time, and durationMinutes are required" });
    }

    const startDateTime = new Date(`${date}T${time}`);
    if (Number.isNaN(startDateTime.getTime())) {
      return res.status(400).json({ message: "Invalid date/time" });
    }
    const meeting = createJitsiMeeting({
      subject: `Interview (Round ${round}) — ${employee.fullName}`,
      employeeId: employee._id,
      round
    });

    const interview = await Interview.create({
      employee: employee._id,
      round: Number(round),
      scheduledAt: startDateTime,
      durationMinutes: Number(durationMinutes),
      meetingId: meeting.meetingId,
      joinUrl: meeting.joinUrl,
      scheduledBy: req.admin.id
    });

    if (employee.status === "draft") {
      pushHistory(employee, "interviewing", `Round ${round} interview scheduled`, "hr");
      await employee.save();
    }

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "employee",
      type: "interview_scheduled",
      message: `Round ${round} interview scheduled for ${startDateTime.toLocaleString()} (${durationMinutes} min). Join link: ${interview.joinUrl}`
    });

    return res.status(201).json({ interview, employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markSelected = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!["draft", "interviewing"].includes(employee.status)) {
      return res.status(400).json({ message: "Employee is not in a state that can be marked selected" });
    }

    pushHistory(employee, "selected", req.body.note || "Marked as selected after interviews", "hr");
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "employee",
      type: "selected",
      message: "Congratulations! You have been selected. HR will request documents next."
    });

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
