import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { employeeNotifications } from "../../lib/api";

const STATUS_LABELS = {
  draft: "Draft",
  documents_requested: "Documents requested",
  documents_under_review: "Documents under review",
  documents_rejected: "Documents rejected — action needed",
  documents_verified: "Documents verified",
  offer_sent: "Offer sent",
  offer_accepted: "Offer accepted",
  onboarding: "Onboarding in progress",
  onboarding_completed: "Onboarding completed",
  permanent: "Permanent employee"
};

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

const PortalDashboardPage = () => {
  const { employee } = useEmployeeAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeNotifications()
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Welcome, {employee?.fullName}</h1>
          <p>
            Current status: <strong>{STATUS_LABELS[employee?.status] || employee?.status}</strong> ·{" "}
            {employee?.employmentType === "permanent" ? "Permanent employee" : "Temporary employee"}
          </p>
        </div>
      </header>

      <h2 className="admin-careers-apps-heading">Status history</h2>
      {employee?.statusHistory?.length ? (
        <div className="admin-applications-list">
          {[...employee.statusHistory].reverse().map((entry, idx) => (
            <article key={idx} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>{STATUS_LABELS[entry.status] || entry.status}</strong>
                <p>{entry.note}</p>
                <span>{formatDate(entry.changedAt)}</span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="admin-empty">No status changes yet.</p>
      )}

      <h2 className="admin-careers-apps-heading">
        <Bell size={16} /> Notifications
      </h2>
      {loading ? (
        <p>Loading…</p>
      ) : notifications.length === 0 ? (
        <p className="admin-empty">No notifications yet.</p>
      ) : (
        <div className="admin-applications-list">
          {notifications.map((n) => (
            <article key={n._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <p>{n.message}</p>
                <span>{formatDate(n.createdAt)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalDashboardPage;
