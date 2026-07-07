import LeaveRequest from "../models/LeaveRequest.js";
import Employee from "../models/Employee.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import { ANNUAL_LEAVE_DAYS, approvedTotalsForYear } from "../utils/leavePolicy.js";

export const listLeaveRequests = async (req, res) => {
  try {
    const { status, employee } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    if (req.admin.role === "manager") {
      const teamIds = await Employee.find({ manager: req.admin.id }).distinct("_id");
      filter.employee = filter.employee ? filter.employee : { $in: teamIds };
    }

    const requests = await LeaveRequest.find(filter)
      .populate("employee", "fullName email department")
      .sort({ createdAt: -1 });
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const reviewLeaveRequest = async (req, res) => {
  try {
    const { decision, reviewNote } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const request = await LeaveRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Leave request not found" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Only pending requests can be reviewed" });
    }

    let lopMessage = "";
    if (decision === "approved") {
      const employee = await Employee.findById(request.employee);
      if (!employee) return res.status(404).json({ message: "Employee not found" });

      const year = new Date(request.startDate).getFullYear();
      const { paidDays: alreadyPaid } = await approvedTotalsForYear(LeaveRequest, employee._id, year, request._id);
      const remaining = Math.max(ANNUAL_LEAVE_DAYS - alreadyPaid, 0);
      const lopDays = Math.max(request.days - remaining, 0);

      request.lopDays = lopDays;
      if (lopDays > 0) {
        lopMessage = ` (${lopDays} day(s) as loss of pay — annual leave balance exhausted)`;
      }
    }

    request.status = decision;
    request.reviewedBy = req.admin.id;
    request.reviewedAt = new Date();
    request.reviewNote = reviewNote || "";
    await request.save();

    await EmployeeNotification.create({
      employee: request.employee,
      audience: "employee",
      type: decision === "approved" ? "leave_approved" : "leave_rejected",
      message:
        decision === "approved"
          ? `Your leave request was approved${lopMessage}.`
          : `Your leave request was rejected: ${reviewNote || "no reason given"}`
    });

    return res.json({ request });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
