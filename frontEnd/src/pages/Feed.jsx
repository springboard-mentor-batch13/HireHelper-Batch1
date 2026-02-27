import { useEffect, useState } from "react";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { api } from "../lib/api";
import { toast } from "react-toastify";
import "./Feed.css";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const Feed = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [requestedIds, setRequestedIds] = useState([]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await api.get("/api/tasks/feed");
        setTasks(res.data || []); // ✅ fixed: res is already parsed
      } catch (err) {
        toast.error("Failed to load feed");
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handleRequest = async (taskId) => {
    try {
      await api.post(`/api/requests`, { taskId });
      setRequestedIds((prev) => [...prev, taskId]);
      toast.success("Request sent!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send request");
    }
  };

  const filtered = tasks.filter(
    (t) =>
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="feed-page">
      {/* Header */}
      <div className="feed-header">
        <div>
          <h2 className="feed-title">Feed</h2>
          <p className="feed-subtitle">Find tasks that need help</p>
        </div>
        <div className="feed-search">
          <SearchIcon className="search-icon" fontSize="small" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="feed-loading">
          <div className="spinner" />
          <p>Loading tasks...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="feed-empty">
          <p>No tasks available right now.</p>
        </div>
      ) : (
        <div className="feed-grid">
          {filtered.map((task) => {
            const isRequested = requestedIds.includes(task._id);
            return (
              <div className="task-card" key={task._id}>
                {/* Image */}
                <div className="task-card-image">
                  {task.picture ? (
                    <img src={task.picture} alt={task.title} />
                  ) : (
                    <div className="task-card-no-image">
                      <span>{task.title?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                  {task.category && (
                    <span className="task-category-badge">{task.category}</span>
                  )}
                </div>

                {/* Body */}
                <div className="task-card-body">
                  <h3 className="task-card-title">{task.title}</h3>
                  {task.description && (
                    <p className="task-card-desc">{task.description}</p>
                  )}

                  <div className="task-card-meta">
                    <span>
                      <LocationOnIcon fontSize="inherit" />
                      {task.location}
                    </span>
                    <span>
                      <AccessTimeIcon fontSize="inherit" />
                      {formatDate(task.startTime)}
                    </span>
                  </div>

                  {/* Creator */}
                  <div className="task-card-footer">
                    <div className="task-creator">
                      {task.createdBy?.profile_picture ? (
                        <img
                          src={task.createdBy.profile_picture}
                          alt="creator"
                          className="creator-avatar"
                        />
                      ) : (
                        <div className="creator-avatar-placeholder">
                          <PersonIcon fontSize="small" />
                        </div>
                      )}
                      <span>
                        {task.createdBy?.first_name} {task.createdBy?.last_name}
                      </span>
                    </div>

                    <button
                      className={`request-btn ${isRequested ? "requested" : ""}`}
                      onClick={() => !isRequested && handleRequest(task._id)}
                      disabled={isRequested}
                    >
                      {isRequested ? "Request Sent" : "Request"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Feed;
