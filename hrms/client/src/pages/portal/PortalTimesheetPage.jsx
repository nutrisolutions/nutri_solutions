import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Send } from "lucide-react";
import { employeeMyTimesheet, employeeSubmitTimesheet } from "../../lib/api";

const todayStr = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short", year: "numeric" });

const PortalTimesheetPage = () => {
  const [entries, setEntries] = useState([]);
  const [workUpdate, setWorkUpdate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = todayStr();
  const todaysEntry = entries.find((e) => e.date === today);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await employeeMyTimesheet();
      setEntries(list);
      const existing = list.find((e) => e.date === today);
      setWorkUpdate(existing?.workUpdate || "");
    } catch {
      setMessage("Failed to load timesheet");
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
    if (!workUpdate.trim()) {
      setMessage("Please describe today's work before submitting");
      return;
    }
    setSubmitting(true);
    try {
      await employeeSubmitTimesheet(workUpdate.trim());
      setMessage(todaysEntry ? "Today's update saved" : "Work update submitted");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit work update");
    } finally {
      setSubmitting(false);
    }
  };

  const history = entries;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Timesheet</h1>
          <p>Log a short update of your work every day.</p>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <CalendarClock size={18} /> Today's update
            </h3>
          </div>
        </div>
        <form className="admin-form-card" onSubmit={handleSubmit} style={{ marginBottom: 0 }}>
          <div className="admin-form-grid">
            <label className="admin-form-full">
              What did you work on today? *
              <textarea
                rows={4}
                value={workUpdate}
                onChange={(e) => setWorkUpdate(e.target.value)}
                placeholder="e.g. Implemented the login page, fixed the payment bug, attended sprint planning…"
                required
              />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              <Send size={16} /> {submitting ? "Saving…" : todaysEntry ? "Update" : "Submit"}
            </button>
          </div>
        </form>
      </section>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <CalendarClock size={18} /> History
            </h3>
            <p>{history.length ? `${history.length} day(s) recorded` : "No previous updates yet"}</p>
          </div>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : history.length === 0 ? (
          <p className="admin-empty">No previous work updates yet.</p>
        ) : (
          <div className="employee-doc-grid">
            {history.map((e) => (
              <div key={e._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>{formatDate(e.date)}</strong>
                </div>
                <p>{e.workUpdate}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default PortalTimesheetPage;
