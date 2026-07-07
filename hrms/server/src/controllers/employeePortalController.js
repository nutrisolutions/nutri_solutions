import Employee from "../models/Employee.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import Interview from "../models/Interview.js";
import CompanyDocument from "../models/CompanyDocument.js";
import Task from "../models/Task.js";
import LeaveRequest from "../models/LeaveRequest.js";
import CalendarEvent from "../models/CalendarEvent.js";
import Attendance from "../models/Attendance.js";
import Timesheet from "../models/Timesheet.js";
import Team from "../models/Team.js";
import Announcement from "../models/Announcement.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import { expireOfferIfNeeded, offerBlockedMessage, OFFER_BLOCKED_STATUSES, SUSPENDED_MESSAGE } from "../utils/offerExpiry.js";
import { ANNUAL_LEAVE_DAYS, approvedTotalsForYear, dayCount } from "../utils/leavePolicy.js";
import { REQUIRED_DAILY_HOURS, hoursBetween, istDateString } from "../utils/attendancePolicy.js";

export const getMe = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (employee.suspended) {
      return res.status(403).json({ message: SUSPENDED_MESSAGE });
    }

    await expireOfferIfNeeded(employee);
    if (OFFER_BLOCKED_STATUSES.includes(employee.status)) {
      return res.status(403).json({ message: offerBlockedMessage(employee.status) });
    }

    const { passwordHash, ...rest } = employee.toObject();
    return res.json({ employee: rest });
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
    const companyDocuments = await CompanyDocument.find({ employee: req.employee.id, sent: true }).sort({
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
      "offerLetterUrl joiningLetterUrl status offerAcceptedAt offerRejectedAt offerRejectionReason joiningDate"
    );
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await expireOfferIfNeeded(employee);
    if (OFFER_BLOCKED_STATUSES.includes(employee.status)) {
      return res.status(403).json({ message: offerBlockedMessage(employee.status) });
    }

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await expireOfferIfNeeded(employee);
    if (employee.status !== "offer_sent") {
      return res.status(400).json({
        message: OFFER_BLOCKED_STATUSES.includes(employee.status)
          ? offerBlockedMessage(employee.status)
          : "No pending offer to accept"
      });
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

export const rejectOffer = async (req, res) => {
  try {
    const reason = (req.body?.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "Please provide a reason for rejecting the offer" });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    await expireOfferIfNeeded(employee);
    if (employee.status !== "offer_sent") {
      return res.status(400).json({
        message: OFFER_BLOCKED_STATUSES.includes(employee.status)
          ? offerBlockedMessage(employee.status)
          : "No pending offer to reject"
      });
    }

    employee.offerRejectedAt = new Date();
    employee.offerRejectionReason = reason;
    employee.status = "offer_rejected";
    employee.statusHistory.push({
      status: "offer_rejected",
      note: `Offer rejected by employee: ${reason}`,
      changedBy: "employee",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "offer_rejected",
      message: `${employee.fullName} rejected the offer: ${reason}`
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

export const listMyLeaveRequests = async (req, res) => {
  try {
    const requests = await LeaveRequest.find({ employee: req.employee.id }).sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyLeaveSummary = async (req, res) => {
  try {
    const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
    const { paidDays, lopDays } = await approvedTotalsForYear(LeaveRequest, req.employee.id, year);
    const remaining = Math.max(ANNUAL_LEAVE_DAYS - paidDays, 0);

    const pendingRequests = await LeaveRequest.find({
      employee: req.employee.id,
      status: "pending",
      startDate: { $gte: new Date(year, 0, 1), $lt: new Date(year + 1, 0, 1) }
    }).select("days");
    const pendingDays = pendingRequests.reduce((sum, r) => sum + r.days, 0);

    return res.json({
      year,
      entitlement: ANNUAL_LEAVE_DAYS,
      approvedPaidDays: paidDays,
      lopDays,
      remaining,
      pendingDays
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createLeaveRequest = async (req, res) => {
  try {
    const { startDate, endDate, halfDay, reason } = req.body;
    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ message: "startDate, endDate, and reason are required" });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "startDate must be before or equal to endDate" });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const days = dayCount(startDate, endDate, Boolean(halfDay));

    const request = await LeaveRequest.create({
      employee: employee._id,
      startDate,
      endDate,
      halfDay: Boolean(halfDay),
      days,
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

export const checkInAttendance = async (req, res) => {
  try {
    const today = istDateString();
    const existing = await Attendance.findOne({ employee: req.employee.id, date: today });
    if (existing) {
      return res.status(400).json({ message: "You have already checked in today" });
    }

    const record = await Attendance.create({
      employee: req.employee.id,
      date: today,
      checkInAt: new Date(),
      status: "open"
    });

    return res.status(201).json({ attendance: record });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyTodayAttendance = async (req, res) => {
  try {
    const today = istDateString();
    const record = await Attendance.findOne({ employee: req.employee.id, date: today });
    if (!record) return res.json({ attendance: null });

    if (record.status === "open") {
      const liveHours = hoursBetween(record.checkInAt, new Date());
      return res.json({
        attendance: record,
        liveHoursWorked: liveHours,
        short: liveHours < REQUIRED_DAILY_HOURS
      });
    }

    return res.json({ attendance: record, liveHoursWorked: record.hoursWorked, short: record.short });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.employee.id }).sort({ date: -1 }).limit(60);
    return res.json({ records });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitMyTimesheet = async (req, res) => {
  try {
    const workUpdate = (req.body?.workUpdate || "").trim();
    if (!workUpdate) {
      return res.status(400).json({ message: "Please describe today's work before submitting" });
    }
    const date = req.body?.date || istDateString();

    const entry = await Timesheet.findOneAndUpdate(
      { employee: req.employee.id, date },
      { workUpdate },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({ entry });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyTimesheet = async (req, res) => {
  try {
    const entries = await Timesheet.find({ employee: req.employee.id }).sort({ date: -1 }).limit(60);
    return res.json({ entries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMyBankDetails = async (req, res) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, branchName } = req.body || {};
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.bankDetails = {
      accountHolderName: (accountHolderName || "").trim(),
      accountNumber: (accountNumber || "").trim(),
      ifscCode: (ifscCode || "").trim().toUpperCase(),
      bankName: (bankName || "").trim(),
      branchName: (branchName || "").trim()
    };
    await employee.save();

    return res.json({ bankDetails: employee.bankDetails });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyResignation = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id).select("resignation status");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ resignation: employee.resignation, status: employee.status });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const submitResignation = async (req, res) => {
  try {
    const reason = (req.body?.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "Please provide a reason for resigning" });
    }
    if (!req.body?.acceptedNotice) {
      return res.status(400).json({ message: "You must accept the notice period terms to submit a resignation" });
    }

    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.resignation?.status === "pending") {
      return res.status(400).json({ message: "You already have a pending resignation request" });
    }

    employee.resignation = {
      status: "pending",
      reason,
      lastWorkingDay: null,
      requestedAt: new Date(),
      reviewedAt: null,
      reviewNote: ""
    };
    employee.statusHistory.push({
      status: employee.status,
      note: `Resignation submitted: ${reason}`,
      changedBy: "employee",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "resignation_submitted",
      message: `${employee.fullName} submitted a resignation request.`
    });

    return res.status(201).json({ resignation: employee.resignation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const withdrawResignation = async (req, res) => {
  try {
    const employee = await Employee.findById(req.employee.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.resignation?.status !== "pending") {
      return res.status(400).json({ message: "No pending resignation request to withdraw" });
    }

    employee.resignation.status = "withdrawn";
    employee.resignation.reviewedAt = new Date();
    employee.statusHistory.push({
      status: employee.status,
      note: "Resignation withdrawn by employee",
      changedBy: "employee",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "hr",
      type: "resignation_withdrawn",
      message: `${employee.fullName} withdrew their resignation request.`
    });

    return res.json({ resignation: employee.resignation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyAnnouncements = async (req, res) => {
  try {
    const myTeam = await Team.findOne({ $or: [{ lead: req.employee.id }, { members: req.employee.id }] }).select("_id");

    const orConditions = [{ audience: "all" }, { audience: "employees", employees: req.employee.id }];
    if (myTeam) orConditions.push({ audience: "team", team: myTeam._id });

    const announcements = await Announcement.find({ $or: orConditions }).sort({ createdAt: -1 }).limit(20);
    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listMyLeadTeams = async (req, res) => {
  try {
    const teams = await Team.find({ lead: req.employee.id }).populate("members", "fullName email onboardingLevel").sort({
      createdAt: -1
    });
    return res.json({ teams });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTeamTask = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });
    if (String(team.lead) !== String(req.employee.id)) {
      return res.status(403).json({ message: "You can only assign tasks within a team you lead" });
    }

    const { assignedTo, title, description, priority, dueDate } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!team.members.some((m) => String(m) === String(assignedTo))) {
      return res.status(400).json({ message: "You can only assign tasks to members of this team" });
    }

    const assignee = await Employee.findById(assignedTo);
    if (!assignee) return res.status(404).json({ message: "Employee not found" });

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      assignedTo: assignee._id,
      assignedBy: req.employee.id,
      assignedByModel: "Employee",
      department: assignee.department || null,
      priority: priority || "medium",
      dueDate: dueDate || null
    });

    await EmployeeNotification.create({
      employee: assignee._id,
      audience: "employee",
      type: "task_assigned",
      message: `New task assigned: "${task.title}"`
    });

    return res.status(201).json({ task });
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
