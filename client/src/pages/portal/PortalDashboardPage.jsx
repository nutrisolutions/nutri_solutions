import { Fragment, useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, CalendarDays, CheckCircle2, Clock, FileText, Home, ListChecks, Mail, Phone } from "lucide-react";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { employeeCalendarEvents, employeeMyCompanyDocuments, employeeMyTasks } from "../../lib/api";
import { STATUS_LABELS, STATUS_TO_STEP, STEPPER_STEPS, formatDate, initials } from "../../lib/employeeStatus";
import MonthCalendar from "../../components/shared/MonthCalendar";

const PRIORITY_PILL = {
  low: "status-pill--neutral",
  medium: "status-pill--info",
  high: "status-pill--warning"
};

const PortalDashboardPage = () => {
  const { employee } = useEmployeeAuth();
  const isPermanent = employee?.employmentType === "permanent";
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [companyDocuments, setCompanyDocuments] = useState([]);

  const loadCalendar = useCallback(async () => {
    if (!isPermanent) return;
    try {
      setCalendarEvents(await employeeCalendarEvents(month + 1, year));
    } catch {
      setCalendarEvents([]);
    }
  }, [month, year, isPermanent]);

  useEffect(() => {
    loadCalendar();
  }, [loadCalendar]);

  useEffect(() => {
    if (!isPermanent) return;
    employeeMyTasks()
      .then(setTasks)
      .catch(() => setTasks([]));
    employeeMyCompanyDocuments()
      .then(setCompanyDocuments)
      .catch(() => setCompanyDocuments([]));
  }, [isPermanent]);

  const goPrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const currentIndex = STEPPER_STEPS.findIndex((s) => s.key === STATUS_TO_STEP[employee?.status]);

  const upcomingEvents = [...calendarEvents]
    .filter((ev) => new Date(ev.date) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const pendingTasks = tasks.filter((t) => t.status !== "done").slice(0, 4);
  const recentDocuments = [...companyDocuments]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your profile, status, and recent activity.</p>
        </div>
      </header>

      <div className="employee-detail">
        <div className="employee-header-card">
          <div className="employee-header-identity">
            <div className="employee-avatar">{initials(employee?.fullName)}</div>
            <div className="employee-header-text">
              <h2>{employee?.fullName}</h2>
              <div className="employee-contact-row">
                <span>
                  <Mail size={14} /> {employee?.email}
                </span>
                {employee?.phone && (
                  <span>
                    <Phone size={14} /> {employee.phone}
                  </span>
                )}
                {employee?.department?.name && (
                  <span>
                    <Building2 size={14} /> {employee.department.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {!isPermanent && (
          <nav className="employee-stepper" aria-label="Your lifecycle progress">
            {STEPPER_STEPS.map((step, idx) => {
              const isDone = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <Fragment key={step.key}>
                  <div className={`employee-stepper-step ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}>
                    <span className="employee-stepper-dot">{isDone ? <CheckCircle2 size={13} /> : idx + 1}</span>
                    <span className="employee-stepper-label">{step.label}</span>
                  </div>
                  {idx < STEPPER_STEPS.length - 1 && (
                    <div className={`employee-stepper-line ${isDone ? "is-done" : ""}`} />
                  )}
                </Fragment>
              );
            })}
          </nav>
        )}

        {isPermanent && (
          <div className="portal-dashboard-grid">
            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <ListChecks size={18} /> Pending tasks
                  </h3>
                  <p>{pendingTasks.length ? `${pendingTasks.length} awaiting action` : "You're all caught up"}</p>
                </div>
                <Link to="/portal/tasks" className="employee-docs-toggle">
                  View all
                </Link>
              </div>
              {pendingTasks.length === 0 ? (
                <p className="admin-empty">No pending tasks.</p>
              ) : (
                <div className="employee-doc-grid">
                  {pendingTasks.map((task) => (
                    <div key={task._id} className="employee-doc-card">
                      <div className="employee-doc-card-head">
                        <strong>{task.title}</strong>
                        <span className={`status-pill ${PRIORITY_PILL[task.priority] || "status-pill--neutral"}`}>
                          {task.priority}
                        </span>
                      </div>
                      {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                      <span className="admin-badge">{task.status.replace("_", " ")}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="employee-section">
              <div className="employee-section-head">
                <div>
                  <h3>
                    <FileText size={18} /> Latest documents
                  </h3>
                  <p>Recently generated payslips and appraisal letters.</p>
                </div>
                <Link to="/portal/documents" className="employee-docs-toggle">
                  View all
                </Link>
              </div>
              {recentDocuments.length === 0 ? (
                <p className="admin-empty">No documents generated yet.</p>
              ) : (
                <div className="employee-doc-grid">
                  {recentDocuments.map((doc) => (
                    <div key={doc._id} className="employee-doc-card">
                      <div className="employee-doc-card-head">
                        <strong>
                          <FileText size={15} /> {doc.label}
                        </strong>
                        <span className="admin-badge">{doc.type === "payslip" ? "Payslip" : "Appraisal"}</span>
                      </div>
                      <a className="employee-doc-link" href={doc.fileUrl} target="_blank" rel="noreferrer">
                        View file
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {isPermanent && (
          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <CalendarDays size={18} /> Calendar
                </h3>
                <p>Holidays and work-from-home days marked by HR.</p>
              </div>
            </div>
            <div className="admin-calendar-layout">
              <MonthCalendar month={month} year={year} events={calendarEvents} onPrevMonth={goPrevMonth} onNextMonth={goNextMonth} />
              <div className="employee-doc-grid">
                {upcomingEvents.length === 0 ? (
                  <p className="admin-empty">No upcoming holidays or WFH days marked.</p>
                ) : (
                  upcomingEvents.map((ev) => (
                    <div key={ev._id} className="employee-doc-card">
                      <div className="employee-doc-card-head">
                        <strong>
                          {ev.type === "wfh" ? <Home size={15} /> : <CalendarDays size={15} />} {ev.title}
                        </strong>
                        <span className={`admin-badge ${ev.type === "holiday" ? "admin-badge--danger" : "admin-badge--ok"}`}>
                          {ev.type === "holiday" ? "Holiday" : "WFH"}
                        </span>
                      </div>
                      <p>{new Date(ev.date).toLocaleDateString(undefined, { weekday: "long", day: "2-digit", month: "short" })}</p>
                      {ev.description && <p>{ev.description}</p>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {!isPermanent && (
          <section className="employee-section">
            <div className="employee-section-head">
              <div>
                <h3>
                  <Clock size={18} /> Status history
                </h3>
                <p>How your journey with us has progressed so far.</p>
              </div>
            </div>
            {employee?.statusHistory?.length ? (
              <div className="employee-timeline">
                {[...employee.statusHistory].reverse().map((entry, idx) => (
                  <div key={idx} className="employee-timeline-item">
                    <div className="employee-timeline-dot" />
                    <div className="employee-timeline-body">
                      <p>{STATUS_LABELS[entry.status] || entry.status}</p>
                      <span>
                        {entry.note} · {formatDate(entry.changedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="admin-empty">No status changes yet.</p>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default PortalDashboardPage;
