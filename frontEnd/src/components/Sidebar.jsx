import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/DynamicFeed";
import TaskIcon from "@mui/icons-material/Task";
import AddIcon from "@mui/icons-material/AddBox";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { api, setToken } from "../lib/api";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call logout API
      await api.post("/api/auth/logout");
      
      // Clear local storage
      setToken(null);
      localStorage.removeItem("isLoggedIn");
      
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (e) {
      // Even if API call fails, clear local storage and logout
      setToken(null);
      localStorage.removeItem("isLoggedIn");
      toast.error(e.message || "Logout failed, but you've been logged out locally");
      navigate("/login", { replace: true });
    }
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        HireHelper
      </div>

      <nav className="sidebar-menu">
        <NavLink to="/dashboard" className="menu-item">
          <DashboardIcon />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/feed" className="menu-item">
          <FeedIcon />
          <span>Feed</span>
        </NavLink>

        <NavLink to="#" className="menu-item">
          <TaskIcon />
          <span>My Tasks</span>
        </NavLink>

        <NavLink to="#" className="menu-item">
          <AddIcon />
          <span>Add Task</span>
        </NavLink>

        <NavLink to="#" className="menu-item">
          <SettingsIcon />
          <span>Settings</span>
        </NavLink>
      </nav>

      {/* Logout Section */}
      <div className="menu-item logout" onClick={handleLogout}>
        <LogoutIcon />
        <span>Logout</span>
      </div>
    </aside>
  );
};

export default Sidebar;
