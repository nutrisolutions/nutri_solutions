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
  "onboarding",
  "onboarding_completed",
  "permanent"
];

const statusHistoryEntrySchema = new mongoose.Schema(
  {
    status: { type: String, enum: STATUSES, required: true },
    note: { type: String, default: "" },
    changedBy: { type: String, enum: ["hr", "employee"], required: true },
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

const employeeSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "JobApplication", default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    passwordHash: { type: String, default: null },
    mustSetPassword: { type: Boolean, default: false },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    employmentType: { type: String, enum: ["temporary", "permanent"], default: "temporary" },
    status: { type: String, enum: STATUSES, default: "draft" },
    position: { type: String, default: "", trim: true },
    joiningDate: { type: Date, default: null },
    offerLetterUrl: { type: String, default: "" },
    joiningLetterUrl: { type: String, default: "" },
    offerAcceptedAt: { type: Date, default: null },
    onboardingChecklist: { type: [onboardingItemSchema], default: [] },
    statusHistory: { type: [statusHistoryEntrySchema], default: [] },
    leaveBalances: {
      type: Map,
      of: Number,
      default: undefined
    }
  },
  { timestamps: true }
);

employeeSchema.index({ status: 1, createdAt: -1 });

export const EMPLOYEE_STATUSES = STATUSES;
export default mongoose.model("Employee", employeeSchema);
