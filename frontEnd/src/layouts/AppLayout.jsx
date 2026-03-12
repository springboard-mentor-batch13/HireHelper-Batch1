import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
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
  const title = pageTitles[location.pathname] || "HireHelper";

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-content">
        <TopBar title={title} />
        <div className="app-page">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;