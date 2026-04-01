import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getSocket } from "../lib/socket";
import { api } from "../lib/api";
import { toast } from "react-toastify";
import CallIcon from "@mui/icons-material/Call";
import VideocamIcon from "@mui/icons-material/Videocam";
import CallEndIcon from "@mui/icons-material/CallEnd";
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

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle"); // 'idle', 'ringing', 'calling', 'active'
  const [incomingData, setIncomingData] = useState(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const editingMessageIdRef = useRef(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);

  const currentUser = useMemo(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed?._id || parsed?.id || parsed?.userId || null;
      } catch {
        // fall back to legacy
      }
    }
    return localStorage.getItem("userId");
  }, []);

  // LOAD OLD MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get(`/api/chat/${taskId}`);
        setMessages(data);
      } catch (err) {
        console.error("❌ Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [taskId]);

  // AUTO-ACCEPT CALL FROM GLOBAL SIDEBAR REDIRECT
  useEffect(() => {
    if (location.state?.autoAcceptCall && callState === "idle" && isConnected) {
      const callData = location.state.autoAcceptCall;
      
      // Clear routing state so reload doesn't trigger again
      navigate(location.pathname, { replace: true, state: {} });
      
      setIncomingData(callData);
      acceptCall(callData);
    }
  }, [location.state, callState, isConnected, navigate]);

  // Cleanup WebRTC when unmounting
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  // Sync streams to video tags when they change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  // SOCKET CONNECTION
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    const joinRoom = () => {
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
      setMessages((prev) => {
        if (msg?._id && prev.some((m) => m._id === msg._id)) return prev;
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

    // WEBRTC CALL HANDLERS
    const onOffer = (data) => {
      if (data.senderId !== currentUser && callState === "idle") {
        setIncomingData(data);
        setCallState("ringing");
      }
    };

    const onAnswer = async (data) => {
      if (data.senderId !== currentUser && peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallState("active");
          
          setIncomingData(prev => ({
            ...(prev || {}),
            senderName: data.senderName || prev?.senderName,
            profilePicture: data.profilePicture || prev?.profilePicture,
            video: prev ? prev.video : false
          }));

          while(iceCandidateQueueRef.current.length > 0) {
            const cand = iceCandidateQueueRef.current.shift();
            await peerRef.current.addIceCandidate(new RTCIceCandidate(cand));
          }
        } catch(e) { console.error("Error setting answer", e); }
      }
    };

    const onIceCandidate = async (data) => {
      if (data.candidate) {
        if (!peerRef.current || !peerRef.current.remoteDescription) {
          iceCandidateQueueRef.current.push(data.candidate);
        } else {
          try {
            await peerRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } catch(e) { console.error("Error setting ICE candidate", e); }
        }
      }
    };

    const onEndCall = () => {
      if (callState !== "idle") {
        toast.info("Call ended");
      }
      cleanupCall();
    };

    socket.on("webrtc_offer", onOffer);
    socket.on("webrtc_answer", onAnswer);
    socket.on("webrtc_ice_candidate", onIceCandidate);
    socket.on("end_call", onEndCall);

    return () => {
      socket.off("receive_task_message", handleMessage);
      socket.off("task_message_updated", handleMessageUpdated);
      socket.off("task_message_deleted", handleMessageDeleted);
      socket.off("webrtc_offer", onOffer);
      socket.off("webrtc_answer", onAnswer);
      socket.off("webrtc_ice_candidate", onIceCandidate);
      socket.off("end_call", onEndCall);
      socket.off("connect", joinRoom);
      socket.off("disconnect", handleDisconnect);
    };
  }, [taskId, currentUser, callState]);

  /* ================== WEBRTC METHODS ================== */

  const setupPeer = (stream) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit("webrtc_ice_candidate", {
          taskId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return peer;
  };

  const getSenderInfo = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const p = JSON.parse(storedUser);
        const name = `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.email_id || currentUser;
        return { senderName: name, profilePicture: p.profile_picture || null };
      } catch(e) {}
    }
    return { senderName: currentUser, profilePicture: null };
  };

  const startCall = async (video) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video, audio: true });
      iceCandidateQueueRef.current = [];
      setLocalStream(stream);
      setCallState("calling");
      setIsAudioOnly(!video);

      const peer = setupPeer(stream);
      peerRef.current = peer;

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      const { senderName, profilePicture } = getSenderInfo();
      socketRef.current?.emit("webrtc_offer", {
        taskId,
        offer,
        senderId: currentUser,
        senderName,
        profilePicture,
        video,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not access camera or microphone.");
      cleanupCall();
    }
  };

  const acceptCall = async (overrideData = null) => {
    const dataToUse = overrideData?.offer ? overrideData : incomingData;
    if (!dataToUse) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: dataToUse.video, audio: true });
      setLocalStream(stream);
      setCallState("active");
      setIsAudioOnly(!dataToUse.video);

      const peer = setupPeer(stream);
      peerRef.current = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(dataToUse.offer));
      
      while(iceCandidateQueueRef.current.length > 0) {
        const cand = iceCandidateQueueRef.current.shift();
        await peer.addIceCandidate(new RTCIceCandidate(cand));
      }

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      const { senderName, profilePicture } = getSenderInfo();
      socketRef.current?.emit("webrtc_answer", {
        taskId,
        answer,
        senderId: currentUser,
        senderName,
        profilePicture,
      });
    } catch (err) {
      console.error(err);
      toast.error("Could not access media devices.");
      endCallAction();
    }
  };

  const endCallAction = () => {
    socketRef.current?.emit("end_call", { taskId });
    cleanupCall();
  };

  const cleanupCall = () => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
    setLocalStream((prevStream) => {
      if (prevStream) prevStream.getTracks().forEach(t => t.stop());
      return null;
    });
    setRemoteStream((prevStream) => {
      if (prevStream) prevStream.getTracks().forEach(t => t.stop());
      return null;
    });
    iceCandidateQueueRef.current = [];
    setCallState("idle");
    setIncomingData(null);
  };

  /* ================== CHAT METHODS ================== */

  const sendMessage = () => {
    if (!text.trim() || !currentUser || !socketRef.current?.connected) return;

    const msgData = {
      taskId,
      senderId: currentUser,
      text,
      time: new Date().toLocaleTimeString(),
    };

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
      if (r.userId === currentUser) existing.reactedByMe = true;
      byEmoji.set(r.emoji, existing);
    });
    return Array.from(byEmoji.values());
  };

  const getMessageTime = (message) => {
    if (message?.createdAt) {
      const sentAt = new Date(message.createdAt);
      if (!Number.isNaN(sentAt.getTime())) {
        return sentAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }
    return message?.time || "--:--";
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
    const onEscape = (e) => { if (e.key === "Escape") closeContextMenu(); };
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {callState === "idle" && (
            <div className="call-actions-group">
              <button className="call-btn-small audio-call" onClick={() => startCall(false)} title="Audio Call">
                <CallIcon fontSize="small" />
              </button>
              <button className="call-btn-small video-call" onClick={() => startCall(true)} title="Video Call">
                <VideocamIcon fontSize="small" />
              </button>
            </div>
          )}
          <span className={`connection-pill ${isConnected ? "online" : "offline"}`}>
            {isConnected ? "Live" : "Reconnecting..."}
          </span>
        </div>
      </div>

      {/* WEBRTC CALL OVERLAYS */}
      {callState === "ringing" && (
        <div className="call-ringing-overlay">
          <div className="call-ringing-box">
            <h3>Incoming Call...</h3>
            <p>{incomingData?.video ? "Video" : "Audio"} call from {incomingData?.senderName || incomingData?.senderId}</p>
            <div className="ringing-actions">
              <button className="ringing-accept" onClick={() => acceptCall(null)}>Accept</button>
              <button className="ringing-decline" onClick={endCallAction}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {callState === "calling" && (
        <div className="call-ringing-overlay">
          <div className="call-ringing-box">
            <h3>Calling...</h3>
            <p>Waiting for answer...</p>
            <div className="ringing-actions">
              <button className="ringing-decline" onClick={endCallAction}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {callState === "active" && (
        <div className="active-call-overlay">
          <div className="video-streams">
            {remoteStream && (
              <video 
                ref={remoteVideoRef} 
                className="remote-video" 
                autoPlay 
                playsInline 
                style={isAudioOnly ? { position: 'absolute', width: 0, height: 0, opacity: 0 } : {}}
              />
            )}
            {localStream && (
              <video 
                ref={localVideoRef} 
                className="local-video" 
                autoPlay 
                playsInline 
                muted 
                style={isAudioOnly ? { position: 'absolute', width: 0, height: 0, opacity: 0 } : {}}
              />
            )}
            
            {isAudioOnly && (
              <div className="audio-call-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', background: '#1e1e2d' }}>
                 {incomingData?.profilePicture ? (
                   <img src={incomingData.profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px', boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }} />
                 ) : (
                   <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', color: 'white', marginBottom: '20px', boxShadow: '0 0 20px rgba(79, 70, 229, 0.5)' }}>
                     {(incomingData?.senderName || "U")[0].toUpperCase()}
                   </div>
                 )}
                 <h2 style={{ color: 'white', margin: 0, fontSize: '24px' }}>{incomingData?.senderName || "Connected User"}</h2>
                 <p style={{ color: '#aaa', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CallIcon fontSize="small" /> Audio Call Active
                 </p>
              </div>
            )}
          </div>
          <div className="call-controls">
            <button className="end-call-btn" onClick={endCallAction}>
              <CallEndIcon />
            </button>
          </div>
        </div>
      )}

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
                        <button className="action-btn save" onClick={saveEdit}>Save</button>
                        <button className="action-btn cancel" onClick={cancelEdit}>Cancel</button>
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
                            <span key={`${m._id}-${r.emoji}`} className={`reaction-pill ${r.reactedByMe ? "mine" : ""}`}>
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
        {contextMenu && (
          <div className={`reaction-menu ${contextMenu.mode === "owner" ? "owner-menu" : ""}`} style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
            {contextMenu.mode === "owner" ? (
              <>
                <button className="menu-action-btn" onClick={() => { startEdit(messages.find((msg) => msg._id === contextMenu.messageId)); }}>Edit</button>
                <button className="menu-action-btn danger" onClick={() => deleteMessage(contextMenu.messageId)}>Delete</button>
              </>
            ) : (
              REACTION_OPTIONS.map((emoji) => (
                <button key={emoji} className="reaction-option" onClick={() => reactToMessage(emoji)}>{emoji}</button>
              ))
            )}
          </div>
        )}
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
        <button onClick={sendMessage} disabled={!text.trim() || !isConnected} className="send-btn">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;