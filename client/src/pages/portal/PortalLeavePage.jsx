import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Send, Wallet } from "lucide-react";
import {
  employeeCancelLeaveRequest,
  employeeCreateLeaveRequest,
  employeeLeaveTypes,
  employeeMyLeaveRequests
} from "../../lib/api";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { leaveRequestSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const emptyForm = { leaveType: "", startDate: "", endDate: "", halfDay: false, reason: "" };

const LEAVE_STATUS_PILL = {
  pending: "status-pill--info",
  approved: "status-pill--success",
  rejected: "status-pill--danger",
  cancelled: "status-pill--neutral"
};

const PortalLeavePage = () => {
  const { employee } = useEmployeeAuth();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [types, myRequests] = await Promise.all([employeeLeaveTypes(), employeeMyLeaveRequests()]);
      setLeaveTypes(types);
      setRequests(myRequests);
      if (types.length && !form.leaveType) setForm((f) => ({ ...f, leaveType: types[0]._id }));
    } catch {
      setMessage("Failed to load leave data");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setForm((f) => ({ ...emptyForm, leaveType: f.leaveType }));
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
          <p>Apply for leave and track your requests.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {employee?.leaveBalances && (
        <section className="employee-section">
          <div className="employee-section-head">
            <div>
              <h3>
                <Wallet size={18} /> Leave balances
              </h3>
            </div>
          </div>
          <div className="employee-doc-grid">
            {leaveTypes.map((lt) => (
              <div key={lt._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{lt.name}</strong>
                </div>
                <p>{employee.leaveBalances[lt._id] ?? lt.defaultDaysPerYear} day(s) remaining</p>
              </div>
            ))}
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
              Leave type
              <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} required>
                {leaveTypes.map((lt) => (
                  <option key={lt._id} value={lt._id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Start date
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </label>
            <label>
              End date
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
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
                  <strong>{r.leaveType?.name}</strong>
                  <span className={`status-pill ${LEAVE_STATUS_PILL[r.status] || "status-pill--neutral"}`}>{r.status}</span>
                </div>
                <p>
                  {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                  {r.halfDay ? " (half day)" : ""}
                </p>
                <p>{r.reason}</p>
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
