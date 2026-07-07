import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CalendarClock, Clock3, UserMinus } from "lucide-react";
import { adminEmployees } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";

const STATUS_LABEL = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  withdrawn: "Withdrawn"
};

const STATUS_PILL = {
  pending: "status-pill--info",
  approved: "status-pill--success",
  rejected: "status-pill--danger",
  withdrawn: "status-pill--neutral"
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const AdminResignationsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const employeesBasePath = location.pathname.startsWith("/portal") ? "/portal/hr/employees" : "/admin/employees";
  const [employees, setEmployees] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEmployees(await adminEmployees.listResignations());
    } catch {
      setMessage("Failed to load resignation requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const pending = useMemo(() => employees.filter((e) => e.resignation.status === "pending"), [employees]);
  const history = useMemo(() => employees.filter((e) => e.resignation.status !== "pending"), [employees]);

  const goToEmployee = (id) => navigate(`${employeesBasePath}?employeeId=${id}`);

  const renderCard = (emp) => (
    <div key={emp._id} className="employee-doc-card" style={{ cursor: "pointer" }} onClick={() => goToEmployee(emp._id)}>
      <div className="employee-doc-card-head">
        <strong>
          <span className="employee-avatar employee-avatar--sm">{initials(emp.fullName)}</span>
          {emp.fullName}
        </strong>
        <span className={`status-pill ${STATUS_PILL[emp.resignation.status] || "status-pill--neutral"}`}>
          {STATUS_LABEL[emp.resignation.status] || emp.resignation.status}
        </span>
      </div>
      <p>{emp.department?.name || "No department"}</p>
      <p>{emp.resignation.reason}</p>
      {emp.resignation.status === "approved" && emp.resignation.lastWorkingDay && (
        <p className="employee-doc-reason">
          <CalendarClock size={14} /> Last working day: {formatDate(emp.resignation.lastWorkingDay)}
        </p>
      )}
      {emp.resignation.reviewNote && <p className="employee-doc-reason">HR note: {emp.resignation.reviewNote}</p>}
    </div>
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Resignations</h1>
          <p>Review employee resignation requests and set the last working day on approval.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Clock3 size={18} /> Pending requests
            </h3>
            <p>Awaiting your review.</p>
          </div>
          <span className="admin-badge">{pending.length}</span>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : pending.length === 0 ? (
          <p className="admin-empty">No pending resignation requests.</p>
        ) : (
          <div className="employee-doc-grid">{pending.map(renderCard)}</div>
        )}
      </section>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <UserMinus size={18} /> History
            </h3>
          </div>
        </div>
        {history.length === 0 ? (
          <p className="admin-empty">No reviewed requests yet.</p>
        ) : (
          <div className="employee-doc-grid">{history.map(renderCard)}</div>
        )}
      </section>
    </div>
  );
};

export default AdminResignationsPage;
