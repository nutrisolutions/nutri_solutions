import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null }
  },
  { timestamps: true }
);

export default mongoose.model("Department", departmentSchema);
