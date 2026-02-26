import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { toast } from "react-toastify";
import { api, API_BASE_URL } from "../lib/api";
import "./MyTasks.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const statusColors = {
  open: "success",
  in_progress: "warning",
  completed: "info",
  cancelled: "default",
};

function getGradientClass(task) {
  const key = task._id || task.title || "";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const idx = (hash % 4) + 1;
  return `gradient-${idx}`;
}

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
      
        const response = await api.get("/api/tasks/mine");

        setTasks(response.data || []);
      } catch (err) {
        toast.error(err.message || "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h2>My Tasks</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/add-task")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            px: 2.5,
          }}
        >
          New Task
        </Button>
      </div>

      {loading && <p className="status-text">Loading your tasks...</p>}

      {!loading && tasks.length === 0 && (
        <div className="empty-state">
          <AssignmentIcon className="empty-state-icon" />
          <h3>No tasks yet</h3>
          <p>Create your first task and start getting help.</p>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/add-task")}
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Create Task
          </Button>
        </div>
      )}

      <div className="tasks-grid">
        {tasks.map((task) => (
          <div className="task-card" key={task._id}>
            {task.picture ? (
              <img
                src={task.picture}
                alt={task.title}
                className="task-card-image"
              />
            ) : (
              <div className={`task-card-placeholder ${getGradientClass(task)}`}>
                <span className="task-card-placeholder-title">
                  {task.title}
                </span>
              </div>
            )}

            <div className="task-card-body">
              <div className="task-card-top">
                <h3 className="task-card-title">{task.title}</h3>

                <Chip
                  label={(task.status || "open").replace("_", " ")}
                  color={statusColors[task.status] || "success"}
                  size="small"
                  onClick={() => navigate(`/task/${task._id}`)}
                  sx={{
                    textTransform: "capitalize",
                    fontWeight: 500,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                />
              </div>

              {task.description && (
                <p className="task-card-desc">{task.description}</p>
              )}

              <div className="task-card-meta-row">
                <div className="task-card-meta">
                  <LocationOnIcon fontSize="small" />
                  {task.location}
                </div>

                <div className="task-card-meta">
                  <AccessTimeIcon fontSize="small" />
                  {formatDate(task.startTime)}
                  {task.endTime && ` — ${formatDate(task.endTime)}`}
                </div>
              </div>

              <div className="task-card-footer">
                <PeopleIcon fontSize="small" />
                {task.requests?.length || 0} request
                {(task.requests?.length || 0) !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasks;