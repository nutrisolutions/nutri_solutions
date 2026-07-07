import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CalendarClock, Clock3 } from "lucide-react";
import { adminAttendance } from "../../lib/api";
import { initials } from "../../lib/employeeStatus";
import DatePicker from "../../components/ui/DatePicker";

const todayStr = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", hour12: true }) : "—";

const STATUS_LABEL = {
  open: "Checked in",
  checked_out: "Checked out",
  auto_checked_out: "Auto checked out"
};

const AdminAttendancePage = () => {
  const [date, setDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRecords(await adminAttendance.list({ date }));
    } catch {
      setMessage("Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    load();
  }, [load]);

  const shortCount = records.filter((r) => r.short).length;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Attendance</h1>
          <p>Daily check-in/check-out records. Employees are auto checked-out at 6:00 PM IST.</p>
        </div>
        <div style={{ width: "220px" }}>
          <DatePicker value={date} onChange={setDate} />
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <div className="admin-analytics-stats">
        <div className="admin-analytics-stat-card">
          <CalendarClock size={22} />
          <div>
            <span className="admin-analytics-stat-value">{records.length}</span>
            <span className="admin-analytics-stat-label">Checked in this day</span>
          </div>
        </div>
        <div className="admin-analytics-stat-card">
          <AlertTriangle size={22} />
          <div>
            <span className="admin-analytics-stat-value">{shortCount}</span>
            <span className="admin-analytics-stat-label">Under 8 hours</span>
          </div>
        </div>
      </div>

      <section className="employee-section">
        <div className="employee-section-head">
          <div>
            <h3>
              <Clock3 size={18} /> Records
            </h3>
          </div>
        </div>
        {loading ? (
          <p>Loading…</p>
        ) : records.length === 0 ? (
          <p className="admin-empty">No attendance records for this day.</p>
        ) : (
          <div className="employee-doc-grid">
            {records.map((r) => (
              <div key={r._id} className="employee-doc-card">
                <div className="employee-doc-card-head">
                  <strong>
                    <span className="employee-avatar employee-avatar--sm">{initials(r.employee?.fullName)}</span>
                    {r.employee?.fullName}
                  </strong>
                  {r.short && (
                    <span className="status-pill status-pill--danger">
                      <AlertTriangle size={12} /> Short
                    </span>
                  )}
                </div>
                <p>
                  {formatTime(r.checkInAt)} – {formatTime(r.checkOutAt)}
                </p>
                <p>
                  {r.hoursWorked.toFixed(2)}h · {STATUS_LABEL[r.status]}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminAttendancePage;
