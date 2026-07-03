import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { employeeMyInterviews } from "../../lib/api";

const STATUS_BADGE = {
  scheduled: "admin-badge",
  completed: "admin-badge admin-badge--ok",
  cancelled: "admin-badge"
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

const PortalInterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    employeeMyInterviews()
      .then(setInterviews)
      .catch(() => setMessage("Failed to load interviews"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Interviews</h1>
          <p>Your scheduled interview rounds.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : interviews.length === 0 ? (
        <p className="admin-empty">No interviews scheduled yet.</p>
      ) : (
        <div className="admin-applications-list">
          {interviews.map((iv) => (
            <article key={iv._id} className="admin-application-card is-open">
              <div className="admin-application-card-body">
                <strong>
                  <CalendarClock size={16} /> Round {iv.round}
                </strong>
                <p>
                  {formatDate(iv.scheduledAt)} · {iv.durationMinutes} min
                </p>
                <p>
                  <span className={STATUS_BADGE[iv.status]}>{iv.status}</span>
                </p>
                {iv.teamsJoinUrl && iv.status === "scheduled" && (
                  <a className="btn btn-primary btn-sm" href={iv.teamsJoinUrl} target="_blank" rel="noreferrer">
                    Join Teams meeting
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortalInterviewsPage;
