import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, CheckCircle2, Clock3, History, Plus, Wallet, X } from "lucide-react";
import { adminLeave } from "../../lib/api";
import { leaveTypeSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import { initials } from "../../lib/employeeStatus";

const emptyTypeForm = { name: "", defaultDaysPerYear: 12, paid: true };

const HISTORY_PILL = {
  approved: "status-pill--success",
  rejected: "status-pill--danger",
  cancelled: "status-pill--neutral"
};

const formatRange = (start, end, halfDay) => {
  const s = new Date(start).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  const e = new Date(end).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
  return `${s === e ? s : `${s} – ${e}`}${halfDay ? " · Half day" : ""}`;
};

const AdminLeavePage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewNoteFor, setReviewNoteFor] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [types, reqs] = await Promise.all([adminLeave.listTypes(), adminLeave.listRequests()]);
      setLeaveTypes(types);
      setRequests(reqs);
    } catch {
      setMessage("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreateType = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(leaveTypeSchema, typeForm);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await adminLeave.createType(typeForm);
      setShowTypeForm(false);
      setTypeForm(emptyTypeForm);
      setMessage("Leave type added");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add leave type");
    }
  };

  const handleReview = async (id, decision) => {
    setMessage("");
    try {
      await adminLeave.reviewRequest(id, decision, decision === "rejected" ? reviewNote : undefined);
      setReviewNoteFor(null);
      setReviewNote("");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to review request");
    }
  };

  const pending = useMemo(() => requests.filter((r) => r.status === "pending"), [requests]);
  const history = useMemo(() => requests.filter((r) => r.status !== "pending"), [requests]);
  const approvedCount = useMemo(() => requests.filter((r) => r.status === "approved").length, [requests]);
  const rejectedCount = useMemo(() => requests.filter((r) => r.status === "rejected").length, [requests]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Leave</h1>
          <p>Manage leave types and review employee leave requests.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setShowTypeForm(true)}>
          <Plus size={18} /> Add leave type
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-analytics-stats">
        <div className="admin-analytics-stat-card">
          <Wallet size={22} />
          <div>
            <span className="admin-analytics-stat-value">{leaveTypes.length}</span>
            <span className="admin-analytics-stat-label">Leave types</span>
          </div>
        </div>
        <div className="admin-analytics-stat-card">
          <Clock3 size={22} />
          <div>
            <span className="admin-analytics-stat-value">{pending.length}</span>
            <span className="admin-analytics-stat-label">Pending requests</span>
          </div>
        </div>
        <div className="admin-analytics-stat-card">
          <CheckCircle2 size={22} />
          <div>
            <span className="admin-analytics-stat-value">{approvedCount}</span>
            <span className="admin-analytics-stat-label">Approved</span>
          </div>
        </div>
        <div className="admin-analytics-stat-card">
          <X size={22} />
          <div>
            <span className="admin-analytics-stat-value">{rejectedCount}</span>
            <span className="admin-analytics-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      {showTypeForm && (
        <form className="admin-form-card" onSubmit={handleCreateType}>
          <h2>New leave type</h2>
          <div className="admin-form-grid">
            <label>
              Name *
              <input value={typeForm.name} onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })} required />
            </label>
            <label>
              Default days/year
              <input
                type="number"
                min="0"
                value={typeForm.defaultDaysPerYear}
                onChange={(e) => setTypeForm({ ...typeForm, defaultDaysPerYear: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="admin-form-checks">
            <label>
              <input type="checkbox" checked={typeForm.paid} onChange={(e) => setTypeForm({ ...typeForm, paid: e.target.checked })} />
              Paid
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowTypeForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Wallet size={18} /> Leave types
            </h3>
            <p>Annual allowance available to every employee.</p>
          </div>
        </div>
        {leaveTypes.length === 0 ? (
          <p className="admin-empty">No leave types configured yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {leaveTypes.map((lt) => (
              <div key={lt._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{lt.name}</strong>
                  <span className={`admin-badge ${lt.paid ? "admin-badge--ok" : ""}`}>{lt.paid ? "Paid" : "Unpaid"}</span>
                </div>
                <p>{lt.defaultDaysPerYear} day(s) / year</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Clock3 size={18} /> Pending requests
            </h3>
            <p>Awaiting your approval.</p>
          </div>
          <span className="admin-badge">{pending.length}</span>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : pending.length === 0 ? (
          <p className="admin-empty">No pending requests.</p>
        ) : (
          <div className="employee-doc-grid">
            {pending.map((r) => (
              <div key={r._id} className="employee-doc-card employee-leave-card">
                <div className="employee-doc-card-head">
                  <strong>
                    <span className="employee-avatar employee-avatar--sm">{initials(r.employee?.fullName)}</span>
                    {r.employee?.fullName}
                  </strong>
                  <span className="admin-badge">{r.leaveType?.name}</span>
                </div>
                <p className="employee-leave-range">
                  <CalendarClock size={14} /> {formatRange(r.startDate, r.endDate, r.halfDay)}
                </p>
                <p className="employee-leave-reason">{r.reason}</p>

                {reviewNoteFor === r._id ? (
                  <div className="employee-leave-reject-row">
                    <input
                      type="text"
                      placeholder="Reason for rejection"
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      autoFocus
                    />
                    <div className="admin-form-actions">
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => handleReview(r._id, "rejected")}>
                        Confirm reject
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setReviewNoteFor(null);
                          setReviewNote("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="admin-form-actions">
                    <button type="button" className="btn btn-primary btn-sm" onClick={() => handleReview(r._id, "approved")}>
                      Approve
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => setReviewNoteFor(r._id)}>
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="employee-section">
        <div className="employee-docs-toolbar" style={{ margin: 0 }}>
          <h3 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "1rem" }}>
            <History size={18} /> History
            <span>({history.length})</span>
          </h3>
          {history.length > 4 && (
            <button type="button" className="employee-docs-toggle" onClick={() => setShowAllHistory((v) => !v)}>
              {showAllHistory ? "Show less" : `View all ${history.length}`}
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="admin-empty">No reviewed requests yet.</p>
        ) : (
          <div className="employee-doc-grid" style={{ marginTop: "0.85rem" }}>
            {(showAllHistory ? history : history.slice(0, 4)).map((r) => (
              <div key={r._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>
                    <span className="employee-avatar employee-avatar--sm">{initials(r.employee?.fullName)}</span>
                    {r.employee?.fullName}
                  </strong>
                  <span className={`status-pill ${HISTORY_PILL[r.status] || "status-pill--neutral"}`}>{r.status}</span>
                </div>
                <p className="employee-leave-range">
                  <CalendarClock size={14} /> {formatRange(r.startDate, r.endDate, r.halfDay)}
                </p>
                <p>{r.leaveType?.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminLeavePage;
