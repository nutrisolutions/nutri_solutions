import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarClock, Clock, ListChecks, Users } from "lucide-react";
import { adminDepartments, adminEmployees, adminLeave, adminTasks } from "../../lib/api";

const EMPLOYEE_STATUS_LABELS = {
  draft: "Draft",
  interviewing: "Interviewing",
  selected: "Selected",
  documents_requested: "Documents requested",
  documents_under_review: "Documents under review",
  documents_rejected: "Documents rejected",
  documents_verified: "Documents verified",
  offer_sent: "Offer sent",
  offer_accepted: "Offer accepted",
  offer_rejected: "Offer rejected",
  offer_expired: "Offer expired",
  onboarding: "Onboarding",
  onboarding_completed: "Onboarding completed",
  permanent: "Permanent"
};

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "—";

const timeAgo = (value) => {
  if (!value) return "";
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(value);
};

const topN = (list, n = 5) =>
  [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recents, setRecents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [departments, employees, tasks, leaveRequests] = await Promise.all([
          adminDepartments.list(),
          adminEmployees.list(),
          adminTasks.list(),
          adminLeave.listRequests()
        ]);

        setStats({
          departments: departments.length,
          employeesTotal: employees.length,
          employeesTemporary: employees.filter((e) => e.employmentType === "temporary").length,
          employeesPermanent: employees.filter((e) => e.employmentType === "permanent").length,
          openTasks: tasks.filter((t) => t.status === "todo" || t.status === "in_progress").length,
          pendingLeave: leaveRequests.filter((r) => r.status === "pending").length
        });

        setRecents({
          employees: topN(employees),
          tasks: topN(tasks),
          leaveRequests: topN(leaveRequests)
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = stats && [
    {
      to: "/admin/employees",
      icon: Users,
      value: stats.employeesTotal,
      label: "Employees",
      meta: `${stats.employeesTemporary} temporary · ${stats.employeesPermanent} permanent`
    },
    { to: "/admin/tasks", icon: ListChecks, value: stats.openTasks, label: "Open tasks" },
    { to: "/admin/leave", icon: CalendarClock, value: stats.pendingLeave, label: "Pending leave requests" },
    { to: "/admin/departments", icon: Building2, value: stats.departments, label: "Departments" }
  ];

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Quick overview of the HR workspace.</p>
        </div>
      </header>

      {error && <p className="admin-form-error">{error}</p>}

      {loading ? (
        <p className="admin-analytics-loading">Loading dashboard…</p>
      ) : (
        <>
          <div className="admin-analytics-stats admin-dashboard-stats">
            {cards.map(({ to, icon: Icon, value, label, meta }) => (
              <Link key={to} to={to} className="admin-analytics-stat-card admin-dashboard-stat-card">
                <Icon size={22} />
                <div>
                  <span className="admin-analytics-stat-value">{value}</span>
                  <span className="admin-analytics-stat-label">{label}</span>
                  {meta && <span className="admin-analytics-stat-meta">{meta}</span>}
                </div>
              </Link>
            ))}
          </div>

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Clock size={18} /> Recent activity
                </h3>
                <p>Latest updates across employees, tasks, and leave.</p>
              </div>
            </div>

            <div className="admin-dashboard-recents">
              <div className="admin-dashboard-recent-panel">
                <h4>Recent employees</h4>
                {recents.employees.length === 0 ? (
                  <p className="admin-empty">No employees yet.</p>
                ) : (
                  <ul className="admin-dashboard-recent-list">
                    {recents.employees.map((e) => (
                      <li key={e._id}>
                        <Link to="/admin/employees">
                          <span>{e.fullName}</span>
                          <span className="admin-badge">{EMPLOYEE_STATUS_LABELS[e.status] || e.status}</span>
                        </Link>
                        <span className="admin-dashboard-recent-time">{timeAgo(e.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="admin-dashboard-recent-panel">
                <h4>Recent tasks</h4>
                {recents.tasks.length === 0 ? (
                  <p className="admin-empty">No tasks yet.</p>
                ) : (
                  <ul className="admin-dashboard-recent-list">
                    {recents.tasks.map((t) => (
                      <li key={t._id}>
                        <Link to="/admin/tasks">
                          <span>{t.title}</span>
                          <span className="admin-badge">{t.status}</span>
                        </Link>
                        <span className="admin-dashboard-recent-time">{timeAgo(t.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="admin-dashboard-recent-panel">
                <h4>Recent leave requests</h4>
                {recents.leaveRequests.length === 0 ? (
                  <p className="admin-empty">No leave requests yet.</p>
                ) : (
                  <ul className="admin-dashboard-recent-list">
                    {recents.leaveRequests.map((r) => (
                      <li key={r._id}>
                        <Link to="/admin/leave">
                          <span>{r.employee?.fullName || "Employee"}</span>
                          <span className="admin-badge">{r.status}</span>
                        </Link>
                        <span className="admin-dashboard-recent-time">{timeAgo(r.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
