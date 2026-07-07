import mongoose from "mongoose";

const employeeNotificationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
    audience: { type: String, enum: ["hr", "employee"], required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("EmployeeNotification", employeeNotificationSchema);
