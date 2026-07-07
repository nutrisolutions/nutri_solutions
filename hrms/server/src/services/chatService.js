import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getIo } from "../realtime/socket.js";

const sameMember = (a, b) => String(a.id) === String(b.id) && a.kind === b.kind;

export const isMember = (conversation, identity) => conversation.members.some((m) => sameMember(m, identity));

export const findOrCreateDm = async (identity, other) => {
  const existing = await Conversation.findOne({
    type: "dm",
    "members.id": { $all: [identity.id, other.id] }
  });
  if (existing && existing.members.length === 2 && isMember(existing, identity) && isMember(existing, other)) {
    return existing;
  }

  return Conversation.create({
    type: "dm",
    members: [identity, other],
    createdBy: identity
  });
};

export const listConversationsFor = async (identity) => {
  const conversations = await Conversation.find({ "members.id": identity.id, "members.kind": identity.kind }).sort({
    lastMessageAt: -1,
    createdAt: -1
  });

  const unreadCounts = await Promise.all(
    conversations.map((c) =>
      Message.countDocuments({
        conversation: c._id,
        "sender.id": { $ne: identity.id },
        "readBy.id": { $ne: identity.id }
      })
    )
  );

  return conversations.map((c, i) => ({ ...c.toObject(), unreadCount: unreadCounts[i] }));
};

export const getMessagesFor = async (conversationId, { before, limit = 50 } = {}) => {
  const filter = { conversation: conversationId };
  if (before) filter.createdAt = { $lt: new Date(before) };

  const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(limit);
  return messages.reverse();
};

export const sendMessage = async (identity, conversation, { body = "", attachment = null, type = "text" } = {}) => {
  const trimmed = body.trim();
  if (!trimmed && !attachment) {
    throw Object.assign(new Error("Message body or attachment is required"), { status: 400 });
  }

  const message = await Message.create({
    conversation: conversation._id,
    sender: identity,
    type: attachment ? type : "text",
    body: trimmed,
    attachment,
    readBy: [{ id: identity.id, kind: identity.kind, readAt: new Date() }]
  });

  const preview = trimmed || (attachment ? (type === "image" ? "📷 Photo" : `📎 ${attachment.fileName || "File"}`) : "");
  conversation.lastMessageAt = message.createdAt;
  conversation.lastMessagePreview = preview.slice(0, 140);
  await conversation.save();

  const io = getIo();
  conversation.members.forEach((member) => {
    io.to(`user:${member.kind}:${member.id}`).emit("message:new", { conversationId: conversation._id, message });
  });

  return message;
};

export const markConversationRead = async (identity, conversation) => {
  await Message.updateMany(
    { conversation: conversation._id, "readBy.id": { $ne: identity.id } },
    { $push: { readBy: { id: identity.id, kind: identity.kind, readAt: new Date() } } }
  );

  const io = getIo();
  conversation.members.forEach((member) => {
    io.to(`user:${member.kind}:${member.id}`).emit("message:read", {
      conversationId: conversation._id,
      readBy: { id: identity.id, kind: identity.kind }
    });
  });
};
