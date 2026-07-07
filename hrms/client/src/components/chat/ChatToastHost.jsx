import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";

const TOAST_TIMEOUT_MS = 6000;

const ChatToast = ({ toast, onDismiss, onOpen }) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), TOAST_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div className="chat-toast" onClick={() => onOpen(toast)} role="button" tabIndex={0}>
      <div className="chat-toast-icon">
        <MessageCircle size={18} />
      </div>
      <div className="chat-toast-body">
        <strong>{toast.senderName}</strong>
        <span>{toast.preview}</span>
      </div>
      <button
        type="button"
        className="chat-toast-close"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(toast.id);
        }}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const ChatToastHost = () => {
  const { toasts, dismissToast } = useChat();
  const { employee } = useEmployeeAuth();
  const { admin } = useAuth();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  const basePath = employee ? "/portal/chat" : admin ? "/admin/chat" : null;

  const handleOpen = (toast) => {
    dismissToast(toast.id);
    if (basePath) navigate(`${basePath}?conversation=${toast.conversationId}`);
  };

  return (
    <div className="chat-toast-stack">
      {toasts.map((toast) => (
        <ChatToast key={toast.id} toast={toast} onDismiss={dismissToast} onOpen={handleOpen} />
      ))}
    </div>
  );
};

export default ChatToastHost;
