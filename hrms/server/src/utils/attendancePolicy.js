export const REQUIRED_DAILY_HOURS = 8;
export const IST_CHECKOUT_HOUR = 18; // 6pm IST

const IST_OFFSET_MINUTES = 5 * 60 + 30;

// Returns the current date as "YYYY-MM-DD" in IST, regardless of server timezone.
export const istDateString = (date = new Date()) => {
  const istMs = date.getTime() + IST_OFFSET_MINUTES * 60 * 1000;
  const ist = new Date(istMs);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

// Returns the UTC Date instant corresponding to 6:00 PM IST on the given "YYYY-MM-DD" date.
export const istCheckoutInstant = (dateStr) => {
  const [y, m, d] = dateStr.split("-").map(Number);
  const utcMs = Date.UTC(y, m - 1, d, IST_CHECKOUT_HOUR, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
};

export const hoursBetween = (start, end) => {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.round((ms / (1000 * 60 * 60)) * 100) / 100;
  return Math.max(0, hours);
};
