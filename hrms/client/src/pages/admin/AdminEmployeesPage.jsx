import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Key,
  Landmark,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  User,
  UserCheck,
  UserMinus
} from "lucide-react";
import { adminDepartments, adminEmployees } from "../../lib/api";
import DatePicker from "../../components/ui/DatePicker";
import TimePicker from "../../components/ui/TimePicker";
import {
  appraisalDetailsSchema,
  createEmployeeSchema,
  interviewSchema,
  offerDetailsSchema,
  payslipDetailsSchema,
  requestDocumentsSchema
} from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import { onlyDigits } from "../../lib/phoneInput";
import Modal from "../../components/ui/Modal";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import {
  DOC_STATUS_META,
  INTERVIEW_STATUS_META,
  STATUS_LABELS,
  STATUS_TO_STEP,
  STEPPER_STEPS,
  formatDate,
  initials
} from "../../lib/employeeStatus";

const emptyCreateForm = { fullName: "", email: "", phone: "", department: "", position: "" };
const DEFAULT_ONBOARDING_CHECKLIST = [
  'Duly filled "New Joiner Data" and EPF Form 11',
  "Photo",
  "Aadhar",
  "PAN Card",
  "Highest to lowest degree or certificate (all academic and technical/professional)"
];
const emptyInterviewForm = { round: 1, date: "", time: "", durationMinutes: 30 };
const now = new Date();
const emptyPayslipForm = { periodMonth: now.getMonth() + 1, periodYear: now.getFullYear(), lopDays: "", mode: "auto", amount: "" };
const emptyAppraisalForm = { newCtc: "", effectiveDate: "", remarks: "" };
const emptyOfferForm = { position: "", ctc: "", workLocation: "", joiningDate: "", probationMonths: "", reportingManagerName: "" };

const AdminEmployeesPage = () => {
  const { employee: viewerEmployee, isHr } = useEmployeeAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [showAllCompanyDocs, setShowAllCompanyDocs] = useState(false);
  const [payslipForm, setPayslipForm] = useState(emptyPayslipForm);
  const [appraisalForm, setAppraisalForm] = useState(emptyAppraisalForm);
  const [generatingPayslip, setGeneratingPayslip] = useState(false);
  const [generatingAppraisal, setGeneratingAppraisal] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [approvingResignation, setApprovingResignation] = useState(false);
  const [editingWorkEmail, setEditingWorkEmail] = useState(false);
  const [workEmailInput, setWorkEmailInput] = useState("");
  const [savingWorkEmail, setSavingWorkEmail] = useState(false);
  const [resignationLastWorkingDay, setResignationLastWorkingDay] = useState("");
  const [newDocLabel, setNewDocLabel] = useState("");
  const [rejectReasonFor, setRejectReasonFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [offerForm, setOfferForm] = useState(emptyOfferForm);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);
  const [sendingDocId, setSendingDocId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [createdTempPassword, setCreatedTempPassword] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emps, depts] = await Promise.all([adminEmployees.list(), adminDepartments.list()]);
      setEmployees(emps);
      setDepartments(depts);
    } catch {
      setMessage("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const targetId = searchParams.get("employeeId");
    if (!targetId || employees.length === 0) return;
    const match = employees.find((e) => e._id === targetId);
    if (match) openDetail(match);
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, employees]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.fullName?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q));
  }, [employees, search]);

  const openDetail = async (employee) => {
    if (isHr && viewerEmployee && employee._id === viewerEmployee._id) {
      setMessage("You cannot view or manage your own employee record here.");
      return;
    }
    setView("detail");
    setMessage("");
    setTempPasswordInfo(null);
    try {
      const data = await adminEmployees.get(employee._id);
      setSelected(data.employee);
      setDocuments(data.documents);
      setInterviews(data.interviews || []);
      setInterviewForm({ ...emptyInterviewForm, round: (data.interviews?.length || 0) + 1 });
      setCompanyDocuments(data.companyDocuments || []);
      setOfferForm({
        ...emptyOfferForm,
        position: data.employee.position || "",
        ctc: data.employee.ctc || "",
        workLocation: data.employee.workLocation || "",
        joiningDate: data.employee.joiningDate ? data.employee.joiningDate.slice(0, 10) : "",
        probationMonths: data.employee.probationMonths || "",
        reportingManagerName: data.employee.reportingManagerName || ""
      });
    } catch {
      setMessage("Failed to load employee");
    }
  };

  const refreshDetail = async () => {
    if (!selected) return;
    const data = await adminEmployees.get(selected._id);
    setSelected(data.employee);
    setDocuments(data.documents);
    setInterviews(data.interviews || []);
    setCompanyDocuments(data.companyDocuments || []);
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
    setDocuments([]);
    setInterviews([]);
    setCompanyDocuments([]);
    setShowAllCompanyDocs(false);
    setTempPasswordInfo(null);
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    setMessage("");
    setCreatedTempPassword(null);

    const validationError = firstZodError(createEmployeeSchema, createForm);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      const { tempPassword } = await adminEmployees.create(createForm);
      setCreatedTempPassword(tempPassword);
      setCreateForm(emptyCreateForm);
      setShowCreateForm(false);
      setMessage("Employee created. Share the one-time temporary password below with them.");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create employee");
    }
  };

  const handleResetPassword = async () => {
    setMessage("");
    try {
      const { tempPassword } = await adminEmployees.resetPassword(selected._id);
      setTempPasswordInfo(tempPassword);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password");
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(interviewSchema, interviewForm);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await adminEmployees.scheduleInterview(selected._id, interviewForm);
      setMessage("Interview scheduled");
      await refreshDetail();
      setInterviewForm((f) => ({ ...emptyInterviewForm, round: f.round + 1 }));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to schedule interview");
    }
  };

  const handleMarkSelected = async () => {
    setMessage("");
    try {
      await adminEmployees.markSelected(selected._id);
      setMessage("Candidate marked as selected");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to mark as selected");
    }
  };

  const handleRequestDocuments = async (e) => {
    e.preventDefault();
    const labels = newDocLabel
      .split(",")
      .map((l) => l.trim())
      .filter(Boolean);
    setMessage("");

    const validationError = firstZodError(requestDocumentsSchema, { labels });
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await adminEmployees.requestDocuments(selected._id, labels);
      setNewDocLabel("");
      setMessage("Documents requested");
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to request documents");
    }
  };

  const handleReviewDocument = async (docId, decision) => {
    setMessage("");
    try {
      await adminEmployees.reviewDocument(selected._id, docId, decision, decision === "rejected" ? rejectReason : undefined);
      setRejectReasonFor(null);
      setRejectReason("");
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to review document");
    }
  };

  const handleGenerateOffer = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      ...offerForm,
      probationMonths: offerForm.probationMonths ? Number(offerForm.probationMonths) : null
    };
    const validationError = firstZodError(offerDetailsSchema, payload);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setGeneratingOffer(true);
    try {
      const employee = await adminEmployees.generateOffer(selected._id, payload);
      setMessage("Offer and joining letter generated. Review them, then click Send to notify the employee.");
      if (employee.offerLetterDraftUrl) window.open(employee.offerLetterDraftUrl, "_blank", "noopener,noreferrer");
      if (employee.joiningLetterDraftUrl) window.open(employee.joiningLetterDraftUrl, "_blank", "noopener,noreferrer");
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to generate offer");
    } finally {
      setGeneratingOffer(false);
    }
  };

  const handleSendOffer = async () => {
    setMessage("");
    setSendingOffer(true);
    try {
      await adminEmployees.sendOffer(selected._id);
      setMessage("Offer sent to employee");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send offer");
    } finally {
      setSendingOffer(false);
    }
  };

  const handleStartOnboarding = async () => {
    setMessage("");
    try {
      await adminEmployees.startOnboarding(selected._id, DEFAULT_ONBOARDING_CHECKLIST);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start onboarding");
    }
  };

  const handleToggleChecklistItem = async (index, completed) => {
    try {
      await adminEmployees.updateOnboardingItem(selected._id, index, completed);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update checklist item");
    }
  };

  const handleCompleteOnboarding = async () => {
    setMessage("");
    try {
      await adminEmployees.completeOnboarding(selected._id);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to complete onboarding");
    }
  };

  const handleConvertToPermanent = async () => {
    const levelInput = window.prompt("Enter the Level (1, 2, or 3) this employee starts at as a permanent employee:", "1");
    if (levelInput === null) return;
    const level = Number(levelInput);
    if (![1, 2, 3].includes(level)) {
      setMessage("Level must be 1, 2, or 3");
      return;
    }
    setMessage("");
    try {
      await adminEmployees.convertToPermanent(selected._id, level);
      setMessage(`Employee converted to permanent at Level ${level}`);
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to convert to permanent");
    }
  };

  const handleSetOnboardingLevel = async (level) => {
    setMessage("");
    try {
      await adminEmployees.setOnboardingLevel(selected._id, level);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update Level");
    }
  };

  const handleToggleTeamLead = async () => {
    setMessage("");
    try {
      await adminEmployees.setTeamLead(selected._id, !selected.isTeamLead);
      setMessage(selected.isTeamLead ? "Removed Team Lead designation" : "Marked as Team Lead");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update Team Lead status");
    }
  };

  const handleToggleSuspend = async () => {
    const nextSuspended = !selected.suspended;
    if (nextSuspended && !window.confirm("Suspend this employee? They will not be able to log in to the portal.")) return;
    setMessage("");
    try {
      await adminEmployees.setSuspended(selected._id, nextSuspended);
      setMessage(nextSuspended ? "Employee suspended" : "Employee unsuspended");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update suspension status");
    }
  };

  const handleTerminate = async () => {
    const reason = window.prompt("Reason for termination:");
    if (reason === null) return;
    if (!reason.trim()) {
      setMessage("A reason is required to terminate an employee");
      return;
    }
    if (!window.confirm("Terminate this employee? They will immediately lose portal access.")) return;
    setMessage("");
    try {
      await adminEmployees.terminate(selected._id, reason.trim());
      setMessage("Employee terminated");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to terminate employee");
    }
  };

  const handleRejectResignation = async () => {
    const reviewNote = window.prompt("Note for the employee (optional):") || "";
    setMessage("");
    try {
      await adminEmployees.reviewResignation(selected._id, "rejected", { reviewNote });
      setMessage("Resignation rejected");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to review resignation");
    }
  };

  const handleSaveWorkEmail = async (e) => {
    e.preventDefault();
    setMessage("");
    setSavingWorkEmail(true);
    try {
      await adminEmployees.setWorkEmail(selected._id, workEmailInput.trim());
      setMessage("Work email updated");
      setEditingWorkEmail(false);
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update work email");
    } finally {
      setSavingWorkEmail(false);
    }
  };

  const handleApproveResignation = async (e) => {
    e.preventDefault();
    if (!resignationLastWorkingDay) return;
    setMessage("");
    try {
      await adminEmployees.reviewResignation(selected._id, "approved", { lastWorkingDay: resignationLastWorkingDay });
      setMessage("Resignation approved. Access will end automatically on the last working day.");
      setApprovingResignation(false);
      setResignationLastWorkingDay("");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to approve resignation");
    }
  };

  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      periodMonth: Number(payslipForm.periodMonth),
      periodYear: Number(payslipForm.periodYear),
      lopDays: payslipForm.lopDays ? Number(payslipForm.lopDays) : null,
      mode: payslipForm.mode,
      amount: payslipForm.mode === "manual" && payslipForm.amount ? Number(payslipForm.amount) : null
    };
    const validationError = firstZodError(payslipDetailsSchema, payload);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setGeneratingPayslip(true);
    try {
      const companyDocument = await adminEmployees.generatePayslip(selected._id, payload);
      setMessage("Payslip generated. Review it, then click Send to share it with the employee.");
      if (companyDocument?.fileUrl) window.open(companyDocument.fileUrl, "_blank", "noopener,noreferrer");
      setPayslipForm(emptyPayslipForm);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to generate payslip");
    } finally {
      setGeneratingPayslip(false);
    }
  };

  const handleGenerateAppraisal = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(appraisalDetailsSchema, appraisalForm);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setGeneratingAppraisal(true);
    try {
      const { companyDocument } = await adminEmployees.generateAppraisal(selected._id, appraisalForm);
      setMessage("Appraisal letter generated. Review it, then click Send to share it with the employee.");
      if (companyDocument?.fileUrl) window.open(companyDocument.fileUrl, "_blank", "noopener,noreferrer");
      setAppraisalForm(emptyAppraisalForm);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to generate appraisal letter");
    } finally {
      setGeneratingAppraisal(false);
    }
  };

  const handleSendCompanyDocument = async (docId) => {
    setMessage("");
    setSendingDocId(docId);
    try {
      await adminEmployees.sendCompanyDocument(selected._id, docId);
      setMessage("Document sent to employee");
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send document");
    } finally {
      setSendingDocId(null);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          {view !== "list" && (
            <button type="button" className="admin-back-btn" onClick={backToList}>
              <ArrowLeft size={18} /> Back to employees
            </button>
          )}
          <h1>Employees</h1>
          <p>Manage the temporary → permanent employee lifecycle.</p>
        </div>
        {view === "list" && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setCreateForm(emptyCreateForm);
              setCreatedTempPassword(null);
              setShowCreateForm((v) => !v);
            }}
          >
            <Plus size={18} /> New employee
          </button>
        )}
      </header>

      {message && <p className="admin-message">{message}</p>}
      {createdTempPassword && (
        <p className="admin-message">
          One-time temp password (share with the employee now — it will not be shown again):{" "}
          <strong>{createdTempPassword}</strong>
        </p>
      )}

      {view === "list" && (
        <>
          <Modal open={showCreateForm} onClose={() => setShowCreateForm(false)} title="New employee">
            <form className="admin-form-card" onSubmit={handleCreateEmployee}>
              <h2>New employee</h2>
              <div className="admin-form-grid">
                <label>
                  Full name *
                  <input
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Email *
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: onlyDigits(e.target.value) })}
                  />
                </label>
                <label>
                  Position
                  <input value={createForm.position} onChange={(e) => setCreateForm({ ...createForm, position: e.target.value })} />
                </label>
                <label>
                  Department
                  <select
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                  >
                    <option value="">No department</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="admin-form-actions">
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal>

          <div className="admin-projects-toolbar">
            <div className="admin-search">
              <Search size={18} />
              <input type="search" placeholder="Search employees…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? (
            <p>Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-empty">No employees yet. Use "New employee" above, or create one from a job application in Careers.</p>
          ) : (
            <div className="admin-careers-list">
              {filtered.map((emp) => (
                <button key={emp._id} type="button" className="admin-careers-row" onClick={() => openDetail(emp)}>
                  <div className="admin-careers-row-main">
                    <User size={20} />
                    <div>
                      <strong>{emp.fullName}</strong>
                      <span>
                        {emp.email} · {emp.department?.name || "No department"}
                        {isHr && viewerEmployee && emp._id === viewerEmployee._id ? " · (You)" : ""}
                      </span>
                    </div>
                  </div>
                  <div className="admin-careers-row-meta">
                    <span className={emp.employmentType === "permanent" ? "admin-badge admin-badge--ok" : "admin-badge"}>
                      {emp.employmentType}
                    </span>
                    <span className="admin-careers-applications-count">{STATUS_LABELS[emp.status] || emp.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {view === "detail" && selected && (
        <div className="employee-detail">
          <div className="employee-header-card">
            <div className="employee-header-identity">
              <div className="employee-avatar">{initials(selected.fullName) || <User size={22} />}</div>
              <div className="employee-header-text">
                <h2>{selected.fullName}</h2>
                <div className="employee-contact-row">
                  <span>
                    <Mail size={14} /> {selected.email}
                  </span>
                  {selected.phone && (
                    <span>
                      <Phone size={14} /> {selected.phone}
                    </span>
                  )}
                  <span>
                    <Building2 size={14} /> {selected.department?.name || "No department"}
                  </span>
                  {selected.position && (
                    <span>
                      <Briefcase size={14} /> {selected.position}
                    </span>
                  )}
                </div>
                {editingWorkEmail ? (
                  <form
                    onSubmit={handleSaveWorkEmail}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.4rem 0", flexWrap: "wrap" }}
                  >
                    <input
                      type="email"
                      placeholder="work.email@nutrisolutions.com"
                      value={workEmailInput}
                      onChange={(e) => setWorkEmailInput(e.target.value)}
                      style={{
                        minWidth: "220px",
                        padding: "0.5rem 0.75rem",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        font: "inherit"
                      }}
                      autoFocus
                    />
                    <button type="submit" className="btn btn-primary btn-sm" disabled={savingWorkEmail}>
                      Save
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingWorkEmail(false)}>
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="employee-contact-row">
                    <span>
                      <Mail size={14} /> Work email: {selected.workEmail || "Not set"}
                    </span>
                    <button
                      type="button"
                      className="employee-docs-toggle"
                      onClick={() => {
                        setWorkEmailInput(selected.workEmail || "");
                        setEditingWorkEmail(true);
                      }}
                    >
                      {selected.workEmail ? "Edit" : "Set work email"}
                    </button>
                  </div>
                )}
                <div className="employee-status-row">
                  <span className={selected.employmentType === "permanent" ? "admin-badge admin-badge--ok" : "admin-badge"}>
                    {selected.employmentType}
                  </span>
                  {selected.suspended && <span className="admin-badge admin-badge--danger">Suspended</span>}
                  {selected.status === "resigned" && <span className="admin-badge admin-badge--danger">Resigned</span>}
                  {selected.status === "terminated" && <span className="admin-badge admin-badge--danger">Terminated</span>}
                </div>
              </div>
            </div>
            <div className="employee-header-actions">
              <div className="admin-form-actions">
                <button type="button" className="btn btn-outline btn-sm" onClick={handleResetPassword}>
                  <Key size={14} /> Reset password
                </button>
                {(selected.status === "draft" || selected.status === "interviewing") && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleMarkSelected}>
                    <CheckCircle2 size={14} /> Mark as selected
                  </button>
                )}
                {selected.status === "onboarding_completed" && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={handleConvertToPermanent}>
                    <UserCheck size={14} /> Convert to permanent
                  </button>
                )}
                {!["resigned", "terminated"].includes(selected.status) && (
                  <button
                    type="button"
                    className={selected.suspended ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                    onClick={handleToggleSuspend}
                  >
                    <Ban size={14} /> {selected.suspended ? "Unsuspend" : "Suspend"}
                  </button>
                )}
                {!["resigned", "terminated"].includes(selected.status) && (
                  <button type="button" className="btn btn-danger btn-sm" onClick={handleTerminate}>
                    <UserMinus size={14} /> Terminate
                  </button>
                )}
              </div>
              {tempPasswordInfo && (
                <p className="admin-message">
                  One-time temp password (share now, won't be shown again): <strong>{tempPasswordInfo}</strong>
                </p>
              )}
            </div>
          </div>

          {(selected.employmentType === "permanent" || selected.status === "permanent") && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <Landmark size={18} /> Bank account details
                  </h3>
                  <p>Entered by the employee for salary processing.</p>
                </div>
              </div>
              {selected.bankDetails?.accountNumber ? (
                <div className="profile-info-grid">
                  <div className="profile-info-item">
                    <span className="profile-info-item-label">Account holder name</span>
                    <span className="profile-info-item-value">{selected.bankDetails.accountHolderName || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item-label">Bank name</span>
                    <span className="profile-info-item-value">{selected.bankDetails.bankName || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item-label">Account number</span>
                    <span className="profile-info-item-value">{selected.bankDetails.accountNumber || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item-label">IFSC code</span>
                    <span className="profile-info-item-value">{selected.bankDetails.ifscCode || "—"}</span>
                  </div>
                  <div className="profile-info-item">
                    <span className="profile-info-item-label">Branch name</span>
                    <span className="profile-info-item-value">{selected.bankDetails.branchName || "—"}</span>
                  </div>
                </div>
              ) : (
                <p className="admin-empty">Employee hasn't added their bank details yet.</p>
              )}
            </section>
          )}

          {selected.resignation?.status === "pending" && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <UserMinus size={18} /> Resignation request
                  </h3>
                </div>
                <span className="status-pill status-pill--info">Pending review</span>
              </div>
              <p>{selected.resignation.reason}</p>
              {approvingResignation ? (
                <form className="admin-form-card" onSubmit={handleApproveResignation} style={{ marginTop: "0.85rem" }}>
                  <div className="admin-form-grid">
                    <label>
                      Last working day * (min. 1 month notice)
                      <DatePicker value={resignationLastWorkingDay} onChange={setResignationLastWorkingDay} required />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!resignationLastWorkingDay}>
                      <CheckCircle2 size={14} /> Confirm approval
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setApprovingResignation(false);
                        setResignationLastWorkingDay("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="admin-form-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setApprovingResignation(true)}>
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleRejectResignation}>
                    Reject
                  </button>
                </div>
              )}
            </section>
          )}

          {["resigned", "terminated"].includes(selected.status) ? (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <UserMinus size={18} /> Employment ended
                  </h3>
                </div>
              </div>
              {selected.status === "resigned" ? (
                <p>
                  Resigned on {new Date(selected.resignedAt).toLocaleDateString()}
                  {selected.resignation?.reason ? ` — ${selected.resignation.reason}` : ""}
                </p>
              ) : (
                <p>
                  Terminated on {new Date(selected.terminatedAt).toLocaleDateString()} — {selected.terminationReason}
                </p>
              )}
            </section>
          ) : (
          <nav className="employee-stepper" aria-label="Employee lifecycle progress">
            {STEPPER_STEPS.map((step, idx) => {
              const currentIndex = STEPPER_STEPS.findIndex((s) => s.key === STATUS_TO_STEP[selected.status]);
              const isDone = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <Fragment key={step.key}>
                  <div className={`employee-stepper-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
                    <span className="employee-stepper-dot">{isDone ? <CheckCircle2 size={13} /> : idx + 1}</span>
                    <span className="employee-stepper-label">{step.label}</span>
                  </div>
                  {idx < STEPPER_STEPS.length - 1 && (
                    <div className={`employee-stepper-line ${isDone ? "is-done" : ""}`} />
                  )}
                </Fragment>
              );
            })}
          </nav>
          )}

          {!["resigned", "terminated"].includes(selected.status) &&
            (selected.status === "draft" || selected.status === "interviewing" || interviews.length > 0) && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <CalendarClock size={18} /> Interviews
                  </h3>
                  <p>
                    {interviews.length
                      ? `${interviews.length} round(s) scheduled`
                      : "Schedule interview rounds via Jitsi Meet before marking the candidate selected"}
                  </p>
                </div>
              </div>

              {(selected.status === "draft" || selected.status === "interviewing") && (
                <form className="admin-form-card" onSubmit={handleScheduleInterview} style={{ marginBottom: interviews.length ? "1.1rem" : 0 }}>
                  <div className="admin-form-grid">
                    <label>
                      Round
                      <input
                        type="number"
                        min={1}
                        value={interviewForm.round}
                        onChange={(e) => setInterviewForm({ ...interviewForm, round: Number(e.target.value) })}
                      />
                    </label>
                    <label>
                      Date
                      <DatePicker value={interviewForm.date} onChange={(date) => setInterviewForm({ ...interviewForm, date })} />
                    </label>
                    <label>
                      Time
                      <TimePicker value={interviewForm.time} onChange={(time) => setInterviewForm({ ...interviewForm, time })} />
                    </label>
                    <label>
                      Duration (minutes)
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={interviewForm.durationMinutes}
                        onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={14} /> Schedule Jitsi interview
                    </button>
                  </div>
                </form>
              )}

              {interviews.length > 0 && (
                <div className="employee-doc-grid">
                  {interviews.map((iv) => (
                    <div key={iv._id} className="employee-doc-card">
                      <div className="employee-doc-card-head">
                        <strong>
                          <CalendarClock size={15} /> Round {iv.round}
                        </strong>
                        <span className={`status-pill status-pill--${INTERVIEW_STATUS_META[iv.status]?.pill || "neutral"}`}>
                          {INTERVIEW_STATUS_META[iv.status]?.label || iv.status}
                        </span>
                      </div>
                      <p>
                        {formatDate(iv.scheduledAt)} · {iv.durationMinutes} min
                      </p>
                      {iv.joinUrl && (
                        <a className="employee-doc-link" href={iv.joinUrl} target="_blank" rel="noreferrer">
                          Join Jitsi meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <FileText size={18} /> Documents
                </h3>
                <p>{documents.length ? `${documents.length} document(s) tracked for this employee` : "No documents requested yet"}</p>
              </div>
            </div>

            {selected.status === "selected" && (
              <form className="admin-form-card" onSubmit={handleRequestDocuments} style={{ marginBottom: documents.length ? "1.1rem" : 0 }}>
                <label>
                  Request documents (comma separated)
                  <textarea
                    rows={3}
                    value={newDocLabel}
                    onChange={(e) => setNewDocLabel(e.target.value)}
                    placeholder="ID proof, Address proof"
                  />
                </label>
                <div className="admin-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} /> Request
                  </button>
                </div>
              </form>
            )}

            {(selected.status === "draft" || selected.status === "interviewing") && documents.length === 0 && (
              <p className="admin-empty">Mark the candidate as selected after interviews to start requesting documents.</p>
            )}

            {documents.length > 0 && (
              <div className="employee-doc-grid">
                {documents.map((doc) => (
                  <div key={doc._id} className="employee-doc-card">
                    <div className="employee-doc-card-head">
                      <strong>
                        <FileText size={15} /> {doc.label}
                      </strong>
                      <span className={`status-pill status-pill--${DOC_STATUS_META[doc.status]?.pill || "neutral"}`}>
                        {DOC_STATUS_META[doc.status]?.label || doc.status}
                      </span>
                    </div>
                    {doc.status === "rejected" && doc.rejectionReason && (
                      <p className="employee-doc-reason">Reason: {doc.rejectionReason}</p>
                    )}
                    {doc.fileUrl && (
                      <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                        View uploaded file
                      </a>
                    )}
                    {doc.status === "uploaded" && (
                      <div className="employee-doc-actions">
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => handleReviewDocument(doc._id, "verified")}>
                          Verify
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejectReasonFor(doc._id)}>
                          Reject
                        </button>
                      </div>
                    )}
                    {rejectReasonFor === doc._id && (
                      <div className="employee-doc-actions">
                        <input
                          type="text"
                          placeholder="Rejection reason"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => handleReviewDocument(doc._id, "rejected")}>
                          Confirm reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {(["documents_verified", "offer_rejected", "offer_expired"].includes(selected.status) ||
            selected.offerLetterUrl ||
            selected.offerLetterDraftUrl) && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <Briefcase size={18} /> Offer
                  </h3>
                  <p>
                    {selected.status === "offer_rejected"
                      ? "The employee rejected this offer. Generate a new offer below to re-send it."
                      : selected.status === "offer_expired"
                        ? "This offer expired without a response by the joining date. Generate a new offer below to re-send it."
                        : selected.offerLetterUrl
                          ? "Offer and joining letter generated"
                          : "Fill in the details below to generate and send the offer and joining letter"}
                  </p>
                </div>
              </div>

              {selected.status === "offer_rejected" && selected.offerRejectionReason && (
                <p className="admin-message">Rejection reason: {selected.offerRejectionReason}</p>
              )}

              {selected.offerLetterDraftUrl && (
                <div className="admin-form-card" style={{ marginBottom: "1.1rem" }}>
                  <p className="admin-form-warn">Generated but not yet sent — the employee cannot see this until you send it.</p>
                  <div className="admin-form-actions">
                    <a className="btn btn-outline btn-sm" href={selected.offerLetterDraftUrl} target="_blank" rel="noreferrer">
                      Preview offer letter
                    </a>
                    <a className="btn btn-outline btn-sm" href={selected.joiningLetterDraftUrl} target="_blank" rel="noreferrer">
                      Preview joining letter
                    </a>
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleSendOffer} disabled={sendingOffer}>
                      <Send size={14} /> {sendingOffer ? "Sending…" : "Send to employee"}
                    </button>
                  </div>
                </div>
              )}

              {selected.offerLetterUrl && (
                <div className="admin-form-actions" style={{ marginBottom: "1.1rem" }}>
                  <a className="btn btn-outline btn-sm" href={selected.offerLetterUrl} target="_blank" rel="noreferrer">
                    View offer letter
                  </a>
                  <a className="btn btn-outline btn-sm" href={selected.joiningLetterUrl} target="_blank" rel="noreferrer">
                    View joining letter
                  </a>
                </div>
              )}

              {["documents_verified", "offer_rejected", "offer_expired"].includes(selected.status) && (
                <form className="admin-form-card" onSubmit={handleGenerateOffer} style={{ marginBottom: 0 }}>
                  <div className="admin-form-grid">
                    <label>
                      Position *
                      <input
                        value={offerForm.position}
                        onChange={(e) => setOfferForm({ ...offerForm, position: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Annual CTC *
                      <input
                        placeholder="e.g. 8,00,000"
                        value={offerForm.ctc}
                        onChange={(e) => setOfferForm({ ...offerForm, ctc: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Work location *
                      <input
                        value={offerForm.workLocation}
                        onChange={(e) => setOfferForm({ ...offerForm, workLocation: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Joining date *
                      <DatePicker
                        value={offerForm.joiningDate}
                        onChange={(joiningDate) => setOfferForm({ ...offerForm, joiningDate })}
                        required
                      />
                    </label>
                    <label>
                      Probation (months)
                      <input
                        type="number"
                        min={0}
                        max={24}
                        value={offerForm.probationMonths}
                        onChange={(e) => setOfferForm({ ...offerForm, probationMonths: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={generatingOffer}>
                      <Send size={14} />{" "}
                      {generatingOffer
                        ? "Generating…"
                        : ["offer_rejected", "offer_expired"].includes(selected.status)
                          ? "Regenerate offer"
                          : "Generate offer"}
                    </button>
                  </div>
                </form>
              )}
            </section>
          )}

          {(selected.status === "offer_accepted" ||
            selected.status === "onboarding" ||
            selected.status === "onboarding_completed") && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <CheckCircle2 size={18} /> Onboarding
                  </h3>
                  <p>
                    {selected.onboardingChecklist?.length
                      ? `${selected.onboardingChecklist.filter((i) => i.completed).length}/${selected.onboardingChecklist.length} checklist items complete`
                      : "Define a checklist to start onboarding"}
                  </p>
                </div>
              </div>

              {selected.status === "offer_accepted" && (
                <div className="admin-form-card">
                  <p>Every employee onboards with this standard checklist:</p>
                  <ul className="employee-checklist-preview">
                    {DEFAULT_ONBOARDING_CHECKLIST.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className="admin-form-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={handleStartOnboarding}>
                      Start onboarding
                    </button>
                  </div>
                </div>
              )}

              {selected.onboardingChecklist?.length > 0 && (
                <div className="employee-checklist" style={{ marginTop: selected.status === "offer_accepted" ? "1.1rem" : 0 }}>
                  {selected.onboardingChecklist.map((item, idx) => (
                    <label key={idx} className={`employee-checklist-item ${item.completed ? "is-done" : ""}`}>
                      <input
                        type="checkbox"
                        checked={item.completed}
                        disabled={selected.status !== "onboarding"}
                        onChange={(e) => handleToggleChecklistItem(idx, e.target.checked)}
                      />
                      {item.label}
                    </label>
                  ))}
                  {selected.status === "onboarding" && (
                    <div className="admin-form-actions">
                      <button type="button" className="btn btn-primary btn-sm" onClick={handleCompleteOnboarding}>
                        Complete onboarding
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {selected.employmentType === "permanent" && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <CheckCircle2 size={18} /> Level
                  </h3>
                  <p>{selected.onboardingLevel ? `Currently at Level ${selected.onboardingLevel}` : "No level set yet"}</p>
                </div>
              </div>
              <div className="admin-form-actions" style={{ marginBottom: "1.1rem" }}>
                {[1, 2, 3].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={selected.onboardingLevel === level ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                    onClick={() => handleSetOnboardingLevel(level)}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
              <div className="admin-form-actions">
                <button
                  type="button"
                  className={selected.isTeamLead ? "btn btn-primary btn-sm" : "btn btn-outline btn-sm"}
                  onClick={handleToggleTeamLead}
                >
                  <UserCheck size={14} /> {selected.isTeamLead ? "Team Lead" : "Mark as Team Lead"}
                </button>
              </div>
            </section>
          )}

          {selected.employmentType === "permanent" && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <FileText size={18} /> Company documents
                  </h3>
                  <p>Generate payslips and appraisal letters — no file upload, HR just fills in the details.</p>
                </div>
              </div>

              <div className="admin-form-grid" style={{ marginBottom: "1.1rem" }}>
                <form className="admin-form-card" onSubmit={handleGeneratePayslip} style={{ marginBottom: 0 }}>
                  <h4>Generate payslip</h4>
                  <div className="admin-toggle-group" role="group" aria-label="Payslip amount mode">
                    <button
                      type="button"
                      className={`admin-toggle-btn ${payslipForm.mode === "auto" ? "is-active" : ""}`}
                      onClick={() => setPayslipForm({ ...payslipForm, mode: "auto" })}
                    >
                      Auto
                    </button>
                    <button
                      type="button"
                      className={`admin-toggle-btn ${payslipForm.mode === "manual" ? "is-active" : ""}`}
                      onClick={() => setPayslipForm({ ...payslipForm, mode: "manual" })}
                    >
                      Manual
                    </button>
                  </div>
                  <div className="admin-form-grid">
                    <label>
                      Month
                      <select
                        value={payslipForm.periodMonth}
                        onChange={(e) => setPayslipForm({ ...payslipForm, periodMonth: e.target.value })}
                      >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                          <option key={m} value={m}>
                            {new Date(2000, m - 1).toLocaleString(undefined, { month: "long" })}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Year
                      <input
                        type="number"
                        value={payslipForm.periodYear}
                        onChange={(e) => setPayslipForm({ ...payslipForm, periodYear: e.target.value })}
                      />
                    </label>
                    {payslipForm.mode === "manual" && (
                      <label>
                        Amount (monthly gross) *
                        <input
                          type="number"
                          min={1}
                          placeholder="e.g. 50000"
                          value={payslipForm.amount}
                          onChange={(e) => setPayslipForm({ ...payslipForm, amount: e.target.value })}
                          required
                        />
                      </label>
                    )}
                    <label>
                      Loss of pay (days)
                      <input
                        type="number"
                        min={0}
                        max={31}
                        value={payslipForm.lopDays}
                        onChange={(e) => setPayslipForm({ ...payslipForm, lopDays: e.target.value })}
                        placeholder="0"
                      />
                    </label>
                  </div>
                  {payslipForm.mode === "manual" && (
                    <p className="admin-form-warn">
                      The entered amount will be split into Basic, HRA, and other components using the standard ratios, and the
                      loss-of-pay days will be deducted from that amount.
                    </p>
                  )}
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={generatingPayslip}>
                      <Send size={14} /> {generatingPayslip ? "Generating…" : "Generate payslip"}
                    </button>
                  </div>
                </form>

                <form className="admin-form-card" onSubmit={handleGenerateAppraisal} style={{ marginBottom: 0 }}>
                  <h4>Generate appraisal letter</h4>
                  <div className="admin-form-grid">
                    <label>
                      New CTC (per annum)
                      <input
                        placeholder="e.g. 6,50,000"
                        value={appraisalForm.newCtc}
                        onChange={(e) => setAppraisalForm({ ...appraisalForm, newCtc: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Effective date
                      <DatePicker
                        value={appraisalForm.effectiveDate}
                        onChange={(effectiveDate) => setAppraisalForm({ ...appraisalForm, effectiveDate })}
                        required
                      />
                    </label>
                    <label className="admin-form-full">
                      Remarks (optional)
                      <textarea
                        rows={2}
                        value={appraisalForm.remarks}
                        onChange={(e) => setAppraisalForm({ ...appraisalForm, remarks: e.target.value })}
                      />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={generatingAppraisal}>
                      <Send size={14} /> {generatingAppraisal ? "Generating…" : "Generate appraisal letter"}
                    </button>
                  </div>
                </form>
              </div>

              {companyDocuments.length > 0 && (
                <>
                  <div className="employee-docs-toolbar">
                    <h4>
                      Generated documents
                      <span>({companyDocuments.length})</span>
                    </h4>
                    {companyDocuments.length > 3 && (
                      <button
                        type="button"
                        className="employee-docs-toggle"
                        onClick={() => setShowAllCompanyDocs((v) => !v)}
                      >
                        {showAllCompanyDocs ? "Show less" : `View all ${companyDocuments.length}`}
                      </button>
                    )}
                  </div>
                  <div className="employee-doc-grid">
                    {(showAllCompanyDocs ? companyDocuments : companyDocuments.slice(0, 3)).map((doc) => (
                      <div key={doc._id} className="employee-doc-card">
                        <div className="employee-doc-card-head">
                          <strong>
                            <FileText size={15} /> {doc.label}
                          </strong>
                          <span className={`admin-badge ${doc.sent ? "admin-badge--ok" : ""}`}>
                            {doc.sent ? "Sent" : "Draft"}
                          </span>
                        </div>
                        <p className="employee-doc-reason">{doc.type === "payslip" ? "Payslip" : "Appraisal letter"}</p>
                        <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                          {doc.sent ? "View file" : "Preview file"}
                        </a>
                        {!doc.sent && (
                          <div className="admin-form-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSendCompanyDocument(doc._id)}
                              disabled={sendingDocId === doc._id}
                            >
                              <Send size={14} /> {sendingDocId === doc._id ? "Sending…" : "Send to employee"}
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          )}

        </div>
      )}
    </div>
  );
};

export default AdminEmployeesPage;
