import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Send, Wallet } from "lucide-react";
import { employeeCancelLeaveRequest, employeeCreateLeaveRequest, employeeLeaveSummary, employeeMyLeaveRequests } from "../../lib/api";
import { leaveRequestSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import DatePicker from "../../components/ui/DatePicker";

const emptyForm = { startDate: "", endDate: "", halfDay: false, reason: "" };

const LEAVE_STATUS_PILL = {
  pending: "status-pill--info",
  approved: "status-pill--success",
  rejected: "status-pill--danger",
  cancelled: "status-pill--neutral"
};

const PortalLeavePage = () => {
  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [leaveSummary, myRequests] = await Promise.all([employeeLeaveSummary(), employeeMyLeaveRequests()]);
      setSummary(leaveSummary);
      setRequests(myRequests);
    } catch {
      setMessage("Failed to load leave data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(leaveRequestSchema, form);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await employeeCreateLeaveRequest(form);
      setMessage("Leave request submitted");
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit leave request");
    }
  };

  const handleCancel = async (id) => {
    setMessage("");
    try {
      await employeeCancelLeaveRequest(id);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to cancel request");
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Leave</h1>
          <p>Apply for leave and track your requests. Every employee gets 12 days a year (1 per month).</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {summary && (
        <section className="employee-section">
          <div className="employee-section-head">
            <div>
              <h3>
                <Wallet size={18} /> Leave balance — {summary.year}
              </h3>
            </div>
          </div>
          <div className="admin-analytics-stats">
            <div className="admin-analytics-stat-card">
              <Wallet size={22} />
              <div>
                <span className="admin-analytics-stat-value">{summary.remaining}</span>
                <span className="admin-analytics-stat-label">Days remaining (of {summary.entitlement})</span>
              </div>
            </div>
            <div className="admin-analytics-stat-card">
              <CalendarClock size={22} />
              <div>
                <span className="admin-analytics-stat-value">{summary.approvedPaidDays}</span>
                <span className="admin-analytics-stat-label">Approved this year</span>
              </div>
            </div>
            <div className="admin-analytics-stat-card">
              <AlertTriangle size={22} />
              <div>
                <span className="admin-analytics-stat-value">{summary.lopDays}</span>
                <span className="admin-analytics-stat-label">Loss of pay days</span>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Send size={18} /> Request leave
            </h3>
          </div>
        </div>
        <form className="admin-form-card" onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
          <div className="admin-form-grid">
            <label>
              Start date
              <DatePicker value={form.startDate} onChange={(startDate) => setForm({ ...form, startDate })} required />
            </label>
            <label>
              End date
              <DatePicker value={form.endDate} onChange={(endDate) => setForm({ ...form, endDate })} required />
            </label>
            <label className="admin-form-full">
              Reason
              <textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
            </label>
          </div>
          <div className="admin-form-checks">
            <label>
              <input
                type="checkbox"
                checked={form.halfDay}
                onChange={(e) => setForm({ ...form, halfDay: e.target.checked })}
              />
              Half day
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary btn-sm">
              Submit request
            </button>
          </div>
        </form>
      </section>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <CalendarClock size={18} /> My requests
            </h3>
            <p>{requests.length ? `${requests.length} request(s)` : "No requests yet"}</p>
          </div>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : requests.length === 0 ? (
          <p className="admin-empty">No leave requests yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {requests.map((r) => (
              <div key={r._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{r.days} day(s)</strong>
                  <span className={`status-pill ${LEAVE_STATUS_PILL[r.status] || "status-pill--neutral"}`}>{r.status}</span>
                </div>
                <p>
                  {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                  {r.halfDay ? " (half day)" : ""}
                </p>
                <p>{r.reason}</p>
                {r.status === "approved" && r.lopDays > 0 && (
                  <p className="employee-doc-reason">{r.lopDays} day(s) counted as loss of pay</p>
                )}
                {r.status === "pending" && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleCancel(r._id)}>
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalLeavePage;
