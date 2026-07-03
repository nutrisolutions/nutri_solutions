import mongoose from "mongoose";

const historyEntrySchema = new mongoose.Schema(
  {
    fileUrl: { type: String, required: true },
    status: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const employeeDocumentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    label: { type: String, required: true, trim: true },
    labelKey: { type: String, required: true, lowercase: true, trim: true },
    status: { type: String, enum: ["pending", "uploaded", "verified", "rejected"], default: "pending" },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    history: { type: [historyEntrySchema], default: [] },
    requestedAt: { type: Date, default: Date.now },
    uploadedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: "" }
  },
  { timestamps: true }
);

employeeDocumentSchema.index({ employee: 1, labelKey: 1 }, { unique: true });

export default mongoose.model("EmployeeDocument", employeeDocumentSchema);
