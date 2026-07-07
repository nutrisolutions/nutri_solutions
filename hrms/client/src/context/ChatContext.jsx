import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE, chatConversations, setChatAuthToken } from "../lib/api";
import { useAuth } from "./AuthContext";
import { useEmployeeAuth } from "./EmployeeAuthContext";

const ChatContext = createContext(null);

let toastIdCounter = 0;

export const ChatProvider = ({ children }) => {
  const { token: adminToken, admin } = useAuth();
  const { token: employeeToken, employee } = useEmployeeAuth();

  // Whichever session is actually logged in wins — only one of these is ever
  // populated at a time in practice (admin panel vs employee portal).
  const activeToken = employee ? employeeToken : admin ? adminToken : null;
  const identity = employee ? { id: employee._id, kind: "employee" } : admin ? { id: admin._id, kind: "admin" } : null;

  const [socket, setSocket] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshConversations = useCallback(async () => {
    if (!activeToken) return;
    try {
      setConversations(await chatConversations());
    } catch {
      // Chat is a secondary surface — a transient failure here shouldn't break the app.
    }
  }, [activeToken]);

  useEffect(() => {
    setChatAuthToken(activeToken);
    if (!activeToken) {
      setConversations([]);
      setSocket(null);
      return undefined;
    }

    const s = io(API_BASE, { auth: { token: activeToken } });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [activeToken]);

  useEffect(() => {
    if (!socket) return undefined;

    const onNewMessage = ({ conversationId, message }) => {
      refreshConversations();
      const isMine = identity && message.sender.id === identity.id && message.sender.kind === identity.kind;
      if (isMine) return;
      setToasts((prev) => [
        ...prev,
        {
          id: `${message._id}-${toastIdCounter++}`,
          conversationId,
          senderName: message.sender.name,
          preview:
            message.body ||
            (message.type === "image" ? "Sent an image" : message.type === "file" ? "Sent a file" : "Sent a message")
        }
      ]);
    };

    refreshConversations();
    socket.on("message:new", onNewMessage);
    socket.on("message:read", refreshConversations);
    socket.on("group:updated", refreshConversations);
    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message:read", refreshConversations);
      socket.off("group:updated", refreshConversations);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, refreshConversations, identity?.id, identity?.kind]);

  const unreadTotal = useMemo(() => conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0), [conversations]);

  const value = useMemo(
    () => ({
      socket,
      conversations,
      refreshConversations,
      unreadTotal,
      chatAvailable: Boolean(activeToken),
      toasts,
      dismissToast
    }),
    [socket, conversations, refreshConversations, unreadTotal, activeToken, toasts, dismissToast]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
