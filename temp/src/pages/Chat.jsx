import { useEffect, useMemo, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../lib/socket";
import axios from "axios";
import "./Chat.css";

const Chat = () => {
  const REACTION_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];
  const { taskId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState("");
  const [contextMenu, setContextMenu] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const editingMessageIdRef = useRef(null);

  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?._id || parsed?.id || parsed?.userId || null;
      } catch {
        // fall back to legacy storage key
      }
    }
    return localStorage.getItem("userId");
  }, []);

  // LOAD OLD MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/${taskId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [taskId]);

  // SOCKET CONNECTION
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const joinRoom = () => {
      console.log("🔌 Connected, joining room:", taskId);
      setIsConnected(true);
      socket.emit("join_task_room", taskId);
    };
    const handleDisconnect = () => setIsConnected(false);

    if (socket.connected) {
      joinRoom();
    } else {
      setIsConnected(false);
    }

    socket.on("connect", joinRoom);
    socket.on("disconnect", handleDisconnect);

    const handleMessage = (msg) => {
      console.log("📥 RECEIVED:", msg);
      setMessages((prev) => {
        if (msg?._id && prev.some((m) => m._id === msg._id)) {
          return prev;
        }
        return [...prev, msg];
      });
    };

    const handleMessageUpdated = (updated) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updated._id ? { ...m, ...updated } : m))
      );
      if (editingMessageIdRef.current === updated._id) {
        setEditingMessageId(null);
        editingMessageIdRef.current = null;
        setEditText("");
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      if (editingMessageIdRef.current === messageId) {
        setEditingMessageId(null);
        editingMessageIdRef.current = null;
        setEditText("");
      }
    };

    socket.on("receive_task_message", handleMessage);
    socket.on("task_message_updated", handleMessageUpdated);
    socket.on("task_message_deleted", handleMessageDeleted);

    return () => {
      socket.off("receive_task_message", handleMessage);
      socket.off("task_message_updated", handleMessageUpdated);
      socket.off("task_message_deleted", handleMessageDeleted);
      socket.off("connect", joinRoom);
      socket.off("disconnect", handleDisconnect);
    };
  }, [taskId]);

  const sendMessage = () => {
    if (!text.trim()) return;

    if (!currentUser) {
      console.error("❌ userId not set in localStorage");
      return;
    }

    
    if (!socketRef.current?.connected) {
      console.log("⏳ Wait for socket connection...");
      return;
    }

    const msgData = {
      taskId,
      senderId: currentUser,
      text,
      time: new Date().toLocaleTimeString(),
    };

    console.log("📤 SENDING:", msgData);

    socketRef.current.emit("send_task_message", msgData);

    setText("");
    inputRef.current?.focus();
  };

  const onInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getGroupedReactions = (message) => {
    const reactions = Array.isArray(message?.reactions) ? message.reactions : [];
    const byEmoji = new Map();
    reactions.forEach((r) => {
      if (!r?.emoji) return;
      const existing = byEmoji.get(r.emoji) || { emoji: r.emoji, count: 0, reactedByMe: false };
      existing.count += 1;
      if (r.userId === currentUser) {
        existing.reactedByMe = true;
      }
      byEmoji.set(r.emoji, existing);
    });
    return Array.from(byEmoji.values());
  };

  const getMessageTime = (message) => {
    if (message?.createdAt) {
      const sentAt = new Date(message.createdAt);
      if (!Number.isNaN(sentAt.getTime())) {
        return sentAt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    }
    if (message?.time) return message.time;
    return "--:--";
  };

  const startEdit = (message) => {
    setContextMenu(null);
    setEditingMessageId(message._id);
    editingMessageIdRef.current = message._id;
    setEditText(message.text || "");
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    editingMessageIdRef.current = null;
    setEditText("");
  };

  const saveEdit = () => {
    const nextText = editText.trim();
    if (!nextText || !editingMessageId || !socketRef.current?.connected) return;

    socketRef.current.emit("edit_task_message", {
      messageId: editingMessageId,
      text: nextText,
      senderId: currentUser,
    });
  };

  const deleteMessage = (messageId) => {
    if (!messageId || !socketRef.current?.connected) return;
    const shouldDelete = window.confirm("Delete this message?");
    if (!shouldDelete) return;
    setContextMenu(null);

    socketRef.current.emit("delete_task_message", {
      messageId,
      senderId: currentUser,
    });
  };

  const openContextMenu = (event, message, isMine) => {
    if (!message?._id) return;
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      messageId: message._id,
      mode: isMine ? "owner" : "reaction",
    });
  };

  const reactToMessage = (emoji) => {
    if (!contextMenu?.messageId || !socketRef.current?.connected) return;
    socketRef.current.emit("react_task_message", {
      messageId: contextMenu.messageId,
      emoji,
      userId: currentUser,
    });
    setContextMenu(null);
  };

  useEffect(() => {
    const closeContextMenu = () => setContextMenu(null);
    const onEscape = (e) => {
      if (e.key === "Escape") closeContextMenu();
    };

    window.addEventListener("click", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-card">
      <div className="chat-header">
        <div>
          <h2>Task Chat</h2>
          <p>Task ID: {taskId}</p>
        </div>
        <span
          className={`connection-pill ${isConnected ? "online" : "offline"}`}
        >
          {isConnected ? "Live" : "Reconnecting..."}
        </span>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h3>Start the conversation</h3>
            <p>Messages for this task will appear here in real time.</p>
          </div>
        ) : (
          messages.map((m, i) => {
            const isMine = m.senderId === currentUser;
            return (
              <div
                key={`${m._id || i}-${m.time || ""}`}
                className={`message-row ${isMine ? "mine" : "theirs"}`}
              >
                <div
                  className={`message-bubble ${isMine ? "mine" : "theirs"}`}
                  onContextMenu={(e) => openContextMenu(e, m, isMine)}
                  title={isMine ? "Right-click for options" : "Right-click to react"}
                >
                  {editingMessageId === m._id ? (
                    <div className="edit-box">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={2}
                      />
                      <div className="message-actions">
                        <button className="action-btn save" onClick={saveEdit}>
                          Save
                        </button>
                        <button className="action-btn cancel" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p>{m.text}</p>
                      <span className={`message-time ${isMine ? "mine" : "theirs"}`}>
                        {getMessageTime(m)} {m.editedAt ? "(edited)" : ""}
                      </span>
                      {!isMine && Array.isArray(m.reactions) && m.reactions.length > 0 ? (
                        <div className="reaction-row">
                          {getGroupedReactions(m).map((r) => (
                            <span
                              key={`${m._id}-${r.emoji}`}
                              className={`reaction-pill ${r.reactedByMe ? "mine" : ""}`}
                            >
                              {r.emoji} {r.count}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        {contextMenu ? (
          <div
            className={`reaction-menu ${contextMenu.mode === "owner" ? "owner-menu" : ""}`}
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            {contextMenu.mode === "owner" ? (
              <>
                <button
                  className="menu-action-btn"
                  onClick={() => {
                    const target = messages.find((msg) => msg._id === contextMenu.messageId);
                    if (target) startEdit(target);
                  }}
                >
                  Edit
                </button>
                <button
                  className="menu-action-btn danger"
                  onClick={() => deleteMessage(contextMenu.messageId)}
                >
                  Delete
                </button>
              </>
            ) : (
              REACTION_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-option"
                  onClick={() => reactToMessage(emoji)}
                >
                  {emoji}
                </button>
              ))
            )}
          </div>
        ) : null}
        <div ref={bottomRef}></div>
      </div>

      <div className="chat-composer">
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onInputKeyDown}
          placeholder="Type your message... (Enter to send)"
          rows={2}
        />
        <button
          onClick={sendMessage}
          disabled={!text.trim() || !isConnected}
          className="send-btn"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;