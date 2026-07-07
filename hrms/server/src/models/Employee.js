import mongoose from "mongoose";

const STATUSES = [
  "draft",
  "interviewing",
  "selected",
  "documents_requested",
  "documents_under_review",
  "documents_rejected",
  "documents_verified",
  "offer_sent",
  "offer_accepted",
  "offer_rejected",
  "offer_expired",
  "onboarding",
  "onboarding_completed",
  "permanent",
  "resigned",
  "terminated"
];

const resignationSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ["none", "pending", "approved", "rejected", "withdrawn"], default: "none" },
    reason: { type: String, default: "", trim: true },
    lastWorkingDay: { type: Date, default: null },
    requestedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewNote: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: "" },
    changedBy: { type: String, enum: ["hr", "employee", "system"], required: true },
    changedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const onboardingItemSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  },
  { _id: false }
);

const bankDetailsSchema = new mongoose.Schema(
  {
    accountHolderName: { type: String, default: "", trim: true },
    accountNumber: { type: String, default: "", trim: true },
    ifscCode: { type: String, default: "", trim: true, uppercase: true },
    bankName: { type: String, default: "", trim: true },
    branchName: { type: String, default: "", trim: true }
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: { type: String, unique: true, sparse: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    workEmail: { type: String, default: "", lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, default: null },
    mustSetPassword: { type: Boolean, default: false },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    employmentType: { type: String, enum: ["temporary", "permanent"], default: "temporary" },
    status: { type: String, enum: STATUSES, default: "draft" },
    position: { type: String, default: "", trim: true },
    joiningDate: { type: Date, default: null },
    ctc: { type: String, default: "", trim: true },
    workLocation: { type: String, default: "", trim: true },
    probationMonths: { type: Number, default: null },
    reportingManagerName: { type: String, default: "", trim: true },
    offerLetterUrl: { type: String, default: "" },
    joiningLetterUrl: { type: String, default: "" },
    offerLetterDraftUrl: { type: String, default: "" },
    joiningLetterDraftUrl: { type: String, default: "" },
    offerAcceptedAt: { type: Date, default: null },
    offerRejectedAt: { type: Date, default: null },
    offerRejectionReason: { type: String, default: "", trim: true },
    suspended: { type: Boolean, default: false },
    suspendedAt: { type: Date, default: null },
    resignation: { type: resignationSchema, default: () => ({}) },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    resignedAt: { type: Date, default: null },
    terminatedAt: { type: Date, default: null },
    terminationReason: { type: String, default: "", trim: true },
    onboardingChecklist: { type: [onboardingItemSchema], default: [] },
    onboardingLevel: { type: Number, enum: [1, 2, 3], default: null },
    isTeamLead: { type: Boolean, default: false },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] }
  },
  { timestamps: true }
);

employeeSchema.index({ status: 1, createdAt: -1 });

export const EMPLOYEE_STATUSES = STATUSES;
export default mongoose.model("Employee", employeeSchema);
