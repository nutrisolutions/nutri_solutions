import { ChevronLeft, ChevronRight } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const MonthCalendar = ({ month, year, events = [], onPrevMonth, onNextMonth, onDayClick, selectedDate }) => {
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const eventsByDay = new Map();
  events.forEach((ev) => {
    const d = new Date(ev.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    if (!eventsByDay.has(day)) eventsByDay.set(day, []);
    eventsByDay.get(day).push(ev);
  });

  const cells = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day);

  return (
    <div className="month-calendar">
      <div className="month-calendar-header">
        <button type="button" className="month-calendar-nav" onClick={onPrevMonth} aria-label="Previous month">
          <ChevronLeft size={18} />
        </button>
        <strong>{firstOfMonth.toLocaleString(undefined, { month: "long", year: "numeric" })}</strong>
        <button type="button" className="month-calendar-nav" onClick={onNextMonth} aria-label="Next month">
          <ChevronRight size={18} />
        </button>
      </div>
      <div className="month-calendar-weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w}>{w}</span>
        ))}
      </div>
      <div className="month-calendar-grid">
        {cells.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} className="month-calendar-cell is-empty" />;
          const cellDate = new Date(year, month, day);
          const dayEvents = eventsByDay.get(day) || [];
          const isToday = isSameDay(cellDate, today);
          const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
          const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;
          const hasHoliday = dayEvents.some((e) => e.type === "holiday");
          const hasWfh = dayEvents.some((e) => e.type === "wfh");
          const title = dayEvents.length ? dayEvents.map((e) => e.title).join(", ") : isWeekend ? "Weekend" : undefined;
          return (
            <button
              type="button"
              key={day}
              className={`month-calendar-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""} ${
                hasHoliday ? "has-holiday" : ""
              } ${hasWfh ? "has-wfh" : ""} ${isWeekend ? "is-weekend" : ""}`}
              onClick={() => onDayClick?.(cellDate, dayEvents)}
              title={title}
            >
              <span className="month-calendar-date">{day}</span>
              {dayEvents.length > 0 && (
                <span className="month-calendar-dots">
                  {hasHoliday && <span className="month-calendar-dot month-calendar-dot--holiday" />}
                  {hasWfh && <span className="month-calendar-dot month-calendar-dot--wfh" />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="month-calendar-legend">
        <span>
          <span className="month-calendar-dot month-calendar-dot--holiday" /> Holiday
        </span>
        <span>
          <span className="month-calendar-dot month-calendar-dot--wfh" /> Work from home
        </span>
        <span>
          <span className="month-calendar-dot month-calendar-dot--weekend" /> Weekend
        </span>
      </div>
    </div>
  );
};

export default MonthCalendar;
