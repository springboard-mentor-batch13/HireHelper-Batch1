import { useEffect, useState, useRef } from "react";
import { IconButton, Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./TopBar.css";

const TopBar = ({ title }) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    const handleNotificationsUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, []);

  async function fetchNotifications() {
    try {
      const res = await api.get("/api/requests/notifications");
      setNotifications(res.data || []);
    } catch (err) {
      // silently fail
    }
  }

  async function handleOpen() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      try {
        await api.patch("/api/requests/notifications/read");
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      } catch (err) {
        // silently fail
      }
    }
  }

  function handleNotifClick(notification) {
    setOpen(false);
    const msg = notification.message?.toLowerCase() || "";
    if (msg.includes("accepted") || msg.includes("declined")) {
      navigate("/my-requests");
    } else {
      navigate("/requests");
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <h1 className="topbar-title">{title}</h1>

      <div className="topbar-right" ref={dropdownRef}>
        <IconButton onClick={handleOpen} size="small">
          <Badge badgeContent={unreadCount} color="error" max={9}>
            <NotificationsIcon sx={{ color: "#475569" }} />
          </Badge>
        </IconButton>

        {open && (
          <div className="notif-dropdown">
            <div className="notif-header">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-unread-badge">{unreadCount} new</span>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="notif-empty">No notifications yet</div>
            ) : (
              <div className="notif-list">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`notif-item ${!n.read ? "notif-unread" : ""}`}
                    onClick={() => handleNotifClick(n)}
                    style={{ cursor: "pointer" }}
                  >
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">
                      {new Date(n.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;