import mongoose from "mongoose";

const readReceiptSchema = new mongoose.Schema(
  {
    id: { type: mongoose.Schema.Types.ObjectId, required: true },
    kind: { type: String, enum: ["admin", "employee"], required: true },
    readAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const attachmentSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    fileName: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    size: { type: Number, default: 0 }
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true, index: true },
    sender: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      kind: { type: String, enum: ["admin", "employee"], required: true },
      name: { type: String, required: true }
    },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    body: { type: String, default: "", trim: true },
    attachment: { type: attachmentSchema, default: null },
    readBy: { type: [readReceiptSchema], default: [] }
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export default mongoose.model("Message", messageSchema);
