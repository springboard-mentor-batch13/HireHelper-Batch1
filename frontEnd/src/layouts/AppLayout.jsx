import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { toast } from "react-toastify";
import { getSocket } from "../lib/socket";
import "./AppLayout.css";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/feed": "Feed",
  "/my-tasks": "My Tasks",
  "/add-task": "Add Task",
  "/requests": "Requests",
  "/my-requests": "My Requests",
  "/settings": "Settings",
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const title = pageTitles[location.pathname] || "HireHelper";

  useEffect(() => {
    const socket = getSocket();

    const handleTaskRequested = (payload) => {
      const { taskTitle, helper } = payload || {};
      const helperName =
        (helper?.first_name && helper?.last_name && `${helper.first_name} ${helper.last_name}`) ||
        helper?.first_name ||
        "Someone";

      toast.info(`${helperName} requested to help with "${taskTitle || "your task"}"`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }

      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      } catch {
        // ignore audio errors
      }
    };

    const handleChatMessage = (payload) => {
      const { taskId, senderName, text } = payload || {};
      const onSameChatPage = location.pathname === `/chat/${taskId}`;
      if (onSameChatPage) return;

      const preview = text && text.length > 50 ? `${text.slice(0, 50)}...` : text;
      toast.info(`${senderName || "Someone"}: ${preview || "sent a message"}`, {
        onClick: () => {
          if (taskId) {
            navigate(`/chat/${taskId}`);
          }
        },
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("notifications-updated"));
      }

      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      } catch {
        // ignore audio errors
      }
    };

    socket.on("task:requested", handleTaskRequested);
    socket.on("chat:new_message", handleChatMessage);

    return () => {
      socket.off("task:requested", handleTaskRequested);
      socket.off("chat:new_message", handleChatMessage);
    };
  }, [location.pathname, navigate]);

  return (
    <div className="app-layout">
      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}
      <Sidebar isOpen={isMobileMenuOpen} closeMenu={() => setIsMobileMenuOpen(false)} />
      <main className="app-content">
        <TopBar title={title} toggleMenu={() => setIsMobileMenuOpen(true)} />
        <div className="app-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;