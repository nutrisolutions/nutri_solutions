import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["admin", "employee"], required: true },
    name: { type: String, required: true },
    joinedAt: { type: Date, default: null },
    leftAt: { type: Date, default: null }
  },
  { _id: false }
);

const callSessionSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    jitsiRoom: { type: String, required: true },
    startedBy: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      kind: { type: String, enum: ["admin", "employee"], required: true },
      name: { type: String, required: true }
    },
    participants: { type: [participantSchema], default: [] },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export default mongoose.model("CallSession", callSessionSchema);
