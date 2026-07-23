/** Local calendar date as YYYY-MM-DD (avoids UTC shift from toISOString). */
export const toLocalDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Start of local calendar day for a Date or YYYY-MM-DD string. */
export const startOfLocalDay = (value = new Date()) => {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Inclusive range of local date keys ending today. */
export const localDateRangeKeys = (days) => {
  const keys = [];
  const cursor = startOfLocalDay(new Date());
  cursor.setDate(cursor.getDate() - (days - 1));

  for (let i = 0; i < days; i++) {
    keys.push(toLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
};

/** IANA timezone for MongoDB $dateToString (server local time). */
export const mongoTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/** MongoDB expression: bucket createdAt into local calendar days. */
export const mongoLocalDayExpr = (dateField = "$createdAt") => ({
  $dateToString: {
    format: "%Y-%m-%d",
    date: dateField,
    timezone: mongoTimezone()
  }
});
