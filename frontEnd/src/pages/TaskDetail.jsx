import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api, API_BASE_URL } from "../lib/api";
import { toast } from "react-toastify";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleIcon from "@mui/icons-material/People";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTask() {
      try {
        const res = await api.get(`/api/tasks/${id}`);

        // ✅ Your backend returns task directly
        setTask(res.data);

      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load task"
        );
        setTask(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTask();
  }, [id]);

  if (loading) return <p>Loading task...</p>;
  if (!task) return <p>Task not found</p>;

  return (
    <div className="task-detail-page">
      <h2>{task.title}</h2>

      {task.picture && (
        <img
          src={task.picture}
          alt={task.title}
          className="task-detail-image"
        />
      )}

      <p>{task.description}</p>

      <div className="task-detail-meta">
        <LocationOnIcon fontSize="small" />
        <span style={{ marginLeft: "6px" }}>{task.location}</span>
      </div>

      <div className="task-detail-meta">
        <AccessTimeIcon fontSize="small" />
        <span style={{ marginLeft: "6px" }}>
          {formatDate(task.startTime)}
          {task.endTime && ` — ${formatDate(task.endTime)}`}
        </span>
      </div>

      <div className="task-detail-meta">
        <PeopleIcon fontSize="small" />
        <span style={{ marginLeft: "6px" }}>
          {task.requests?.length || 0} requests
        </span>
      </div>
    </div>
  );
};

export default TaskDetail;