import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, LogIn } from "lucide-react";
import { employeeCheckIn, employeeMyAttendance, employeeTodayAttendance } from "../../lib/api";

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true }) : "—";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });

const STATUS_LABEL = {
  open: "Checked in",
  checked_out: "Checked out",
  auto_checked_out: "Auto checked out at 6:00 PM"
};

const PortalAttendancePage = () => {
  const [today, setToday] = useState(null);
  const [liveHours, setLiveHours] = useState(0);
  const [short, setShort] = useState(false);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, records] = await Promise.all([employeeTodayAttendance(), employeeMyAttendance()]);
      setToday(todayRes.attendance);
      setLiveHours(todayRes.liveHoursWorked || 0);
      setShort(Boolean(todayRes.short));
      setHistory(records);
    } catch {
      setMessage("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!today || today.status !== "open") return undefined;
    const timer = setInterval(() => {
      const hours = Math.max(0, (Date.now() - new Date(today.checkInAt).getTime()) / (1000 * 60 * 60));
      setLiveHours(Math.round(hours * 100) / 100);
      setShort(hours < 8);
    }, 30000);
    return () => clearInterval(timer);
  }, [today]);

  const handleCheckIn = async () => {
    setMessage("");
    setCheckingIn(true);
    try {
      await employeeCheckIn();
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to check in");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Attendance</h1>
          <p>Check in once a day. You'll be automatically checked out at 6:00 PM IST.</p>
        </div>
        {!today && (
          <button type="button" className="btn btn-primary" onClick={handleCheckIn} disabled={checkingIn}>
            <LogIn size={18} /> {checkingIn ? "Checking in…" : "Check in"}
          </button>
        )}
      </header>

      {message && <p className="admin-message">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Clock3 size={18} /> Today
                </h3>
              </div>
            </div>
            {!today ? (
              <p className="admin-empty">You haven't checked in yet today.</p>
            ) : (
              <div className="admin-analytics-stats">
                <div className="admin-analytics-stat-card">
                  <LogIn size={22} />
                  <div>
                    <span className="admin-analytics-stat-value">{formatTime(today.checkInAt)}</span>
                    <span className="admin-analytics-stat-label">Checked in</span>
                  </div>
                </div>
                <div className="admin-analytics-stat-card">
                  <CheckCircle2 size={22} />
                  <div>
                    <span className="admin-analytics-stat-value">
                      {today.status === "open" ? "6:00 PM (pending)" : formatTime(today.checkOutAt)}
                    </span>
                    <span className="admin-analytics-stat-label">{STATUS_LABEL[today.status]}</span>
                  </div>
                </div>
                <div className="admin-analytics-stat-card">
                  <Clock3 size={22} />
                  <div>
                    <span className="admin-analytics-stat-value">{liveHours.toFixed(2)}h</span>
                    <span className="admin-analytics-stat-label">
                      {today.status === "open" ? "Hours so far" : "Hours worked"}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {short && (
              <p className="admin-message admin-message--warning">
                <AlertTriangle size={16} /> 8 hours working is not completed
                {today?.status === "open" ? " yet — keep going!" : " for this day."}
              </p>
            )}
          </section>

          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Clock3 size={18} /> History
                </h3>
                <p>{history.length ? `${history.length} day(s) recorded` : "No attendance history yet"}</p>
              </div>
            </div>
            {history.length === 0 ? (
              <p className="admin-empty">No attendance recorded yet.</p>
            ) : (
              <div className="employee-doc-grid">
                {history.map((r) => (
                  <div key={r._id} className="employee-doc-card">
                    <div className="employee-doc-card-head">
                      <strong>{formatDate(r.date)}</strong>
                      {r.short && (
                        <span className="status-pill status-pill--danger">
                          <AlertTriangle size={12} /> Short
                        </span>
                      )}
                    </div>
                    <p>
                      {formatTime(r.checkInAt)} – {formatTime(r.checkOutAt)}
                    </p>
                    <p>{r.hoursWorked.toFixed(2)}h worked</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default PortalAttendancePage;
