import { createPortal } from "react-dom";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/DynamicFeed";
import TaskIcon from "@mui/icons-material/Task";
import AddIcon from "@mui/icons-material/AddBox";
import SettingsIcon from "@mui/icons-material/Settings";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";
import { api, setToken } from "../lib/api";
import UserRating from "./UserRating";
import "./Sidebar.css";
import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

const Sidebar = () => {
  // ✅ FIX: Only ONE useState (with initializer)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const navigate = useNavigate();
  const location = useLocation();
  const [incomingCall, setIncomingCall] = useState(null);

  // ✅ Listen for updates from Settings page
  useEffect(() => {
    const handleUserUpdate = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    window.addEventListener("user-updated", handleUserUpdate);

    return () => {
      window.removeEventListener("user-updated", handleUserUpdate);
    };
  }, []);

  // ✅ Listen for real-time rating updates
  useEffect(() => {
    const socket = getSocket();
    
    const handleRatingUpdated = (data) => {
      setUser((prevUser) => {
        const updatedUser = {
          ...prevUser,
          ratingAvg: data.ratingAvg,
          ratingCount: data.ratingCount,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });
    };

    socket.on("rating_updated", handleRatingUpdated);
    
    return () => {
      socket.off("rating_updated", handleRatingUpdated);
    };
  }, []);

  // ✅ Listen for global incoming calls
  useEffect(() => {
    const socket = getSocket();
    
    const handleWebrtcOffer = (data) => {
      // If we are already on the chat page for this task, ignore it natively
      if (location.pathname.includes(`/chat/${data.taskId}`)) {
        return;
      }
      
      const currentUserId = user?._id || user?.id;
      if (data.senderId === currentUserId) return; // Prevent own calls

      setIncomingCall(data);
    };

    socket.on("webrtc_offer", handleWebrtcOffer);

    return () => {
      socket.off("webrtc_offer", handleWebrtcOffer);
    };
  }, [location.pathname, user]);

  const acceptGlobalCall = () => {
    if (!incomingCall) return;
    const { taskId } = incomingCall;
    setIncomingCall(null);
    navigate(`/chat/${taskId}`, { state: { autoAcceptCall: incomingCall } });
  };

  const declineGlobalCall = () => {
    if (!incomingCall) return;
    const socket = getSocket();
    socket.emit("end_call", { taskId: incomingCall.taskId });
    setIncomingCall(null);
  };

  const initial = user?.first_name
    ? user.first_name.charAt(0).toUpperCase()
    : "👤";

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      setToken(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch {
      setToken(null);
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("user");
      toast.error("Logout failed");
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">HireHelper</div>

      <nav className="sidebar-menu">
        <NavLink to="/feed" className="menu-item">
          <FeedIcon />
          <span>Feed</span>
        </NavLink>

        <NavLink to="/my-tasks" className="menu-item">
          <TaskIcon />
          <span>My Tasks</span>
        </NavLink>

        <NavLink to="/add-task" className="menu-item">
          <AddIcon />
          <span>Add Task</span>
        </NavLink>

        <NavLink to="/requests" className="menu-item">
          <InboxIcon />
          <span>Requests</span>
        </NavLink>

        <NavLink to="/my-requests" className="menu-item">
          <SendIcon />
          <span>My Requests</span>
        </NavLink>

        <NavLink to="/settings" className="menu-item">
          <SettingsIcon />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/settings" className="profile-link">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              style={{
                width: "48px",
                height: "48px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "20px",
              }}
            >
              {initial}
            </div>
          )}

          <div className="profile-info" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div className="profile-text" style={{ fontSize: "14px", fontWeight: "600" }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div className="profile-text" style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>
              {user?.email_id}
            </div>
            <div style={{ transform: "scale(0.7)", transformOrigin: "left center", marginTop: "-2px" }}>
              <UserRating 
                rating={user?.ratingAvg} 
                count={user?.ratingCount} 
                size="small"
                showCount={true}
              />
            </div>
          </div>
        </NavLink>
      </div>

      <div className="sidebar-footer">
        <div className="logout-btn" onClick={handleLogout}>
          <LogoutIcon />
          <span>Logout</span>
        </div>
      </div>

      {/* GLOBAL INCOMING CALL MODAL */}
      {incomingCall && createPortal(
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          zIndex: 2147483647,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "white"
        }}>
          <div style={{
            background: "#1e1e2d",
            padding: "30px",
            borderRadius: "12px",
            textAlign: "center",
            minWidth: "300px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
          }}>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>Incoming Call...</h3>
            <p style={{ margin: "0 0 20px 0", color: "#aaa" }}>
              {incomingCall.video ? "Video" : "Audio"} call from {incomingCall.senderName || incomingCall.senderId || "Someone"}
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button 
                onClick={acceptGlobalCall}
                style={{ padding: "10px 20px", background: "#10b981", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Accept
              </button>
              <button 
                onClick={declineGlobalCall}
                style={{ padding: "10px 20px", background: "#ef4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Decline
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
};

export default Sidebar;