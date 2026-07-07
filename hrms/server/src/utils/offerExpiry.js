export const expireOfferIfNeeded = async (employee) => {
  if (employee.status !== "offer_sent" || !employee.joiningDate) return false;

  const endOfJoiningDay = new Date(employee.joiningDate);
  endOfJoiningDay.setHours(23, 59, 59, 999);
  if (new Date() <= endOfJoiningDay) return false;

  employee.status = "offer_expired";
  employee.statusHistory.push({
    status: "offer_expired",
    note: "Offer expired — no response received by the joining date",
    changedBy: "system",
    changedAt: new Date()
  });
  await employee.save();
  return true;
};

export const OFFER_BLOCKED_STATUSES = ["offer_expired", "resigned", "terminated"];

export const offerBlockedMessage = (status) => {
  if (status === "resigned") return "Your resignation has been processed. You no longer have portal access.";
  if (status === "terminated") return "Your employment has been terminated. Please contact HR.";
  return "Your offer has expired because no response was received by the joining date. Please contact HR.";
};

export const SUSPENDED_MESSAGE = "Your account has been suspended. Please contact HR.";
