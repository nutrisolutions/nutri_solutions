import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { adminLeave } from "../../lib/api";
import { leaveTypeSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";

const emptyTypeForm = { name: "", defaultDaysPerYear: 12, paid: true };

const AdminLeavePage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [typeForm, setTypeForm] = useState(emptyTypeForm);
  const [showTypeForm, setShowTypeForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviewNoteFor, setReviewNoteFor] = useState(null);
  const [reviewNote, setReviewNote] = useState("");

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

  const pending = requests.filter((r) => r.status === "pending");
  const others = requests.filter((r) => r.status !== "pending");

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

      <h2 className="admin-careers-apps-heading">Leave types</h2>
      {leaveTypes.length === 0 ? (
        <p className="admin-empty">No leave types configured yet.</p>
      ) : (
        <div className="admin-careers-list">
          {leaveTypes.map((lt) => (
            <div key={lt._id} className="admin-careers-row">
              <div className="admin-careers-row-main">
                <div>
                  <strong>{lt.name}</strong>
                  <span>
                    {lt.defaultDaysPerYear} days/year · {lt.paid ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="admin-careers-apps-heading">Pending requests ({pending.length})</h2>
      {loading ? (
        <p>Loading…</p>
      ) : pending.length === 0 ? (
        <p className="admin-empty">No pending requests.</p>
      ) : (
        <div className="admin-applications-list">
          {pending.map((r) => (
            <article key={r._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>{r.employee?.fullName}</strong>
                <p>
                  {r.leaveType?.name} · {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                  {r.halfDay ? " (half day)" : ""}
                </p>
                <p>{r.reason}</p>
                <div className="admin-form-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => handleReview(r._id, "approved")}>
                    Approve
                  </button>
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => setReviewNoteFor(r._id)}>
                    Reject
                  </button>
                </div>
                {reviewNoteFor === r._id && (
                  <div className="admin-form-actions">
                    <input type="text" placeholder="Rejection note" value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} />
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => handleReview(r._id, "rejected")}>
                      Confirm reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="admin-careers-apps-heading">History</h2>
      {others.length === 0 ? (
        <p className="admin-empty">No reviewed requests yet.</p>
      ) : (
        <div className="admin-applications-list">
          {others.map((r) => (
            <article key={r._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>{r.employee?.fullName}</strong>
                <p>
                  {r.leaveType?.name} · {new Date(r.startDate).toLocaleDateString()} – {new Date(r.endDate).toLocaleDateString()}
                </p>
                <p>
                  <span className="admin-badge">{r.status}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLeavePage;
