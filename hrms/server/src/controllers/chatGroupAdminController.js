import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { getIo } from "../realtime/socket.js";

// req.admin is the bridged admin identity (real Admin, or an HR-department
// employee riding the same requireAuth gate) — normalize it into the same
// {id, kind, name} shape chat uses everywhere else.
const currentIdentity = async (req) => {
  if (req.admin.isHrEmployee) {
    const employee = await Employee.findById(req.admin.id).select("fullName");
    return { id: employee._id, kind: "employee", name: employee.fullName };
  }
  const admin = await Admin.findById(req.admin.id).select("name");
  return { id: admin._id, kind: "admin", name: admin.name };
};

const resolveMembers = async (members) => {
  const ids = { employee: [], admin: [] };
  members.forEach((m) => ids[m.kind]?.push(m.id));

  const [employees, admins] = await Promise.all([
    Employee.find({ _id: { $in: ids.employee } }).select("fullName"),
    Admin.find({ _id: { $in: ids.admin } }).select("name")
  ]);

  const byId = new Map();
  employees.forEach((e) => byId.set(`employee:${e._id}`, { id: e._id, kind: "employee", name: e.fullName }));
  admins.forEach((a) => byId.set(`admin:${a._id}`, { id: a._id, kind: "admin", name: a.name }));

  return members.map((m) => byId.get(`${m.kind}:${m.id}`)).filter(Boolean);
};

export const createGroup = async (req, res) => {
  try {
    const title = req.body.title?.trim();
    if (!title) return res.status(400).json({ message: "Group title is required" });

    const requested = Array.isArray(req.body.members) ? req.body.members : [];
    const resolved = await resolveMembers(requested);
    const creator = await currentIdentity(req);

    const alreadyIncluded = resolved.some((m) => String(m.id) === String(creator.id) && m.kind === creator.kind);
    const members = alreadyIncluded ? resolved : [...resolved, creator];

    if (members.length < 2) {
      return res.status(400).json({ message: "Select at least one other member for the group" });
    }

    const conversation = await Conversation.create({ type: "group", title, members, createdBy: creator });
    notifyGroupMembersAdded(conversation);
    return res.status(201).json({ conversation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, type: "group" });
    if (!conversation) return res.status(404).json({ message: "Group not found" });

    if (typeof req.body.title === "string" && req.body.title.trim()) {
      conversation.title = req.body.title.trim();
    }
    if (Array.isArray(req.body.members)) {
      const resolved = await resolveMembers(req.body.members);
      const creatorIncluded =
        !conversation.createdBy ||
        resolved.some((m) => String(m.id) === String(conversation.createdBy.id) && m.kind === conversation.createdBy.kind);
      const members = creatorIncluded ? resolved : [...resolved, conversation.createdBy];

      if (members.length < 2) {
        return res.status(400).json({ message: "A group needs at least two members" });
      }
      conversation.members = members;
    }

    await conversation.save();
    notifyGroupMembersAdded(conversation);
    return res.json({ conversation });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteGroup = async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, type: "group" });
    if (!conversation) return res.status(404).json({ message: "Group not found" });
    await Message.deleteMany({ conversation: conversation._id });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Admin oversight: see and read every group in the company, whether or not
// they're a member of it. Deliberately does not extend to DMs.
export const listAllGroups = async (_req, res) => {
  try {
    const groups = await Conversation.find({ type: "group" }).sort({ lastMessageAt: -1, createdAt: -1 });
    return res.json({ groups });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getGroupMessagesForAudit = async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, type: "group" });
    if (!conversation) return res.status(404).json({ message: "Group not found" });

    const messages = await Message.find({ conversation: conversation._id }).sort({ createdAt: 1 });
    return res.json({ conversation, messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const notifyGroupMembersAdded = (conversation) => {
  const io = getIo();
  conversation.members.forEach((member) => {
    io.to(`user:${member.kind}:${member.id}`).emit("group:updated", { conversationId: conversation._id });
  });
};
