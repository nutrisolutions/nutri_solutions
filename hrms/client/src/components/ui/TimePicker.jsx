import ReactDatePicker from "react-datepicker";
import { Clock } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";

const pad = (n) => String(n).padStart(2, "0");

const toDate = (value) => {
  if (!value) return null;
  const [h, m] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
};

const toValue = (date) => (date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : "");

const TimePicker = ({ value, onChange, required, placeholder, timeIntervals = 15 }) => (
  <div className="ui-datepicker-wrap">
    <Clock size={16} className="ui-datepicker-icon" />
    <ReactDatePicker
      selected={toDate(value)}
      onChange={(date) => onChange(toValue(date))}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={timeIntervals}
      timeCaption="Time"
      dateFormat="h:mm aa"
      className="ui-datepicker-input"
      placeholderText={placeholder || "Select time"}
      autoComplete="off"
      required={required}
    />
  </div>
);

export default TimePicker;
