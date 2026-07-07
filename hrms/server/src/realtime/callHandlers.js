import Conversation from "../models/Conversation.js";
import CallSession from "../models/CallSession.js";
import { createChatCallRoom } from "../services/jitsiService.js";
import { clearBusy, getBusyInfo, isBusy, setBusy } from "./callPresence.js";

const room = ({ id, kind }) => `user:${kind}:${id}`;
const sameIdentity = (a, b) => String(a.id) === String(b.id) && a.kind === b.kind;

const emitToMembers = (io, members, event, payload, exclude) => {
  members.forEach((m) => {
    if (exclude && sameIdentity(m, exclude)) return;
    io.to(room(m)).emit(event, payload);
  });
};

export const registerCallHandlers = (io, socket) => {
  const identity = socket.identity;

  socket.on("call:start", async ({ conversationId }, ack) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.members.some((m) => sameIdentity(m, identity))) {
        return ack?.({ ok: false, message: "Conversation not found" });
      }

      if (isBusy(identity)) {
        return ack?.({ ok: false, message: "You are already on another call" });
      }

      const others = conversation.members.filter((m) => !sameIdentity(m, identity));
      if (conversation.type === "dm") {
        const other = others[0];
        const busyInfo = other && getBusyInfo(other);
        if (busyInfo) {
          return ack?.({ ok: false, busy: true, message: `${other.name} is currently on another call` });
        }
      }

      const { jitsiRoom, joinUrl } = createChatCallRoom(conversation._id);
      const callSession = await CallSession.create({
        conversation: conversation._id,
        jitsiRoom,
        startedBy: identity,
        participants: [{ ...identity, joinedAt: new Date() }]
      });

      setBusy(identity, { conversationId: conversation._id, jitsiRoom, callSessionId: callSession._id });

      const payload = {
        conversationId: conversation._id,
        callSessionId: callSession._id,
        jitsiRoom,
        joinUrl,
        caller: identity
      };
      emitToMembers(io, others, "call:incoming", payload);
      return ack?.({ ok: true, ...payload });
    } catch (error) {
      return ack?.({ ok: false, message: error.message });
    }
  });

  socket.on("call:join", async ({ conversationId, callSessionId }, ack) => {
    try {
      if (isBusy(identity)) {
        return ack?.({ ok: false, message: "You are already on another call" });
      }

      const callSession = await CallSession.findById(callSessionId);
      if (!callSession || String(callSession.conversation) !== String(conversationId) || callSession.endedAt) {
        return ack?.({ ok: false, message: "This call has ended" });
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return ack?.({ ok: false, message: "Conversation not found" });

      callSession.participants.push({ ...identity, joinedAt: new Date() });
      await callSession.save();
      setBusy(identity, { conversationId, jitsiRoom: callSession.jitsiRoom, callSessionId });

      emitToMembers(io, conversation.members, "call:participant-joined", { conversationId, participant: identity }, identity);
      return ack?.({ ok: true, jitsiRoom: callSession.jitsiRoom });
    } catch (error) {
      return ack?.({ ok: false, message: error.message });
    }
  });

  socket.on("call:decline", async ({ conversationId, callSessionId }) => {
    try {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      emitToMembers(io, conversation.members, "call:declined", { conversationId, callSessionId, by: identity }, identity);
    } catch {
      // best-effort notification only
    }
  });

  socket.on("call:end", async ({ conversationId, callSessionId }) => {
    try {
      clearBusy(identity);

      if (callSessionId) {
        const callSession = await CallSession.findById(callSessionId);
        if (callSession) {
          const participant = callSession.participants.find((p) => sameIdentity(p, identity) && !p.leftAt);
          if (participant) participant.leftAt = new Date();
          if (callSession.participants.every((p) => p.leftAt)) callSession.endedAt = new Date();
          await callSession.save();
        }
      }

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;
      emitToMembers(io, conversation.members, "call:participant-left", { conversationId, by: identity }, identity);
    } catch {
      // best-effort cleanup only
    }
  });

  socket.on("disconnect", () => {
    clearBusy(identity);
  });
};
