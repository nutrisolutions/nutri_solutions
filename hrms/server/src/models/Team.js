import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    members: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);
