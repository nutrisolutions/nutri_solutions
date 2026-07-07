import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Briefcase,
  Building2,
  CalendarClock,
  IndianRupee,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Save,
  Send,
  UserMinus
} from "lucide-react";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import {
  employeeMyResignation,
  employeeSubmitResignation,
  employeeUpdateBankDetails,
  employeeWithdrawResignation
} from "../../lib/api";
import { formatTenure, initials } from "../../lib/employeeStatus";
import Modal from "../../components/ui/Modal";

const STATUS_LABEL = {
  pending: "Pending HR review",
  approved: "Approved",
  rejected: "Rejected by HR",
  withdrawn: "Withdrawn"
};

const STATUS_PILL = {
  pending: "status-pill--info",
  approved: "status-pill--danger",
  rejected: "status-pill--danger",
  withdrawn: "status-pill--neutral"
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const emptyBankForm = { accountHolderName: "", accountNumber: "", ifscCode: "", bankName: "", branchName: "" };

const PortalProfilePage = () => {
  const { employee, refresh } = useEmployeeAuth();
  const isPermanent = employee?.employmentType === "permanent";

  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [showResignModal, setShowResignModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [bankForm, setBankForm] = useState(emptyBankForm);
  const [savingBank, setSavingBank] = useState(false);

  useEffect(() => {
    if (employee?.bankDetails) {
      setBankForm({ ...emptyBankForm, ...employee.bankDetails });
    }
  }, [employee?.bankDetails]);

  const load = useCallback(async () => {
    if (!isPermanent) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await employeeMyResignation();
      setResignation(res.resignation);
    } catch {
      setMessage("Failed to load resignation status");
    } finally {
      setLoading(false);
    }
  }, [isPermanent]);

  useEffect(() => {
    load();
  }, [load]);

  const openResignModal = () => {
    setAccepted(false);
    setReason("");
    setShowResignModal(true);
  };

  const handleSubmitResignation = async (e) => {
    e.preventDefault();
    if (!accepted || !reason.trim()) return;
    setMessage("");
    setSubmitting(true);
    try {
      await employeeSubmitResignation(reason.trim(), true);
      setMessage("Resignation request submitted");
      setShowResignModal(false);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit resignation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!window.confirm("Withdraw your resignation request?")) return;
    setMessage("");
    try {
      await employeeWithdrawResignation();
      setMessage("Resignation withdrawn");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to withdraw resignation");
    }
  };

  const handleSaveBankDetails = async (e) => {
    e.preventDefault();
    setMessage("");
    setSavingBank(true);
    try {
      await employeeUpdateBankDetails(bankForm);
      setMessage("Bank account details saved");
      await refresh();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save bank details");
    } finally {
      setSavingBank(false);
    }
  };

  const canRequest = isPermanent && (!resignation || ["none", "rejected", "withdrawn"].includes(resignation.status));

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Profile</h1>
          <p>Your details on file with HR.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <div className="employee-detail">
        <div className="employee-header-card">
          <div className="employee-header-identity">
            <div className="employee-avatar">{initials(employee?.fullName)}</div>
            <div className="employee-header-text">
              <h2>{employee?.fullName}</h2>
              <div className="employee-contact-row">
                <span>
                  <Mail size={14} /> {employee?.email}
                </span>
                {employee?.phone && (
                  <span>
                    <Phone size={14} /> {employee.phone}
                  </span>
                )}
              </div>
              <div className="employee-status-row">
                <span className={employee?.employmentType === "permanent" ? "admin-badge admin-badge--ok" : "admin-badge"}>
                  {employee?.employmentType}
                </span>
                {employee?.joiningDate && (
                  <span className="profile-tenure-badge">
                    <CalendarClock size={13} /> {formatTenure(employee.joiningDate)} with Nutri Solutions
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <section className="employee-section">
          <div className="employee-section-head">
            <div>
              <h3>
                <Briefcase size={18} /> Employment details
              </h3>
            </div>
          </div>
          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span className="profile-info-item-label">
                <Building2 size={13} /> Department
              </span>
              <span className="profile-info-item-value">{employee?.department?.name || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-item-label">
                <Briefcase size={13} /> Position
              </span>
              <span className="profile-info-item-value">{employee?.position || "—"}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-item-label">
                <CalendarClock size={13} /> Joining date
              </span>
              <span className="profile-info-item-value">{formatDate(employee?.joiningDate)}</span>
            </div>
            <div className="profile-info-item">
              <span className="profile-info-item-label">
                <IndianRupee size={13} /> CTC
              </span>
              <span className="profile-info-item-value">{employee?.ctc || "—"}</span>
            </div>
            {employee?.workLocation && (
              <div className="profile-info-item">
                <span className="profile-info-item-label">
                  <MapPin size={13} /> Work location
                </span>
                <span className="profile-info-item-value">{employee.workLocation}</span>
              </div>
            )}
            <div className="profile-info-item">
              <span className="profile-info-item-label">
                <Mail size={13} /> Work email
              </span>
              <span className="profile-info-item-value">{employee?.workEmail || "Not set by HR yet"}</span>
            </div>
          </div>
        </section>

        <section className="employee-section">
          <div className="employee-section-head">
            <div>
              <h3>
                <Landmark size={18} /> Bank account details
              </h3>
              <p>Used by HR for salary processing. Only you can see and edit this.</p>
            </div>
          </div>
          <form className="admin-form-card" onSubmit={handleSaveBankDetails} style={{ margin: 0 }}>
            <div className="admin-form-grid">
              <label>
                Account holder name
                <input
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                />
              </label>
              <label>
                Bank name
                <input value={bankForm.bankName} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
              </label>
              <label>
                Account number
                <input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                />
              </label>
              <label>
                IFSC code
                <input value={bankForm.ifscCode} onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })} />
              </label>
              <label>
                Branch name
                <input value={bankForm.branchName} onChange={(e) => setBankForm({ ...bankForm, branchName: e.target.value })} />
              </label>
            </div>
            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingBank}>
                <Save size={14} /> {savingBank ? "Saving…" : "Save bank details"}
              </button>
            </div>
          </form>
        </section>

        {isPermanent && (
          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <UserMinus size={18} /> Resignation
                </h3>
              </div>
              {canRequest && (
                <button type="button" className="btn btn-outline btn-sm" onClick={openResignModal}>
                  <UserMinus size={14} /> Resign
                </button>
              )}
            </div>

            {loading ? (
              <p>Loading…</p>
            ) : !resignation || resignation.status === "none" ? (
              <p className="admin-empty">You haven't submitted a resignation request.</p>
            ) : (
              <>
                <div className="employee-doc-card-head">
                  <span className={`status-pill ${STATUS_PILL[resignation.status] || "status-pill--neutral"}`}>
                    {STATUS_LABEL[resignation.status] || resignation.status}
                  </span>
                </div>
                <p>{resignation.reason}</p>
                {resignation.status === "approved" && resignation.lastWorkingDay && (
                  <p className="admin-message admin-message--warning">
                    <AlertTriangle size={16} /> Last working day: {formatDate(resignation.lastWorkingDay)} — portal access
                    will end automatically after this date.
                  </p>
                )}
                {resignation.reviewNote && <p className="employee-doc-reason">HR note: {resignation.reviewNote}</p>}
                {resignation.status === "pending" && (
                  <div className="admin-form-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={handleWithdraw}>
                      Withdraw request
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}
      </div>

      <Modal open={showResignModal} onClose={() => setShowResignModal(false)} title="Submit resignation" maxWidth="520px">
        <form className="admin-form-card" onSubmit={handleSubmitResignation} style={{ margin: 0 }}>
          <h2>Notice period &amp; resignation policy</h2>
          <ul className="resignation-terms-list">
            <li>A compulsory 1 month (30 days) notice period applies once HR approves your resignation.</li>
            <li>You must hand over pending work, documents, and company assets before your last working day.</li>
            <li>Any pending leave or tasks should be settled during the notice period.</li>
            <li>Your portal access will be automatically revoked at the end of your last working day.</li>
            <li>HR will confirm your exact last working day when they approve this request.</li>
          </ul>

          <label className="admin-form-full">
            Reason *
            <textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} required />
          </label>

          <div className="admin-form-checks">
            <label>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              I acknowledge and accept the notice period terms and resignation policy above.
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={!accepted || !reason.trim() || submitting}>
              <Send size={16} /> {submitting ? "Submitting…" : "Submit resignation"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowResignModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PortalProfilePage;
