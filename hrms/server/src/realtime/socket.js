import { Server } from "socket.io";
import { resolveChatIdentity } from "../middleware/chatAuth.js";
import { registerCallHandlers } from "./callHandlers.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const identity = await resolveChatIdentity(token);
      if (!identity) return next(new Error("Invalid or expired token"));
      socket.identity = identity;
      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const { id, kind } = socket.identity;
    socket.join(`user:${kind}:${id}`);
    registerCallHandlers(io, socket);
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error("Socket.io not initialized — call initSocket() first");
  return io;
};
