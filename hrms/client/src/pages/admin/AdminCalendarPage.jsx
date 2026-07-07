import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Home, Plus, Trash2 } from "lucide-react";
import { adminCalendar } from "../../lib/api";
import { calendarEventSchema } from "../../lib/validation";
import { firstZodError } from "../../lib/zodHelpers";
import MonthCalendar from "../../components/shared/MonthCalendar";
import Modal from "../../components/ui/Modal";
import DatePicker from "../../components/ui/DatePicker";

const toDateInput = (date) => {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
};

const emptyForm = (dateStr) => ({ date: dateStr, type: "holiday", title: "", description: "" });

const AdminCalendarPage = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(now);
  const [form, setForm] = useState(emptyForm(toDateInput(now)));
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEvents(await adminCalendar.list(month + 1, year));
    } catch {
      setMessage("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

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

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setForm(emptyForm(toDateInput(date)));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    const validationError = firstZodError(calendarEventSchema, form);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    try {
      await adminCalendar.create(form);
      setMessage("Event added");
      setShowForm(false);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add event");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this event?")) return;
    try {
      await adminCalendar.remove(id);
      setMessage("Event removed");
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove event");
    }
  };

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [events]
  );

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Calendar</h1>
          <p>Mark holidays and work-from-home days so employees can see them on their dashboard.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setSelectedDate(new Date());
            setForm(emptyForm(toDateInput(new Date())));
            setShowForm(true);
          }}
        >
          <Plus size={18} /> Add event
        </button>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New calendar event">
        <form className="admin-form-card" onSubmit={handleSubmit}>
          <h2>New calendar event</h2>
          <div className="admin-form-grid">
            <label>
              Date *
              <DatePicker value={form.date} onChange={(date) => setForm({ ...form, date })} required />
            </label>
            <label>
              Type *
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="holiday">Holiday</option>
                <option value="wfh">Work from home</option>
              </select>
            </label>
            <label>
              Title *
              <input
                placeholder="e.g. Independence Day"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </label>
            <label className="admin-form-full">
              Description (optional)
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </label>
          </div>
          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary">
              Save
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="admin-calendar-layout">
        <MonthCalendar
          month={month}
          year={year}
          events={events}
          onPrevMonth={goPrevMonth}
          onNextMonth={goNextMonth}
          onDayClick={handleDayClick}
          selectedDate={selectedDate}
        />

        <section className="employee-section admin-calendar-list">
          <div className="employee-section-head">
            <div>
              <h3>
                <CalendarDays size={18} /> Events this month
              </h3>
              <p>{sortedEvents.length ? `${sortedEvents.length} event(s)` : "No events yet"}</p>
            </div>
          </div>
          {loading ? (
            <p>Loading…</p>
          ) : sortedEvents.length === 0 ? (
            <p className="admin-empty">No holidays or work-from-home days marked for this month.</p>
          ) : (
            <div className="employee-doc-grid">
              {sortedEvents.map((ev) => (
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
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => handleDelete(ev._id)}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminCalendarPage;
