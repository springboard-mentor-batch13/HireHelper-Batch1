import { useEffect, useState } from "react";
import { Avatar, Chip, CircularProgress, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import "./MyRequests.css";

const statusColors = {
  pending: "warning",
  accepted: "success",
  declined: "error",
};

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get("/api/requests/sent");
        setRequests(res.data || []);
      } catch {
        toast.error("Failed to load your requests");
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  useEffect(() => {
    const socket = getSocket();
    const handleTaskDeleted = ({ taskId }) => {
      if (!taskId) return;
      setRequests((prev) => prev.filter((r) => r.task?._id !== taskId));
    };

    socket.on("task:deleted", handleTaskDeleted);
    return () => {
      socket.off("task:deleted", handleTaskDeleted);
    };
  }, []);

  return (
    <div className="my-requests-page">
      <div className="my-requests-header">
        <h2>My Requests</h2>
        <span className="my-requests-count">{requests.length} sent</span>
      </div>

      {loading && (
        <div className="my-requests-loading">
          <CircularProgress size={32} />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="my-requests-empty">
          <SendIcon className="empty-icon" />
          <h3>No requests sent yet</h3>
          <p>Browse the feed and request tasks you'd like to help with.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="my-requests-list">
          {requests.map((req) => {
            const task = req.task || {};
            const creator = task.createdBy || {};

            return (
              <div key={req._id} className="my-request-card">
                {task.picture ? (
                  <img src={task.picture} alt={task.title} className="my-request-img" />
                ) : (
                  <div className="my-request-placeholder">
                    <SendIcon />
                  </div>
                )}

                <div className="my-request-body">
                  <div className="my-request-top">
                    <span className="my-request-task-title">
                      {task.title || "Unknown Task"}
                    </span>

                    <Chip
                      label={req.status}
                      color={statusColors[req.status] || "default"}
                      size="small"
                      sx={{ textTransform: "capitalize", fontWeight: 600 }}
                    />
                  </div>

                  {task.location && (
                    <span className="my-request-location">📍 {task.location}</span>
                  )}

                  <div className="my-request-creator-row">
                    <Avatar
                      src={creator.profile_picture}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: 11,
                        bgcolor: "#e2e8f0",
                        color: "#475569",
                      }}
                    >
                      {creator.first_name?.[0] || "?"}
                    </Avatar>

                    <span className="my-request-creator-name">
                      {creator.first_name} {creator.last_name}
                    </span>
                  </div>

                  <span className="my-request-time">
                    Sent{" "}
                    {new Date(req.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>

                  {/* ✅ CHAT BUTTON  */}
                  {req.status === "accepted" && (
                    <div style={{ marginTop: "10px" }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(`/chat/${task._id}`)}
                      >
                        Open Chat
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequests;