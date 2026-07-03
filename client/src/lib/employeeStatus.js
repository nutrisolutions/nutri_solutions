export const STATUS_META = {
  draft: { label: "Draft", pill: "neutral" },
  interviewing: { label: "Interviewing", pill: "info" },
  selected: { label: "Selected", pill: "success" },
  documents_requested: { label: "Documents requested", pill: "info" },
  documents_under_review: { label: "Documents under review", pill: "progress" },
  documents_rejected: { label: "Documents rejected", pill: "danger" },
  documents_verified: { label: "Documents verified", pill: "success" },
  offer_sent: { label: "Offer sent", pill: "info" },
  offer_accepted: { label: "Offer accepted", pill: "progress" },
  onboarding: { label: "Onboarding", pill: "warning" },
  onboarding_completed: { label: "Onboarding completed", pill: "success" },
  permanent: { label: "Permanent", pill: "success" }
};

export const STATUS_LABELS = Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]));

export const DOC_STATUS_META = {
  pending: { label: "Pending", pill: "neutral" },
  uploaded: { label: "Uploaded", pill: "info" },
  verified: { label: "Verified", pill: "success" },
  rejected: { label: "Rejected", pill: "danger" }
};

export const INTERVIEW_STATUS_META = {
  scheduled: { label: "Scheduled", pill: "info" },
  completed: { label: "Completed", pill: "success" },
  cancelled: { label: "Cancelled", pill: "danger" }
};

export const STEPPER_STEPS = [
  { key: "draft", label: "Draft" },
  { key: "interviewing", label: "Interviews" },
  { key: "selected", label: "Selected" },
  { key: "documents", label: "Documents" },
  { key: "offer_sent", label: "Offer" },
  { key: "offer_accepted", label: "Accepted" },
  { key: "onboarding", label: "Onboarding" },
  { key: "onboarding_completed", label: "Completed" },
  { key: "permanent", label: "Permanent" }
];

export const STATUS_TO_STEP = {
  draft: "draft",
  interviewing: "interviewing",
  selected: "selected",
  documents_requested: "documents",
  documents_under_review: "documents",
  documents_rejected: "documents",
  documents_verified: "documents",
  offer_sent: "offer_sent",
  offer_accepted: "offer_accepted",
  onboarding: "onboarding",
  onboarding_completed: "onboarding_completed",
  permanent: "permanent"
};

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    : "—";
