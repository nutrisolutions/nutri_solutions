import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Check,
  Code,
  Copy,
  Download,
  FileCode,
  FileText,
  Info,
  MessageSquare,
  Paperclip,
  Phone,
  PhoneOff,
  Plus,
  Search,
  Send,
  Trash2,
  Users,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useEmployeeAuth } from "../../context/EmployeeAuthContext";
import { useChat } from "../../context/ChatContext";
import Modal from "../../components/ui/Modal";
import {
  adminChatGroups,
  chatDirectory,
  chatMarkRead,
  chatMessages,
  chatSendAttachment,
  chatSendMessage,
  chatStartDm
} from "../../lib/api";

const formatTime = (value) =>
  value ? new Date(value).toLocaleString(undefined, { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }) : "";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\/[^\s]+$/;
const CODE_BLOCK_SPLIT_REGEX = /```([\s\S]*?)```/g;
const INLINE_CODE_SPLIT_REGEX = /`([^`\n]+)`/g;

const copyToClipboard = (text) => {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  // Fallback for contexts without the async Clipboard API (e.g. non-HTTPS dev).
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
};

const InlineCode = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  return (
    <code
      className="admin-chat-inline-code"
      onClick={handleCopy}
      role="button"
      tabIndex={0}
      title="Click to copy"
      onKeyDown={(e) => e.key === "Enter" && handleCopy()}
    >
      {code}
      {copied && <span className="admin-chat-inline-code-copied">Copied</span>}
    </code>
  );
};

const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };
  return (
    <pre className="admin-chat-code-block">
      <button type="button" className="admin-chat-code-copy" onClick={handleCopy} aria-label="Copy code">
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? "Copied" : "Copy"}
      </button>
      <code>{code}</code>
    </pre>
  );
};

// Applies plain-text formatting only — links + inline code — used both
// standalone and inside the non-code segments of a message with code blocks.
const renderInlineSegments = (text, keyPrefix) =>
  text.split(INLINE_CODE_SPLIT_REGEX).map((segment, i) => {
    const key = `${keyPrefix}-${i}`;
    if (i % 2 === 1) {
      return <InlineCode key={key} code={segment} />;
    }
    return (
      <span key={key}>
        {segment.split(URL_SPLIT_REGEX).map((part, j) =>
          URL_TEST_REGEX.test(part) ? (
            <a key={j} href={part} target="_blank" rel="noreferrer" className="admin-chat-bubble-link">
              {part}
            </a>
          ) : (
            <span key={j}>{part}</span>
          )
        )}
      </span>
    );
  });

// Full message body renderer: fenced ``` code blocks ``` first (rendered as
// <pre>), then inline `code` + links within whatever text is left over.
const renderMessageBody = (text) =>
  text.split(CODE_BLOCK_SPLIT_REGEX).map((segment, i) =>
    i % 2 === 1 ? <CodeBlock key={i} code={segment.trim()} /> : <span key={i}>{renderInlineSegments(segment, i)}</span>
  );

const ChatPage = () => {
  const { admin } = useAuth();
  const { employee, isHr } = useEmployeeAuth();
  const { socket, conversations, refreshConversations } = useChat();

  const identity = useMemo(() => {
    if (employee) return { id: employee._id, kind: "employee" };
    if (admin) return { id: admin._id, kind: "admin" };
    return null;
  }, [admin, employee]);

  const canCreateGroups = Boolean(isHr) || ["superadmin", "hr"].includes(admin?.role);

  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [directory, setDirectory] = useState([]);
  const [directorySearch, setDirectorySearch] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState("");
  const [groupMemberIds, setGroupMemberIds] = useState([]);
  const [groupSearch, setGroupSearch] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [groupInfoMemberIds, setGroupInfoMemberIds] = useState([]);
  const [groupInfoSearch, setGroupInfoSearch] = useState("");
  const [savingGroupMembers, setSavingGroupMembers] = useState(false);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentProgress, setAttachmentProgress] = useState(0);
  const [showCodeMenu, setShowCodeMenu] = useState(false);
  const [codeMode, setCodeMode] = useState(null);
  const [codeBlockDraft, setCodeBlockDraft] = useState("");
  const [allGroups, setAllGroups] = useState([]);
  const [auditThread, setAuditThread] = useState(null);
  const [loadingAuditThread, setLoadingAuditThread] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);

  const active = conversations.find((c) => c._id === activeId) || null;

  const openConversation = useCallback(async (id) => {
    setActiveId(id);
    setAuditThread(null);
    setMessage("");
    try {
      setMessages(await chatMessages(id));
      await chatMarkRead(id);
    } catch {
      setMessage("Failed to load messages");
    }
  }, []);

  const openAuditGroup = useCallback(async (id) => {
    setActiveId(null);
    setAuditThread(null);
    setLoadingAuditThread(true);
    try {
      setAuditThread(await adminChatGroups.getAuditMessages(id));
    } catch {
      setMessage("Failed to load group messages");
    } finally {
      setLoadingAuditThread(false);
    }
  }, []);

  useEffect(() => {
    if (!canCreateGroups) return;
    adminChatGroups
      .listAll()
      .then(setAllGroups)
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCreateGroups]);

  const mergedList = useMemo(() => {
    if (!canCreateGroups) return conversations;
    const ownIds = new Set(conversations.map((c) => c._id));
    const extraGroups = allGroups.filter((g) => !ownIds.has(g._id));
    return [...conversations, ...extraGroups].sort((a, b) => {
      const aTime = new Date(a.lastMessageAt || a.createdAt).getTime();
      const bTime = new Date(b.lastMessageAt || b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [conversations, allGroups, canCreateGroups]);

  const isOwnConversation = useCallback((id) => conversations.some((c) => c._id === id), [conversations]);

  const handleListItemClick = (c) => {
    setMessage("");
    if (isOwnConversation(c._id)) {
      setAuditThread(null);
      openConversation(c._id);
    } else {
      openAuditGroup(c._id);
    }
  };

  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const targetId = searchParams.get("conversation");
    if (!targetId || mergedList.length === 0) return;
    if (isOwnConversation(targetId)) {
      openConversation(targetId);
    } else if (mergedList.some((c) => c._id === targetId)) {
      openAuditGroup(targetId);
    }
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, mergedList]);

  const appendMessage = useCallback((incoming) => {
    setMessages((prev) => (prev.some((m) => m._id === incoming._id) ? prev : [...prev, incoming]));
  }, []);

  useEffect(() => {
    if (!socket || !activeId) return undefined;
    const onNew = ({ conversationId, message: incoming }) => {
      if (conversationId !== activeId) return;
      appendMessage(incoming);
      chatMarkRead(activeId).catch(() => {});
    };
    socket.on("message:new", onNew);
    return () => socket.off("message:new", onNew);
  }, [socket, activeId, appendMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket) return undefined;

    const onIncoming = (payload) => setIncomingCall(payload);

    const onDeclined = ({ conversationId, by }) => {
      setActiveCall((prev) => {
        if (!prev || prev.conversationId !== conversationId) return prev;
        setMessage(`${by.name} declined the call`);
        return prev;
      });
    };

    const onParticipantLeft = ({ conversationId, by }) => {
      setActiveCall((prev) => {
        if (!prev || prev.conversationId !== conversationId) return prev;
        setMessage(`${by.name} left the call`);
        return prev;
      });
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:declined", onDeclined);
    socket.on("call:participant-left", onParticipantLeft);
    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:declined", onDeclined);
      socket.off("call:participant-left", onParticipantLeft);
    };
  }, [socket]);

  const handleStartCall = () => {
    if (!socket || !activeId) return;
    setMessage("");
    socket.emit("call:start", { conversationId: activeId }, (res) => {
      if (!res.ok) {
        setMessage(res.message || "Failed to start call");
        return;
      }
      window.open(res.joinUrl, "_blank", "noopener,noreferrer");
      setActiveCall({
        conversationId: res.conversationId,
        callSessionId: res.callSessionId,
        jitsiRoom: res.jitsiRoom,
        joinUrl: res.joinUrl
      });
    });
  };

  const handleJoinIncoming = () => {
    if (!socket || !incomingCall) return;
    socket.emit("call:join", { conversationId: incomingCall.conversationId, callSessionId: incomingCall.callSessionId }, (res) => {
      if (!res.ok) {
        setMessage(res.message || "Failed to join call");
        setIncomingCall(null);
        return;
      }
      window.open(incomingCall.joinUrl, "_blank", "noopener,noreferrer");
      setActiveCall({
        conversationId: incomingCall.conversationId,
        callSessionId: incomingCall.callSessionId,
        jitsiRoom: res.jitsiRoom,
        joinUrl: incomingCall.joinUrl
      });
      setIncomingCall(null);
    });
  };

  const handleDeclineIncoming = () => {
    if (!socket || !incomingCall) return;
    socket.emit("call:decline", { conversationId: incomingCall.conversationId, callSessionId: incomingCall.callSessionId });
    setIncomingCall(null);
  };

  const handleEndCall = () => {
    if (!socket || !activeCall) return;
    socket.emit("call:end", { conversationId: activeCall.conversationId, callSessionId: activeCall.callSessionId });
    setActiveCall(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !activeId) return;
    const outgoing = codeMode === "inline" ? `\`${draft.trim()}\`` : draft.trim();
    try {
      const sent = await chatSendMessage(activeId, outgoing);
      appendMessage(sent);
      setDraft("");
      setCodeMode(null);
      await refreshConversations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send message");
    }
  };

  const handleSendCodeBlock = async (e) => {
    e.preventDefault();
    if (!codeBlockDraft.trim() || !activeId) return;
    try {
      const sent = await chatSendMessage(activeId, `\`\`\`\n${codeBlockDraft}\n\`\`\``);
      appendMessage(sent);
      setCodeBlockDraft("");
      setCodeMode(null);
      await refreshConversations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send code");
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeId) return;

    setMessage("");
    setUploadingAttachment(true);
    setAttachmentProgress(0);
    try {
      const sent = await chatSendAttachment(activeId, file, draft.trim(), setAttachmentProgress);
      appendMessage(sent);
      setDraft("");
      await refreshConversations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send attachment");
    } finally {
      setUploadingAttachment(false);
      setAttachmentProgress(0);
    }
  };

  const openNewChat = async () => {
    setMessage("");
    setShowNewChat(true);
    try {
      setDirectory(await chatDirectory());
    } catch {
      setMessage("Failed to load directory");
    }
  };

  const handleStartDm = async (person) => {
    try {
      const conversation = await chatStartDm({ id: person.id, kind: person.kind, name: person.name });
      setShowNewChat(false);
      setDirectorySearch("");
      await refreshConversations();
      await openConversation(conversation._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start chat");
    }
  };

  const openNewGroup = async () => {
    setMessage("");
    setGroupTitle("");
    setGroupMemberIds([]);
    setGroupSearch("");
    setShowNewGroup(true);
    try {
      setDirectory(await chatDirectory());
    } catch {
      setMessage("Failed to load directory");
    }
  };

  const toggleGroupMember = (person) => {
    const key = `${person.kind}:${person.id}`;
    setGroupMemberIds((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupTitle.trim() || groupMemberIds.length === 0) {
      setMessage("Group title and at least one member are required");
      return;
    }
    const members = groupMemberIds.map((key) => {
      const [kind, id] = key.split(":");
      return { kind, id };
    });
    setCreatingGroup(true);
    try {
      const conversation = await adminChatGroups.create(groupTitle.trim(), members);
      setShowNewGroup(false);
      await refreshConversations();
      await openConversation(conversation._id);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const openGroupInfo = async () => {
    if (!active) return;
    setMessage("");
    setGroupInfoSearch("");
    setGroupInfoMemberIds(active.members.map((m) => `${m.kind}:${m.id}`));
    setShowGroupInfo(true);
    if (directory.length === 0) {
      try {
        setDirectory(await chatDirectory());
      } catch {
        setMessage("Failed to load directory");
      }
    }
  };

  const toggleGroupInfoMember = (person) => {
    const key = `${person.kind}:${person.id}`;
    setGroupInfoMemberIds((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleSaveGroupMembers = async () => {
    if (groupInfoMemberIds.length < 2) {
      setMessage("A group needs at least two members");
      return;
    }
    const members = groupInfoMemberIds.map((key) => {
      const [kind, id] = key.split(":");
      return { kind, id };
    });
    setSavingGroupMembers(true);
    try {
      await adminChatGroups.update(active._id, { members });
      setMessage("Group members updated");
      setShowGroupInfo(false);
      await refreshConversations();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update group members");
    } finally {
      setSavingGroupMembers(false);
    }
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("");

  const conversationLabel = (conversation) => {
    if (conversation.type === "group") return conversation.title || "Group";
    const other = conversation.members.find((m) => !(m.id === identity?.id && m.kind === identity?.kind));
    return other?.name || "Conversation";
  };

  const filteredDirectory = directory.filter((p) => p.name.toLowerCase().includes(directorySearch.trim().toLowerCase()));
  const filteredGroupDirectory = directory.filter((p) => p.name.toLowerCase().includes(groupSearch.trim().toLowerCase()));
  const selectedGroupMembers = groupMemberIds
    .map((key) => directory.find((p) => `${p.kind}:${p.id}` === key))
    .filter(Boolean);

  const addableGroupInfoDirectory = directory
    .filter((p) => !groupInfoMemberIds.includes(`${p.kind}:${p.id}`))
    .filter((p) => p.name.toLowerCase().includes(groupInfoSearch.trim().toLowerCase()));

  return (
    <div className="admin-page admin-chat-page">
      <header className="admin-page-header">
        <div>
          <h1>Chat</h1>
          <p>Message any employee or admin in the company.</p>
        </div>
        <div className="admin-form-actions">
          {canCreateGroups && (
            <button type="button" className="btn btn-outline" onClick={openNewGroup}>
              <Users size={18} /> New group
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={openNewChat}>
            <Plus size={18} /> New chat
          </button>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      {incomingCall && (
        <div className="admin-chat-incoming-call">
          <div className="admin-chat-incoming-call-icon">
            <Phone size={18} />
          </div>
          <div className="admin-chat-incoming-call-body">
            <strong>{incomingCall.caller.name} is calling…</strong>
            <span>
              {(() => {
                const conv = conversations.find((c) => c._id === incomingCall.conversationId);
                return conv ? conversationLabel(conv) : "Direct call";
              })()}
            </span>
          </div>
          <div className="admin-form-actions" style={{ margin: 0 }}>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleJoinIncoming}>
              <Phone size={14} /> Join
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={handleDeclineIncoming}>
              <PhoneOff size={14} /> Decline
            </button>
          </div>
        </div>
      )}

      <div className="admin-chat-layout">
        <div className="admin-chat-list">
          {mergedList.length === 0 ? (
            <p className="admin-empty">No conversations yet. Start a new chat above.</p>
          ) : (
            mergedList.map((c) => {
              const mine = isOwnConversation(c._id);
              const isActive = mine ? activeId === c._id : auditThread?.conversation?._id === c._id;
              return (
                <button
                  key={c._id}
                  type="button"
                  className={`admin-chat-list-item ${isActive ? "is-active" : ""}`}
                  onClick={() => handleListItemClick(c)}
                >
                  <div className="admin-chat-list-item-icon">
                    {c.type === "group" ? <Users size={16} /> : <MessageSquare size={16} />}
                  </div>
                  <div className="admin-chat-list-item-body">
                    <strong>{mine ? conversationLabel(c) : c.title}</strong>
                    <span>{c.lastMessagePreview || "No messages yet"}</span>
                  </div>
                  {mine && c.unreadCount > 0 && <span className="admin-chat-unread-badge">{c.unreadCount}</span>}
                  {!mine && <span className="admin-badge">oversight</span>}
                </button>
              );
            })
          )}
        </div>

        <div className="admin-chat-thread">
          {loadingAuditThread ? (
            <div className="admin-chat-thread-empty">
              <p>Loading…</p>
            </div>
          ) : auditThread ? (
            <>
              <div className="admin-chat-thread-head">
                <div>
                  <strong>{auditThread.conversation.title}</strong>
                  <span>{auditThread.conversation.members.length} members · read-only</span>
                </div>
              </div>
              <div className="admin-chat-thread-messages">
                {auditThread.conversation.createdBy && (
                  <div className="admin-chat-system-note">
                    <Users size={13} /> {auditThread.conversation.createdBy.name} created this group ·{" "}
                    {formatTime(auditThread.conversation.createdAt)}
                  </div>
                )}
                {auditThread.messages.map((m) => (
                  <div key={m._id} className="admin-chat-bubble">
                    <span className="admin-chat-bubble-sender">{m.sender.name}</span>
                    {m.type === "image" && m.attachment && (
                      <a href={m.attachment.url} target="_blank" rel="noreferrer">
                        <img src={m.attachment.url} alt={m.attachment.fileName || "Image"} className="admin-chat-attachment-image" />
                      </a>
                    )}
                    {m.type === "file" && m.attachment && (
                      <a href={m.attachment.url} target="_blank" rel="noreferrer" className="admin-chat-attachment-file">
                        <FileText size={20} />
                        <span className="admin-chat-attachment-file-info">
                          <strong>{m.attachment.fileName || "File"}</strong>
                          <span>{formatFileSize(m.attachment.size)}</span>
                        </span>
                        <Download size={16} />
                      </a>
                    )}
                    {m.body && <div className="admin-chat-bubble-text">{renderMessageBody(m.body)}</div>}
                    <span className="admin-chat-bubble-time">{formatTime(m.createdAt)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : !active ? (
            <div className="admin-chat-thread-empty">
              <MessageSquare size={32} strokeWidth={1.25} />
              <p>Select a conversation to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="admin-chat-thread-head">
                <div>
                  <strong>{conversationLabel(active)}</strong>
                  {active.type === "group" && <span>{active.members.length} members</span>}
                </div>
                <div className="admin-form-actions" style={{ margin: 0 }}>
                  {activeCall?.conversationId === active._id ? (
                    <button type="button" className="btn btn-danger btn-sm" onClick={handleEndCall}>
                      <PhoneOff size={14} /> Leave call
                    </button>
                  ) : (
                    <button type="button" className="btn btn-outline btn-sm" onClick={handleStartCall} disabled={Boolean(activeCall)}>
                      <Phone size={14} /> Call
                    </button>
                  )}
                  {active.type === "group" && (
                    <button type="button" className="btn btn-outline btn-sm" onClick={openGroupInfo}>
                      <Info size={14} /> Group info
                    </button>
                  )}
                </div>
              </div>
              <div className="admin-chat-thread-messages">
                {active.type === "group" && active.createdBy && (
                  <div className="admin-chat-system-note">
                    <Users size={13} /> {active.createdBy.name} created this group · {formatTime(active.createdAt)}
                  </div>
                )}
                {messages.map((m) => {
                  const isMine = identity && m.sender.id === identity.id && m.sender.kind === identity.kind;
                  return (
                    <div key={m._id} className={`admin-chat-bubble ${isMine ? "is-mine" : ""}`}>
                      {!isMine && <span className="admin-chat-bubble-sender">{m.sender.name}</span>}
                      {m.type === "image" && m.attachment && (
                        <a href={m.attachment.url} target="_blank" rel="noreferrer">
                          <img src={m.attachment.url} alt={m.attachment.fileName || "Image"} className="admin-chat-attachment-image" />
                        </a>
                      )}
                      {m.type === "file" && m.attachment && (
                        <a href={m.attachment.url} target="_blank" rel="noreferrer" className="admin-chat-attachment-file">
                          <FileText size={20} />
                          <span className="admin-chat-attachment-file-info">
                            <strong>{m.attachment.fileName || "File"}</strong>
                            <span>{formatFileSize(m.attachment.size)}</span>
                          </span>
                          <Download size={16} />
                        </a>
                      )}
                      {m.body && <div className="admin-chat-bubble-text">{renderMessageBody(m.body)}</div>}
                      <span className="admin-chat-bubble-time">{formatTime(m.createdAt)}</span>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              {uploadingAttachment && (
                <div className="admin-chat-upload-progress">
                  <div className="admin-chat-upload-progress-track">
                    <div className="admin-chat-upload-progress-fill" style={{ width: `${attachmentProgress}%` }} />
                  </div>
                  <span>Uploading… {attachmentProgress}%</span>
                </div>
              )}

              {codeMode === "block" ? (
                <form className="admin-chat-code-composer" onSubmit={handleSendCodeBlock}>
                  <div className="admin-chat-code-composer-head">
                    <span>
                      <FileCode size={14} /> Multi-line code
                    </span>
                    <button
                      type="button"
                      className="admin-chat-code-composer-cancel"
                      onClick={() => {
                        setCodeMode(null);
                        setCodeBlockDraft("");
                      }}
                      aria-label="Cancel code block"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <textarea
                    className="admin-chat-code-textarea"
                    rows={6}
                    value={codeBlockDraft}
                    onChange={(e) => setCodeBlockDraft(e.target.value)}
                    placeholder="Write your code here…"
                    autoFocus
                  />
                  <div className="admin-form-actions" style={{ margin: 0 }}>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={!codeBlockDraft.trim()}>
                      <Send size={14} /> Send code
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setCodeMode(null);
                        setCodeBlockDraft("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form className="admin-chat-composer" onSubmit={handleSend}>
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} />
                  <button
                    type="button"
                    className="admin-chat-attach-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAttachment}
                    aria-label="Attach file"
                  >
                    <Paperclip size={18} />
                  </button>

                  <div className="admin-chat-code-menu-wrap">
                    <button
                      type="button"
                      className={`admin-chat-attach-btn ${codeMode === "inline" ? "is-active" : ""}`}
                      onClick={() => setShowCodeMenu((v) => !v)}
                      aria-label="Code options"
                    >
                      <Code size={18} />
                    </button>
                    {showCodeMenu && (
                      <div className="admin-chat-code-menu">
                        <button
                          type="button"
                          onClick={() => {
                            setCodeMode((prev) => (prev === "inline" ? null : "inline"));
                            setShowCodeMenu(false);
                          }}
                        >
                          <Code size={14} /> Single-line code
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCodeMode("block");
                            setShowCodeMenu(false);
                          }}
                        >
                          <FileCode size={14} /> Multi-line code
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    className={codeMode === "inline" ? "admin-chat-input-code" : ""}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={codeMode === "inline" ? "Write a single line of code…" : "Type a message…"}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={!draft.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <Modal open={showNewChat} onClose={() => setShowNewChat(false)} title="New chat">
        <div className="admin-form-card">
          <h2>New chat</h2>
          <div className="admin-search" style={{ marginBottom: "0.85rem" }}>
            <Search size={18} />
            <input
              type="search"
              placeholder="Search people…"
              value={directorySearch}
              onChange={(e) => setDirectorySearch(e.target.value)}
            />
          </div>
          <div className="admin-chat-directory-list">
            {filteredDirectory.map((p) => (
              <button key={`${p.kind}:${p.id}`} type="button" className="admin-chat-directory-item" onClick={() => handleStartDm(p)}>
                <strong>{p.name}</strong>
                <span>{p.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal open={showNewGroup} onClose={() => setShowNewGroup(false)} title="New group" maxWidth="480px">
        <form className="admin-form-card admin-chat-group-form" onSubmit={handleCreateGroup}>
          <h2>New group</h2>

          <label>
            Group name *
            <input
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="e.g. Marketing Team"
              required
            />
          </label>

          <div className="admin-chat-group-members-label">
            <span>Members *</span>
            {groupMemberIds.length > 0 && <span className="admin-badge admin-badge--ok">{groupMemberIds.length} selected</span>}
          </div>

          {selectedGroupMembers.length > 0 && (
            <div className="admin-chat-chip-row">
              {selectedGroupMembers.map((p) => (
                <span key={`${p.kind}:${p.id}`} className="admin-chat-chip">
                  {p.name}
                  <button type="button" onClick={() => toggleGroupMember(p)} aria-label={`Remove ${p.name}`}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="admin-search admin-chat-group-search">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search employees…"
              value={groupSearch}
              onChange={(e) => setGroupSearch(e.target.value)}
            />
          </div>

          <div className="admin-chat-directory-list admin-chat-group-picker">
            {filteredGroupDirectory.length === 0 ? (
              <p className="admin-empty">No matches.</p>
            ) : (
              filteredGroupDirectory.map((p) => {
                const key = `${p.kind}:${p.id}`;
                const checked = groupMemberIds.includes(key);
                return (
                  <label key={key} className={`admin-chat-member-row ${checked ? "is-checked" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleGroupMember(p)} />
                    <span className="admin-chat-member-avatar">{initials(p.name)}</span>
                    <span className="admin-chat-member-info">
                      <strong>{p.name}</strong>
                      <span>{p.subtitle}</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary" disabled={creatingGroup || !groupTitle.trim() || groupMemberIds.length === 0}>
              <Users size={16} /> {creatingGroup ? "Creating…" : "Create group"}
            </button>
            <button type="button" className="btn btn-outline" onClick={() => setShowNewGroup(false)}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showGroupInfo} onClose={() => setShowGroupInfo(false)} title="Group info" maxWidth="480px">
        {active && active.type === "group" && (
          <div className="admin-form-card admin-chat-group-form">
            <h2>{active.title}</h2>
            {active.createdBy && (
              <p className="admin-chat-group-created-by">
                Created by <strong>{active.createdBy.name}</strong> · {formatTime(active.createdAt)}
              </p>
            )}

            <div className="admin-chat-group-members-label">
              <span>Members</span>
              <span className="admin-badge admin-badge--ok">{groupInfoMemberIds.length}</span>
            </div>

            <div className="admin-chat-directory-list admin-chat-group-picker">
              {groupInfoMemberIds.map((key) => {
                const fromDirectory = directory.find((p) => `${p.kind}:${p.id}` === key);
                const fromMembers = active.members.find((m) => `${m.kind}:${m.id}` === key);
                const person = fromDirectory || { name: fromMembers?.name, subtitle: "" };
                const isCreator = active.createdBy && key === `${active.createdBy.kind}:${active.createdBy.id}`;
                return (
                  <div key={key} className="admin-chat-member-row">
                    <span className="admin-chat-member-avatar">{initials(person.name)}</span>
                    <span className="admin-chat-member-info">
                      <strong>
                        {person.name} {isCreator && <span className="admin-badge">Creator</span>}
                      </strong>
                      {person.subtitle && <span>{person.subtitle}</span>}
                    </span>
                    {canCreateGroups && !isCreator && (
                      <button
                        type="button"
                        className="admin-chat-member-remove"
                        onClick={() => toggleGroupInfoMember({ kind: key.split(":")[0], id: key.split(":")[1] })}
                        aria-label={`Remove ${person.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {canCreateGroups && (
              <>
                <div className="admin-chat-group-members-label">
                  <span>Add members</span>
                </div>
                <div className="admin-search admin-chat-group-search">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search employees…"
                    value={groupInfoSearch}
                    onChange={(e) => setGroupInfoSearch(e.target.value)}
                  />
                </div>
                <div className="admin-chat-directory-list admin-chat-group-picker">
                  {addableGroupInfoDirectory.length === 0 ? (
                    <p className="admin-empty">No one left to add.</p>
                  ) : (
                    addableGroupInfoDirectory.map((p) => (
                      <label key={`${p.kind}:${p.id}`} className="admin-chat-member-row">
                        <input type="checkbox" checked={false} onChange={() => toggleGroupInfoMember(p)} />
                        <span className="admin-chat-member-avatar">{initials(p.name)}</span>
                        <span className="admin-chat-member-info">
                          <strong>{p.name}</strong>
                          <span>{p.subtitle}</span>
                        </span>
                      </label>
                    ))
                  )}
                </div>

                <div className="admin-form-actions">
                  <button type="button" className="btn btn-primary" onClick={handleSaveGroupMembers} disabled={savingGroupMembers}>
                    {savingGroupMembers ? "Saving…" : "Save changes"}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowGroupInfo(false)}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatPage;
