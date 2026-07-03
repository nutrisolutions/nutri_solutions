import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", default: null },
    status: { type: String, enum: ["todo", "in_progress", "done", "cancelled"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
    completedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

taskSchema.index({ assignedTo: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
