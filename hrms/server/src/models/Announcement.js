import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    audience: { type: String, enum: ["all", "team", "employees"], required: true },
    team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
    employees: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], default: [] },
    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      kind: { type: String, enum: ["admin", "employee"], required: true }
    }
  },
  { timestamps: true }
);

announcementSchema.index({ createdAt: -1 });

export default mongoose.model("Announcement", announcementSchema);
