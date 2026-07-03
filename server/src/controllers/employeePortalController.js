import Employee from "../models/Employee.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import Interview from "../models/Interview.js";
import CompanyDocument from "../models/CompanyDocument.js";
import Task from "../models/Task.js";
import LeaveType from "../models/LeaveType.js";
import LeaveRequest from "../models/LeaveRequest.js";
import CalendarEvent from "../models/CalendarEvent.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select("-passwordHash").populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyDocuments = async (req, res) => {
  try {
    const documents = await EmployeeDocument.find({ employee: req.employee.id }).sort({ createdAt: 1 });
    return res.json({ documents });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ employee: req.employee.id }).sort({ round: 1 });
    return res.json({ interviews });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyCompanyDocuments = async (req, res) => {
  try {
    const companyDocuments = await CompanyDocument.find({ employee: req.employee.id }).sort({
      periodYear: -1,
      periodMonth: -1,
      createdAt: -1
    });
    return res.json({ companyDocuments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadMyDocument = async (req, res) => {
  try {
    const doc = await EmployeeDocument.findOne({ _id: req.params.docId, employee: req.employee.id });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (!["pending", "rejected"].includes(doc.status)) {
      return res.status(400).json({ message: "This document cannot be re-uploaded right now" });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let uploadResult;
    try {
      uploadResult = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `nutri-solutions/employees/${req.employee.id}/documents`,
        filename: req.file.originalname
      });
    } catch (uploadError) {
      return res.status(502).json({ message: `Cloudinary upload failed: ${uploadError.message}` });
    }

    const url = uploadResult.secure_url;
    doc.history.push({ fileUrl: url, status: "uploaded", uploadedAt: new Date() });
    doc.fileUrl = url;
    doc.fileName = req.file.originalname;
    doc.mimeType = req.file.mimetype;
    doc.status = "uploaded";
    doc.uploadedAt = new Date();
    doc.rejectionReason = "";
    await doc.save();

    const employee = await Employee.findById(req.employee.id);
    const docs = await EmployeeDocument.find({ employee: employee._id });
    const allSubmitted = docs.every((d) => d.status === "uploaded" || d.status === "verified");
    if (allSubmitted && employee.status !== "documents_under_review") {
      employee.status = "documents_under_review";
      employee.statusHistory.push({
        status: "documents_under_review",
        note: "All documents submitted",
        changedBy: "employee",
        changedAt: new Date()
      });
      await employee.save();
    }

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "document_uploaded",
      message: `${employee.fullName} uploaded "${doc.label}"`
    });

    return res.json({ document: doc });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select(
      "offerLetterUrl joiningLetterUrl status offerAcceptedAt"
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "offer_sent") {
      return res.status(400).json({ message: "No pending offer to accept" });
    }

    employee.offerAcceptedAt = new Date();
    employee.status = "offer_accepted";
    employee.statusHistory.push({
      status: "offer_accepted",
      note: "Offer accepted by employee",
      changedBy: "employee",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "offer_accepted",
      message: `${employee.fullName} accepted the offer.`
    });

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyNotifications = async (req, res) => {
  try {
    const notifications = await EmployeeNotification.find({ employee: req.employee.id, audience: "employee" }).sort({
      createdAt: -1
    });
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await EmployeeNotification.findOneAndUpdate(
      { _id: req.params.id, employee: req.employee.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    return res.json({ notification });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.employee.id }).sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMyTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["todo", "in_progress", "done"].includes(status)) {
      return res.status(400).json({ message: "status must be 'todo', 'in_progress', or 'done'" });
    }

    const task = await Task.findOne({ _id: req.params.id, assignedTo: req.employee.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    task.completedAt = status === "done" ? new Date() : null;
    await task.save();

    if (status === "done") {
      await EmployeeNotification.create({
        employee: req.employee.id,
        audience: "hr",
        type: "task_completed",
        message: `Task "${task.title}" was marked done.`
      });
    }

    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listLeaveTypesForEmployee = async (_req, res) => {
  try {
    const leaveTypes = await LeaveType.find().sort({ name: 1 });
    return res.json({ leaveTypes });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const dayCount = (start, end, halfDay) => {
  const ms = new Date(end) - new Date(start);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return halfDay ? Math.max(days - 0.5, 0.5) : days;
};

export const listMyLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ employee: req.employee.id })
      .populate("leaveType", "name")
      .sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, halfDay, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: "leaveType, startDate, endDate, and reason are required" });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before or equal to endDate" });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const requestedDays = dayCount(startDate, endDate, Boolean(halfDay));
    let balance = employee.leaveBalances?.get(String(leaveType));
    if (balance === undefined) {
      const leaveTypeDoc = await LeaveType.findById(leaveType);
      if (!leaveTypeDoc) {
        return res.status(400).json({ message: "Leave type not found" });
      }
      balance = leaveTypeDoc.defaultDaysPerYear;
      if (!employee.leaveBalances) employee.leaveBalances = new Map();
      employee.leaveBalances.set(String(leaveType), balance);
      await employee.save();
    }
    if (requestedDays > balance) {
      return res.status(400).json({ message: `Insufficient leave balance (${balance} day(s) remaining)` });
    }

    const request = await LeaveRequest.create({
      employee: employee._id,
      leaveType,
      startDate,
      endDate,
      halfDay: Boolean(halfDay),
      reason: reason.trim()
    });

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "leave_requested",
      message: `${employee.fullName} requested leave from ${startDate} to ${endDate}.`
    });

    return res.status(201).json({ request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelMyLeaveRequest = async (req, res) => {
  try {
    const request = await LeaveRequest.findOne({ _id: req.params.id, employee: req.employee.id });
    if (!request) return res.status(404).json({ message: "Leave request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be cancelled" });
    }

    request.status = "cancelled";
    await request.save();

    return res.json({ request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listCalendarEventsForEmployee = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }
    const events = await CalendarEvent.find(filter).sort({ date: 1 }).select("date type title description");
    return res.json({ events });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
