import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import Conversation from "../models/Conversation.js";
import {
  findOrCreateDm,
  getMessagesFor,
  isMember,
  listConversationsFor,
  markConversationRead,
  sendMessage
} from "../services/chatService.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

export const getDirectory = async (req, res) => {
  try {
    const [employees, admins] = await Promise.all([
      Employee.find({ suspended: { $ne: true } }).select("fullName email department").populate("department", "name"),
      Admin.find().select("name email role")
    ]);

    const directory = [
      ...employees
        .filter((e) => String(e._id) !== String(req.identity.id) || req.identity.kind !== "employee")
        .map((e) => ({
          id: e._id,
          kind: "employee",
          name: e.fullName,
          email: e.email,
          subtitle: e.department?.name || "No department"
        })),
      ...admins
        .filter((a) => String(a._id) !== String(req.identity.id) || req.identity.kind !== "admin")
        .map((a) => ({ id: a._id, kind: "admin", name: a.name, email: a.email, subtitle: "Admin" }))
    ];

    return res.json({ directory });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listConversations = async (req, res) => {
  try {
    const conversations = await listConversationsFor(req.identity);
    return res.json({ conversations });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const startDm = async (req, res) => {
  try {
    const { id, kind, name } = req.body;
    if (!id || !kind || !name) return res.status(400).json({ message: "id, kind, and name are required" });
    if (String(id) === String(req.identity.id) && kind === req.identity.kind) {
      return res.status(400).json({ message: "You cannot start a conversation with yourself" });
    }

    const conversation = await findOrCreateDm(req.identity, { id, kind, name });
    return res.status(201).json({ conversation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(conversation, req.identity)) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    const messages = await getMessagesFor(conversation._id, { before: req.query.before });
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const postMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(conversation, req.identity)) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    const message = await sendMessage(req.identity, conversation, { body: req.body.body || "" });
    return res.status(201).json({ message });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const postAttachmentMessage = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(conversation, req.identity)) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let upload;
    try {
      upload = await uploadBufferToCloudinary(req.file.buffer, {
        folder: `nutri-solutions/chat/${conversation._id}`,
        filename: req.file.originalname
      });
    } catch (uploadError) {
      return res.status(502).json({ message: `Upload failed: ${uploadError.message}` });
    }

    const type = req.file.mimetype.startsWith("image/") ? "image" : "file";
    const message = await sendMessage(req.identity, conversation, {
      body: req.body.caption || "",
      type,
      attachment: {
        url: upload.secure_url,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size
      }
    });

    return res.status(201).json({ message });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(conversation, req.identity)) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    await markConversationRead(req.identity, conversation);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
