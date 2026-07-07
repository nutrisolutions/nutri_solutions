export const ANNUAL_LEAVE_DAYS = 12;

export const dayCount = (start, end, halfDay) => {
  const ms = new Date(end) - new Date(start);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24)) + 1;
  return halfDay ? Math.max(days - 0.5, 0.5) : days;
};

/**
 * Sums approved leave for a given calendar year (by startDate), split into
 * paid days (within the annual entitlement) and LOP days (beyond it) —
 * both already resolved per-request at approval time, see reviewLeaveRequest.
 */
export const approvedTotalsForYear = async (LeaveRequest, employeeId, year, excludeRequestId) => {
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const filter = {
    employee: employeeId,
    status: "approved",
    startDate: { $gte: start, $lt: end }
  };
  if (excludeRequestId) filter._id = { $ne: excludeRequestId };

  const requests = await LeaveRequest.find(filter).select("days lopDays");
  return requests.reduce(
    (acc, r) => {
      const lop = r.lopDays || 0;
      acc.paidDays += (r.days || 0) - lop;
      acc.lopDays += lop;
      return acc;
    },
    { paidDays: 0, lopDays: 0 }
  );
};
