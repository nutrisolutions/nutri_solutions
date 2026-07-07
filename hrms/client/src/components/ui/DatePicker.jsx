import ReactDatePicker from "react-datepicker";
import { CalendarDays } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const pad = (n) => String(n).padStart(2, "0");

const toDate = (value) => {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const toValue = (date) => (date ? `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` : "");

const DatePicker = ({ value, onChange, required, minDate, maxDate, placeholder }) => (
  <div className="ui-datepicker-wrap">
    <CalendarDays size={16} className="ui-datepicker-icon" />
    <ReactDatePicker
      selected={toDate(value)}
      onChange={(date) => onChange(toValue(date))}
      dateFormat="dd MMM yyyy"
      className="ui-datepicker-input"
      placeholderText={placeholder || "Select date"}
      minDate={minDate ? toDate(minDate) : undefined}
      maxDate={maxDate ? toDate(maxDate) : undefined}
      autoComplete="off"
      required={required}
    />
  </div>
);

export default DatePicker;
