import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["admin", "employee"], required: true },
    name: { type: String, required: true }
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["dm", "group"], required: true },
    title: { type: String, default: "" },
    members: { type: [participantSchema], default: [] },
    createdBy: { type: participantSchema, default: null },
    lastMessageAt: { type: Date, default: null },
    lastMessagePreview: { type: String, default: "" }
  },
  { timestamps: true }
);

// Fast lookup for "does a DM between these two already exist" and for a
// member's inbox list, sorted by recent activity.
conversationSchema.index({ type: 1, "members.id": 1 });
conversationSchema.index({ "members.id": 1, lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);
