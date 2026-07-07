import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import EmployeeDocument from "../models/EmployeeDocument.js";
import EmployeeNotification from "../models/EmployeeNotification.js";
import Interview from "../models/Interview.js";
import CompanyDocument from "../models/CompanyDocument.js";
import { generateTempPassword } from "../utils/tempPassword.js";
import { generateEmployeeCode } from "../utils/employeeCode.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";
import {
  generateAppraisalLetterBuffer,
  generateJoiningLetterBuffer,
  generateOfferLetterBuffer,
  generatePayslipBuffer
} from "../services/letterGenerator.js";

const pushHistory = (employee, status, note, changedBy) => {
  employee.status = status;
  employee.statusHistory.push({ status, note, changedBy, changedAt: new Date() });
};

const notify = (employeeId, audience, type, message) =>
  EmployeeNotification.create({ employee: employeeId, audience, type, message });

export const listEmployees = async (req, res) => {
  try {
    const { status, employmentType, department, q } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (employmentType) filter.employmentType = employmentType;
    if (department) filter.department = department;
    if (q) {
      const re = new RegExp(q.trim(), "i");
      filter.$or = [{ fullName: re }, { email: re }];
    }
    const employees = await Employee.find(filter).populate("department", "name").sort({ createdAt: -1 });
    return res.json({ employees });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listResignations = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status
      ? { "resignation.status": status }
      : { "resignation.status": { $in: ["pending", "approved", "rejected", "withdrawn"] } };
    const employees = await Employee.find(filter)
      .populate("department", "name")
      .select("fullName email department position resignation status resignedAt")
      .sort({ "resignation.requestedAt": -1 });
    return res.json({ employees });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    if (req.admin.isHrEmployee && String(req.admin.id) === String(req.params.id)) {
      return res.status(403).json({ message: "You cannot view or manage your own employee record here." });
    }

    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    const documents = await EmployeeDocument.find({ employee: employee._id }).sort({ createdAt: 1 });
    const notifications = await EmployeeNotification.find({ employee: employee._id }).sort({ createdAt: -1 });
    const interviews = await Interview.find({ employee: employee._id }).sort({ round: 1 });
    const companyDocuments = await CompanyDocument.find({ employee: employee._id }).sort({
      periodYear: -1,
      periodMonth: -1,
      createdAt: -1
    });
    return res.json({ employee, documents, notifications, interviews, companyDocuments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const generatePayslip = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.employmentType !== "permanent") {
      return res.status(400).json({ message: "Payslips can only be generated for permanent employees" });
    }

    const { periodMonth, periodYear, lopDays, mode, amount } = req.body;
    const month = Number(periodMonth);
    const year = Number(periodYear);
    if (!month || month < 1 || month > 12 || !year) {
      return res.status(400).json({ message: "periodMonth (1-12) and periodYear are required" });
    }
    const isManual = mode === "manual";
    if (isManual) {
      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ message: "A valid amount is required for manual payslips" });
      }
    } else if (!employee.ctc) {
      return res.status(400).json({ message: "This employee has no CTC on file yet — generate their offer first" });
    }

    const hrAdmin = await Admin.findById(req.admin.id).select("name");
    const details = {
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      department: employee.department?.name || "",
      ctc: employee.ctc,
      mode: isManual ? "manual" : "auto",
      manualAmount: isManual ? Number(amount) : null,
      periodMonth: month,
      periodYear: year,
      lopDays: lopDays ? Number(lopDays) : 0,
      hrName: hrAdmin?.name || "HR Team"
    };

    let buffer;
    try {
      buffer = await generatePayslipBuffer(details);
    } catch (genError) {
      return res.status(500).json({ message: `Failed to generate payslip: ${genError.message}` });
    }

    let upload;
    try {
      upload = await uploadBufferToCloudinary(buffer, {
        folder: `nutri-solutions/employees/${employee._id}/company-documents`,
        filename: `payslip-${year}-${month}-${employee._id}.pdf`
      });
    } catch (uploadError) {
      return res.status(502).json({ message: `Cloudinary upload failed: ${uploadError.message}` });
    }

    const label = `Payslip - ${new Date(year, month - 1).toLocaleString(undefined, { month: "long" })} ${year}`;
    const companyDocument = await CompanyDocument.create({
      employee: employee._id,
      type: "payslip",
      label,
      fileUrl: upload.secure_url,
      periodMonth: month,
      periodYear: year,
      uploadedBy: req.admin.id,
      metadata: { mode: details.mode, amount: details.manualAmount, lopDays: details.lopDays }
    });

    return res.status(201).json({ companyDocument });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const generateAppraisal = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.employmentType !== "permanent") {
      return res.status(400).json({ message: "Appraisal letters can only be generated for permanent employees" });
    }

    const { newCtc, effectiveDate, remarks } = req.body;
    if (!newCtc?.trim() || !effectiveDate) {
      return res.status(400).json({ message: "newCtc and effectiveDate are required" });
    }

    const hrAdmin = await Admin.findById(req.admin.id).select("name");
    const details = {
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      department: employee.department?.name || "",
      oldCtc: employee.ctc,
      newCtc: newCtc.trim(),
      effectiveDate: new Date(effectiveDate),
      remarks: remarks?.trim() || "",
      hrName: hrAdmin?.name || "HR Team",
      appraisalDate: new Date()
    };

    let buffer;
    try {
      buffer = await generateAppraisalLetterBuffer(details);
    } catch (genError) {
      return res.status(500).json({ message: `Failed to generate appraisal letter: ${genError.message}` });
    }

    let upload;
    try {
      upload = await uploadBufferToCloudinary(buffer, {
        folder: `nutri-solutions/employees/${employee._id}/company-documents`,
        filename: `appraisal-${employee._id}-${Date.now()}.pdf`
      });
    } catch (uploadError) {
      return res.status(502).json({ message: `Cloudinary upload failed: ${uploadError.message}` });
    }

    const label = `Appraisal Letter - ${details.effectiveDate.toLocaleDateString(undefined, { year: "numeric", month: "long" })}`;
    const companyDocument = await CompanyDocument.create({
      employee: employee._id,
      type: "appraisal_letter",
      label,
      fileUrl: upload.secure_url,
      uploadedBy: req.admin.id,
      metadata: { newCtc: newCtc.trim() }
    });

    return res.status(201).json({ companyDocument, employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const fullName = req.body.fullName?.trim();
    const email = req.body.email?.trim().toLowerCase();
    if (!fullName || !email) {
      return res.status(400).json({ message: "fullName and email are required" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) return res.status(409).json({ message: "An employee with this email already exists" });

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const employee = await Employee.create({
      fullName,
      email,
      phone: req.body.phone?.trim() || "",
      passwordHash,
      mustSetPassword: false,
      department: req.body.department || null,
      position: req.body.position?.trim() || "",
      statusHistory: [{ status: "draft", note: "Created manually by HR", changedBy: "hr" }]
    });

    return res.status(201).json({ employee, tempPassword });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "Employee already exists" });
    return res.status(500).json({ message: error.message });
  }
};

export const resetEmployeePassword = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const tempPassword = generateTempPassword();
    employee.passwordHash = await bcrypt.hash(tempPassword, 10);
    // Only permanent employees are allowed to set their own password (see employeeSetPassword);
    // temporary employees just keep using whichever temp password HR issues them.
    employee.mustSetPassword = employee.employmentType === "permanent";
    await employee.save();

    return res.json({ ok: true, tempPassword });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const requestDocuments = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "selected") {
      return res.status(400).json({ message: "Mark the candidate as selected before requesting documents" });
    }

    const labels = Array.isArray(req.body.labels) ? req.body.labels : [];
    const cleaned = labels.map((l) => String(l).trim()).filter(Boolean);
    if (!cleaned.length) return res.status(400).json({ message: "At least one document label is required" });

    const created = [];
    for (const label of cleaned) {
      const labelKey = label.toLowerCase();
      const exists = await EmployeeDocument.findOne({ employee: employee._id, labelKey });
      if (exists) continue;
      created.push(await EmployeeDocument.create({ employee: employee._id, label, labelKey }));
    }

    pushHistory(employee, "documents_requested", `Requested ${created.length} document(s)`, "hr");
    await employee.save();

    await notify(employee._id, "employee", "document_requested", "New documents have been requested. Please upload them.");

    return res.status(201).json({ documents: created });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const recomputeDocumentAggregateStatus = async (employee) => {
  const docs = await EmployeeDocument.find({ employee: employee._id });
  if (!docs.length) return;

  const anyRejected = docs.some((d) => d.status === "rejected");
  const allVerified = docs.every((d) => d.status === "verified");
  const allSubmitted = docs.every((d) => d.status === "uploaded" || d.status === "verified");

  if (anyRejected) {
    if (employee.status !== "documents_rejected") {
      pushHistory(employee, "documents_rejected", "A document was rejected", "hr");
    }
  } else if (allVerified) {
    if (employee.status !== "documents_verified") {
      pushHistory(employee, "documents_verified", "All documents verified", "hr");
    }
  } else if (allSubmitted) {
    if (employee.status !== "documents_under_review") {
      pushHistory(employee, "documents_under_review", "All documents submitted", "employee");
    }
  }
  await employee.save();
};

export const reviewDocument = async (req, res) => {
  try {
    const { employeeId, docId } = req.params;
    const { decision, rejectionReason } = req.body;
    if (!["verified", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'verified' or 'rejected'" });
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const doc = await EmployeeDocument.findOne({ _id: docId, employee: employeeId });
    if (!doc) return res.status(404).json({ message: "Document not found" });

    doc.status = decision;
    doc.reviewedAt = new Date();
    doc.rejectionReason = decision === "rejected" ? rejectionReason || "" : "";
    await doc.save();

    await recomputeDocumentAggregateStatus(employee);

    await notify(
      employee._id,
      "employee",
      decision === "verified" ? "document_verified" : "document_rejected",
      decision === "verified"
        ? `Your document "${doc.label}" was verified.`
        : `Your document "${doc.label}" was rejected: ${doc.rejectionReason || "no reason given"}. Please re-upload.`
    );

    return res.json({ document: doc, employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const generateOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate("department", "name");
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!["documents_verified", "offer_rejected", "offer_expired"].includes(employee.status)) {
      return res.status(400).json({ message: "All documents must be verified before sending an offer" });
    }

    const { position, ctc, workLocation, joiningDate, probationMonths, reportingManagerName } = req.body;
    if (!position?.trim() || !ctc?.trim() || !workLocation?.trim() || !joiningDate) {
      return res.status(400).json({ message: "position, ctc, workLocation, and joiningDate are required" });
    }

    employee.position = position.trim();
    employee.ctc = ctc.trim();
    employee.workLocation = workLocation.trim();
    employee.joiningDate = new Date(joiningDate);
    employee.probationMonths = probationMonths ? Number(probationMonths) : null;
    employee.reportingManagerName = reportingManagerName?.trim() || "";
    if (!employee.employeeCode) {
      employee.employeeCode = generateEmployeeCode();
    }

    const hrAdmin = await Admin.findById(req.admin.id).select("name");

    const letterDetails = {
      fullName: employee.fullName,
      employeeCode: employee.employeeCode,
      position: employee.position,
      department: employee.department?.name || "",
      ctc: employee.ctc,
      workLocation: employee.workLocation,
      joiningDate: employee.joiningDate,
      probationMonths: employee.probationMonths,
      reportingManagerName: employee.reportingManagerName,
      hrName: hrAdmin?.name || "HR Team",
      offerDate: new Date()
    };

    let offerBuffer;
    let joiningBuffer;
    try {
      [offerBuffer, joiningBuffer] = await Promise.all([
        generateOfferLetterBuffer(letterDetails),
        generateJoiningLetterBuffer(letterDetails)
      ]);
    } catch (genError) {
      return res.status(500).json({ message: `Failed to generate letters: ${genError.message}` });
    }

    let offerUpload;
    let joiningUpload;
    try {
      [offerUpload, joiningUpload] = await Promise.all([
        uploadBufferToCloudinary(offerBuffer, {
          folder: `nutri-solutions/employees/${employee._id}/offer`,
          filename: `offer-letter-${employee._id}.pdf`
        }),
        uploadBufferToCloudinary(joiningBuffer, {
          folder: `nutri-solutions/employees/${employee._id}/offer`,
          filename: `joining-letter-${employee._id}.pdf`
        })
      ]);
    } catch (uploadError) {
      return res.status(502).json({ message: `Cloudinary upload failed: ${uploadError.message}` });
    }

    employee.offerLetterDraftUrl = offerUpload.secure_url;
    employee.joiningLetterDraftUrl = joiningUpload.secure_url;
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendOffer = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (!employee.offerLetterDraftUrl || !employee.joiningLetterDraftUrl) {
      return res.status(400).json({ message: "Generate the offer and joining letter before sending" });
    }

    employee.offerLetterUrl = employee.offerLetterDraftUrl;
    employee.joiningLetterUrl = employee.joiningLetterDraftUrl;
    employee.offerLetterDraftUrl = "";
    employee.joiningLetterDraftUrl = "";
    employee.offerAcceptedAt = null;
    employee.offerRejectedAt = null;
    employee.offerRejectionReason = "";
    pushHistory(employee, "offer_sent", "Offer and joining letter sent", "hr");
    await employee.save();

    await notify(employee._id, "employee", "offer_sent", "Your offer letter and joining letter are ready to review.");

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendCompanyDocument = async (req, res) => {
  try {
    const { employeeId, docId } = req.params;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const doc = await CompanyDocument.findOne({ _id: docId, employee: employeeId });
    if (!doc) return res.status(404).json({ message: "Document not found" });
    if (doc.sent) return res.status(400).json({ message: "This document has already been sent" });

    if (doc.type === "appraisal_letter" && doc.metadata?.newCtc) {
      employee.ctc = doc.metadata.newCtc;
      await employee.save();
    }

    doc.sent = true;
    doc.sentAt = new Date();
    await doc.save();

    await notify(
      employee._id,
      "employee",
      doc.type === "payslip" ? "payslip_added" : "appraisal_letter_added",
      `Your ${doc.label} is now available in Documents.`
    );

    return res.json({ companyDocument: doc, employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const startOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "offer_accepted") {
      return res.status(400).json({ message: "Employee must accept the offer before onboarding starts" });
    }

    const items = Array.isArray(req.body.checklist) ? req.body.checklist : [];
    employee.onboardingChecklist = items.map((label) => ({ label: String(label).trim(), completed: false }));
    pushHistory(employee, "onboarding", "Onboarding started", "hr");
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOnboardingItem = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const index = Number(req.params.itemIndex);
    const item = employee.onboardingChecklist[index];
    if (!item) return res.status(404).json({ message: "Checklist item not found" });

    item.completed = Boolean(req.body.completed);
    item.completedAt = item.completed ? new Date() : null;
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "onboarding") {
      return res.status(400).json({ message: "Employee is not currently onboarding" });
    }
    if (!employee.onboardingChecklist.every((i) => i.completed)) {
      return res.status(400).json({ message: "All onboarding checklist items must be completed first" });
    }

    pushHistory(employee, "onboarding_completed", "Onboarding completed", "hr");
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setTeamLead = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.employmentType !== "permanent") {
      return res.status(400).json({ message: "Only permanent employees can be marked as Team Lead" });
    }

    employee.isTeamLead = Boolean(req.body.isTeamLead);
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setOnboardingLevel = async (req, res) => {
  try {
    const level = Number(req.body.level);
    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: "level must be 1, 2, or 3" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.employmentType !== "permanent") {
      return res.status(400).json({ message: "Only permanent employees have a Level" });
    }

    const previousLevel = employee.onboardingLevel;
    employee.onboardingLevel = level;
    if (previousLevel !== level) {
      pushHistory(employee, employee.status, `Moved to Level ${level}`, "hr");
    }
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const convertToPermanent = async (req, res) => {
  try {
    const level = Number(req.body.level);
    if (![1, 2, 3].includes(level)) {
      return res.status(400).json({ message: "Please select the Level (1, 2, or 3) this employee starts at" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status !== "onboarding_completed") {
      return res.status(400).json({ message: "Onboarding must be completed before converting to permanent" });
    }

    employee.employmentType = "permanent";
    employee.mustSetPassword = true;
    employee.onboardingLevel = level;
    pushHistory(employee, "permanent", `Converted to permanent employee at Level ${level}`, "hr");

    await employee.save();

    await notify(employee._id, "employee", "converted_permanent", "Congratulations! You are now a permanent employee.");

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setSuspended = async (req, res) => {
  try {
    const { suspended } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.suspended = Boolean(suspended);
    employee.suspendedAt = employee.suspended ? new Date() : null;
    employee.statusHistory.push({
      status: employee.status,
      note: employee.suspended ? "Employee suspended by HR" : "Employee unsuspended by HR",
      changedBy: "hr",
      changedAt: new Date()
    });
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setWorkEmail = async (req, res) => {
  try {
    const workEmail = (req.body?.workEmail || "").trim().toLowerCase();
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    employee.workEmail = workEmail;
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const MIN_NOTICE_DAYS = 30;

export const reviewResignation = async (req, res) => {
  try {
    const { decision, reviewNote, lastWorkingDay } = req.body;
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "decision must be 'approved' or 'rejected'" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.resignation?.status !== "pending") {
      return res.status(400).json({ message: "This employee has no pending resignation request" });
    }

    if (decision === "approved") {
      if (!lastWorkingDay) {
        return res.status(400).json({ message: "Please set the employee's last working day" });
      }
      const minLastDay = new Date();
      minLastDay.setDate(minLastDay.getDate() + MIN_NOTICE_DAYS);
      minLastDay.setHours(0, 0, 0, 0);
      if (new Date(lastWorkingDay) < minLastDay) {
        return res.status(400).json({ message: `Last working day must be at least ${MIN_NOTICE_DAYS} days out (1 month notice period)` });
      }
      employee.resignation.lastWorkingDay = lastWorkingDay;
    }

    employee.resignation.status = decision;
    employee.resignation.reviewedAt = new Date();
    employee.resignation.reviewNote = (reviewNote || "").trim();

    employee.statusHistory.push({
      status: employee.status,
      note:
        decision === "approved"
          ? `Resignation approved by HR — last working day set to ${new Date(lastWorkingDay).toLocaleDateString()}`
          : `Resignation rejected by HR${reviewNote ? `: ${reviewNote}` : ""}`,
      changedBy: "hr",
      changedAt: new Date()
    });
    await employee.save();

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "employee",
      type: "resignation_reviewed",
      message:
        decision === "approved"
          ? `Your resignation has been approved. Your last working day is ${new Date(lastWorkingDay).toLocaleDateString()}. Access will end automatically after that date.`
          : `Your resignation request was rejected${reviewNote ? `: ${reviewNote}` : ""}.`
    });

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const terminateEmployee = async (req, res) => {
  try {
    const reason = (req.body?.reason || "").trim();
    if (!reason) {
      return res.status(400).json({ message: "Please provide a reason for termination" });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    if (employee.status === "terminated") {
      return res.status(400).json({ message: "This employee is already terminated" });
    }

    employee.status = "terminated";
    employee.terminatedAt = new Date();
    employee.terminationReason = reason;
    employee.statusHistory.push({
      status: "terminated",
      note: `Terminated by HR: ${reason}`,
      changedBy: "hr",
      changedAt: new Date()
    });
    await employee.save();

    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    await EmployeeDocument.deleteMany({ employee: employee._id });
    await EmployeeNotification.deleteMany({ employee: employee._id });
    await Interview.deleteMany({ employee: employee._id });
    await CompanyDocument.deleteMany({ employee: employee._id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
