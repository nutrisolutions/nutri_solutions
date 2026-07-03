import mongoose from "mongoose";

const companyDocumentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    type: { type: String, enum: ["appraisal_letter", "payslip"], required: true },
    label: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    periodMonth: { type: Number, min: 1, max: 12, default: null },
    periodYear: { type: Number, default: null },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }
  },
  { timestamps: true }
);

companyDocumentSchema.index({ employee: 1, type: 1, periodYear: -1, periodMonth: -1 });

export default mongoose.model("CompanyDocument", companyDocumentSchema);
