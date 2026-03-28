import { NavLink, useNavigate } from "react-router-dom";
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
import "./Sidebar.css";
import { useEffect, useState } from "react";

const Sidebar = () => {
  // ✅ FIX: Only ONE useState (with initializer)
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : {};
  });

  const navigate = useNavigate();

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
        <NavLink to="/dashboard" className="menu-item">
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>

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
        <NavLink to="/profile" className="profile-link">
          {user?.profile_picture ? (
            <img
              src={user.profile_picture}
              alt="Profile"
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
              }}
            />
          ) : (
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
              }}
            >
              {initial}
            </div>
          )}

          <div>
            <div style={{ fontSize: "14px", fontWeight: "600" }}>
              {user?.first_name} {user?.last_name}
            </div>
            <div style={{ fontSize: "12px", color: "#cbd5f5" }}>
              {user?.email_id}
            </div>
          </div>
        </NavLink>

        <div className="logout-btn" onClick={handleLogout}>
          <LogoutIcon />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;