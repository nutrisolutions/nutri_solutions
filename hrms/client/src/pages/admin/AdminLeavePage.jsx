import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, Clock3, History, X } from "lucide-react";
import { adminLeave } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";

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
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewNoteFor, setReviewNoteFor] = useState(null);
  const [reviewNote, setReviewNote] = useState("");
  const [showAllHistory, setShowAllHistory] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRequests(await adminLeave.listRequests());
    } catch {
      setMessage("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
  const lopDaysTotal = useMemo(
    () => requests.filter((r) => r.status === "approved").reduce((sum, r) => sum + (r.lopDays || 0), 0),
    [requests]
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Leave</h1>
          <p>Review employee leave requests. Every employee gets 12 days a year (1 per month).</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-analytics-stats">
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
        <div className="admin-analytics-stat-card">
          <AlertTriangle size={22} />
          <div>
            <span className="admin-analytics-stat-value">{lopDaysTotal}</span>
            <span className="admin-analytics-stat-label">Total LOP days (approved)</span>
          </div>
        </div>
      </div>

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
                  <span className="admin-badge">{r.days} day(s)</span>
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
                <p>
                  {r.days} day(s){r.status === "approved" && r.lopDays > 0 ? ` · ${r.lopDays} day(s) LOP` : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminLeavePage;
