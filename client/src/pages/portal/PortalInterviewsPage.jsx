import { useEffect, useState } from "react";
import { CalendarClock, Video } from "lucide-react";
import { employeeMyInterviews } from "../../lib/api";
import { INTERVIEW_STATUS_META, formatDate } from "../../lib/employeeStatus";

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

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Video size={18} /> Interview rounds
            </h3>
            <p>{interviews.length ? `${interviews.length} round(s) scheduled` : "Nothing scheduled yet"}</p>
          </div>
        </div>

        {loading ? (
          <p>Loading…</p>
        ) : interviews.length === 0 ? (
          <p className="admin-empty">No interviews scheduled yet. HR will notify you once one is set up.</p>
        ) : (
          <div className="employee-doc-grid">
            {interviews.map((iv) => (
              <div key={iv._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>
                    <CalendarClock size={15} /> Round {iv.round}
                  </strong>
                  <span className={`status-pill status-pill--${INTERVIEW_STATUS_META[iv.status]?.pill || "neutral"}`}>
                    {INTERVIEW_STATUS_META[iv.status]?.label || iv.status}
                  </span>
                </div>
                <p>
                  {formatDate(iv.scheduledAt)} · {iv.durationMinutes} min
                </p>
                {iv.joinUrl && iv.status === "scheduled" && (
                  <a className="btn btn-primary btn-sm" href={iv.joinUrl} target="_blank" rel="noreferrer">
                    Join Jitsi meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalInterviewsPage;
