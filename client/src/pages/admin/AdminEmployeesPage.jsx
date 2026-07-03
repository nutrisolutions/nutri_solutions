import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  Key,
  Mail,
  Phone,
  Plus,
  Search,
  Send,
  User,
  UserCheck
} from "lucide-react";
import { adminDepartments, adminEmployees } from "../../lib/api";
import { companyDocumentSchema, createEmployeeSchema, interviewSchema, requestDocumentsSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import { onlyDigits } from "../../lib/phoneInput";

const emptyCreateForm = { fullName: "", email: "", phone: "", department: "", position: "" };
const emptyInterviewForm = { round: 1, date: "", time: "", durationMinutes: 30 };
const emptyCompanyDocForm = { type: "payslip", label: "", periodMonth: "", periodYear: "" };

const STATUS_META = {
  draft: { label: "Draft", pill: "neutral" },
  interviewing: { label: "Interviewing", pill: "info" },
  selected: { label: "Selected", pill: "success" },
  documents_requested: { label: "Documents requested", pill: "info" },
  documents_under_review: { label: "Documents under review", pill: "progress" },
  documents_rejected: { label: "Documents rejected", pill: "danger" },
  documents_verified: { label: "Documents verified", pill: "success" },
  offer_sent: { label: "Offer sent", pill: "info" },
  offer_accepted: { label: "Offer accepted", pill: "progress" },
  onboarding: { label: "Onboarding", pill: "warning" },
  onboarding_completed: { label: "Onboarding completed", pill: "success" },
  permanent: { label: "Permanent", pill: "success" }
};

const STATUS_LABELS = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]));

const DOC_STATUS_META = {
  pending: { label: "Pending", pill: "neutral" },
  uploaded: { label: "Uploaded", pill: "info" },
  verified: { label: "Verified", pill: "success" },
  rejected: { label: "Rejected", pill: "danger" }
};

const INTERVIEW_STATUS_META = {
  scheduled: { label: "Scheduled", pill: "info" },
  completed: { label: "Completed", pill: "success" },
  cancelled: { label: "Cancelled", pill: "danger" }
};

const STEPPER_STEPS = [
  { key: "draft", label: "Draft" },
  { key: "interviewing", label: "Interviews" },
  { key: "selected", label: "Selected" },
  { key: "documents", label: "Documents" },
  { key: "offer_sent", label: "Offer" },
  { key: "offer_accepted", label: "Accepted" },
  { key: "onboarding", label: "Onboarding" },
  { key: "onboarding_completed", label: "Completed" },
  { key: "permanent", label: "Permanent" }
];

const STATUS_TO_STEP = {
  draft: "draft",
  interviewing: "interviewing",
  selected: "selected",
  documents_requested: "documents",
  documents_under_review: "documents",
  documents_rejected: "documents",
  documents_verified: "documents",
  offer_sent: "offer_sent",
  offer_accepted: "offer_accepted",
  onboarding: "onboarding",
  onboarding_completed: "onboarding_completed",
  permanent: "permanent"
};

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";

const AdminEmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState("list");
  const [selected, setSelected] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [companyDocForm, setCompanyDocForm] = useState(emptyCompanyDocForm);
  const [companyDocFile, setCompanyDocFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [tempPasswordInfo, setTempPasswordInfo] = useState(null);
  const [newDocLabel, setNewDocLabel] = useState("");
  const [rejectReasonFor, setRejectReasonFor] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [offerLetter, setOfferLetter] = useState(null);
  const [joiningLetter, setJoiningLetter] = useState(null);
  const [checklistInput, setChecklistInput] = useState("");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => e.fullName?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q));
  }, [employees, search]);

  const openDetail = async (employee) => {
    setView("detail");
    setMessage("");
    setTempPasswordInfo(null);
    try {
      const data = await adminEmployees.get(employee._id);
      setSelected(data.employee);
      setDocuments(data.documents);
      setNotifications(data.notifications);
      setInterviews(data.interviews || []);
      setInterviewForm({ ...emptyInterviewForm, round: (data.interviews?.length || 0) + 1 });
      setCompanyDocuments(data.companyDocuments || []);
    } catch {
      setMessage("Failed to load employee");
    }
  };

  const refreshDetail = async () => {
    if (!selected) return;
    const data = await adminEmployees.get(selected._id);
    setSelected(data.employee);
    setDocuments(data.documents);
    setNotifications(data.notifications);
    setInterviews(data.interviews || []);
    setCompanyDocuments(data.companyDocuments || []);
  };

  const backToList = () => {
    setView("list");
    setSelected(null);
    setDocuments([]);
    setNotifications([]);
    setInterviews([]);
    setCompanyDocuments([]);
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
      .split("\n")
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

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!offerLetter || !joiningLetter) return;
    setMessage("");
    try {
      await adminEmployees.sendOffer(selected._id, offerLetter, joiningLetter);
      setOfferLetter(null);
      setJoiningLetter(null);
      setMessage("Offer sent");
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send offer");
    }
  };

  const handleStartOnboarding = async () => {
    const items = checklistInput
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    setMessage("");
    try {
      await adminEmployees.startOnboarding(selected._id, items);
      setChecklistInput("");
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
    setMessage("");
    try {
      await adminEmployees.convertToPermanent(selected._id);
      setMessage("Employee converted to permanent");
      await refreshDetail();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to convert to permanent");
    }
  };

  const handleUploadCompanyDocument = async (e) => {
    e.preventDefault();
    setMessage("");

    const payload = {
      type: companyDocForm.type,
      label: companyDocForm.label,
      periodMonth: companyDocForm.periodMonth ? Number(companyDocForm.periodMonth) : null,
      periodYear: companyDocForm.periodYear ? Number(companyDocForm.periodYear) : null
    };
    const validationError = firstZodError(companyDocumentSchema, payload);
    if (validationError) {
      setMessage(validationError);
      return;
    }
    if (!companyDocFile) {
      setMessage("Choose a file to upload");
      return;
    }

    try {
      await adminEmployees.uploadCompanyDocument(selected._id, { ...payload, file: companyDocFile });
      setMessage("Document added");
      setCompanyDocForm(emptyCompanyDocForm);
      setCompanyDocFile(null);
      await refreshDetail();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to upload document");
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
          {showCreateForm && (
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
          )}

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
                <div className="employee-status-row">
                  <span className={`status-pill status-pill--${STATUS_META[selected.status]?.pill || "neutral"}`}>
                    {STATUS_LABELS[selected.status] || selected.status}
                  </span>
                  <span className={selected.employmentType === "permanent" ? "admin-badge admin-badge--ok" : "admin-badge"}>
                    {selected.employmentType}
                  </span>
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
              </div>
              {tempPasswordInfo && (
                <p className="admin-message">
                  One-time temp password (share now, won't be shown again): <strong>{tempPasswordInfo}</strong>
                </p>
              )}
            </div>
          </div>

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

          {(selected.status === "draft" || selected.status === "interviewing" || interviews.length > 0) && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <CalendarClock size={18} /> Interviews
                  </h3>
                  <p>
                    {interviews.length
                      ? `${interviews.length} round(s) scheduled`
                      : "Schedule interview rounds via Microsoft Teams before marking the candidate selected"}
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
                      <input
                        type="date"
                        value={interviewForm.date}
                        onChange={(e) => setInterviewForm({ ...interviewForm, date: e.target.value })}
                      />
                    </label>
                    <label>
                      Time
                      <input
                        type="time"
                        value={interviewForm.time}
                        onChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                      />
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
                      <Send size={14} /> Schedule Teams interview
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
                      {iv.teamsJoinUrl && (
                        <a className="employee-doc-link" href={iv.teamsJoinUrl} target="_blank" rel="noreferrer">
                          Join Teams meeting
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
                  Request documents (one per line)
                  <textarea
                    rows={3}
                    value={newDocLabel}
                    onChange={(e) => setNewDocLabel(e.target.value)}
                    placeholder={"ID proof\nAddress proof"}
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

          {(selected.status === "documents_verified" || selected.offerLetterUrl) && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <Briefcase size={18} /> Offer
                  </h3>
                  <p>{selected.offerLetterUrl ? "Offer and joining letter on file" : "Send once all documents are verified"}</p>
                </div>
              </div>

              {selected.offerLetterUrl ? (
                <div className="admin-form-actions">
                  <a className="btn btn-outline btn-sm" href={selected.offerLetterUrl} target="_blank" rel="noreferrer">
                    View offer letter
                  </a>
                  <a className="btn btn-outline btn-sm" href={selected.joiningLetterUrl} target="_blank" rel="noreferrer">
                    View joining letter
                  </a>
                </div>
              ) : (
                <form className="admin-form-card" onSubmit={handleSendOffer}>
                  <div className="admin-form-grid">
                    <label>
                      Offer letter
                      <input type="file" onChange={(e) => setOfferLetter(e.target.files?.[0])} required />
                    </label>
                    <label>
                      Joining letter
                      <input type="file" onChange={(e) => setJoiningLetter(e.target.files?.[0])} required />
                    </label>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">
                      <Send size={14} /> Send offer
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
                  <label>
                    Checklist items (one per line)
                    <textarea
                      rows={3}
                      value={checklistInput}
                      onChange={(e) => setChecklistInput(e.target.value)}
                      placeholder={"Laptop setup\nID card issued"}
                    />
                  </label>
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
                    <FileText size={18} /> Company documents
                  </h3>
                  <p>Appraisal letters and monthly payslips visible to the employee in their portal.</p>
                </div>
              </div>

              <form className="admin-form-card" onSubmit={handleUploadCompanyDocument} style={{ marginBottom: companyDocuments.length ? "1.1rem" : 0 }}>
                <div className="admin-form-grid">
                  <label>
                    Type
                    <select
                      value={companyDocForm.type}
                      onChange={(e) => setCompanyDocForm({ ...companyDocForm, type: e.target.value })}
                    >
                      <option value="payslip">Payslip</option>
                      <option value="appraisal_letter">Appraisal letter</option>
                    </select>
                  </label>
                  <label>
                    Label
                    <input
                      value={companyDocForm.label}
                      onChange={(e) => setCompanyDocForm({ ...companyDocForm, label: e.target.value })}
                      placeholder={companyDocForm.type === "payslip" ? "Payslip - June 2026" : "Annual Appraisal 2026"}
                      required
                    />
                  </label>
                  {companyDocForm.type === "payslip" && (
                    <>
                      <label>
                        Month
                        <select
                          value={companyDocForm.periodMonth}
                          onChange={(e) => setCompanyDocForm({ ...companyDocForm, periodMonth: e.target.value })}
                        >
                          <option value="">Select month</option>
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
                          value={companyDocForm.periodYear}
                          onChange={(e) => setCompanyDocForm({ ...companyDocForm, periodYear: e.target.value })}
                          placeholder="2026"
                        />
                      </label>
                    </>
                  )}
                  <label>
                    File
                    <input type="file" onChange={(e) => setCompanyDocFile(e.target.files?.[0])} required />
                  </label>
                </div>
                <div className="admin-form-actions">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} /> Add document
                  </button>
                </div>
              </form>

              {companyDocuments.length > 0 && (
                <div className="employee-doc-grid">
                  {companyDocuments.map((doc) => (
                    <div key={doc._id} className="employee-doc-card">
                      <div className="employee-doc-card-head">
                        <strong>
                          <FileText size={15} /> {doc.label}
                        </strong>
                        <span className="admin-badge">{doc.type === "payslip" ? "Payslip" : "Appraisal"}</span>
                      </div>
                      <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                        View file
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {notifications.length > 0 && (
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <Clock size={18} /> Activity
                  </h3>
                  <p>Latest status changes and notifications for this employee</p>
                </div>
              </div>
              <div className="employee-timeline">
                {notifications.map((n) => (
                  <div key={n._id} className="employee-timeline-item">
                    <div className="employee-timeline-dot" />
                    <div className="employee-timeline-body">
                      <p>{n.message}</p>
                      <span>{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEmployeesPage;
