import { useEffect, useState } from "react";
import { Chip, Button, CircularProgress, Avatar } from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";
import "./Requests.css";

const statusColors = {
  pending: "warning",
  accepted: "success",
  declined: "error",
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get("/api/requests/received");
        setRequests(res.data || []);
      } catch {
        toast.error("Failed to load requests");
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

  async function handleUpdate(requestId, status, taskId) {
    try {
      setUpdating(requestId);

      await api.patch(`/api/requests/${requestId}`, { status });

      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status } : r
        )
      );

      toast.success(`Request ${status}`);

      if (status === "accepted") {
        navigate(`/chat/${taskId}`);
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h2>Incoming Help Requests</h2>
      </div>

      {loading && (
        <div className="requests-loading">
          <CircularProgress size={32} />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="requests-empty">
          <InboxIcon className="empty-icon" />
          <h3>No requests received yet</h3>
          <p>When someone requests to help with your tasks, they'll appear here.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-task-banner" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                  {req.task?.picture ? (
                    <img src={req.task.picture} alt={req.task.title} />
                  ) : (
                    <div className="request-task-placeholder">
                      <InboxIcon sx={{ fontSize: 28 }} />
                    </div>
                  )}
                  <span className="request-task-title">{req.task?.title}</span>
                </div>
                <Chip
                  label={req.status}
                  color={statusColors[req.status]}
                  size="small"
                  sx={{ fontWeight: 600, textTransform: 'capitalize', flexShrink: 0 }}
                />
              </div>

              <div className="request-card-body">
                <p className="request-time" style={{ marginBottom: '12px', marginTop: '0' }}>
                  Requested on {new Date(req.createdAt).toLocaleDateString()}
                </p>

                <div className="request-helper-row" style={{ marginBottom: '0' }}>
                  <Avatar 
                    src={req.helper?.profile_picture} 
                    sx={{ width: 32, height: 32, bgcolor: 'var(--accent)', fontSize: 13 }}
                  >
                    {req.helper?.first_name?.[0]}
                  </Avatar>
                  <div className="request-helper-info">
                    <span className="request-helper-name" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {req.helper?.first_name} {req.helper?.last_name}
                      {req.helper?.ratingAvg > 0 && (
                        <span style={{ fontSize: "12px", color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)", padding: "2px 6px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "2px" }}>
                          ⭐ {req.helper.ratingAvg.toFixed(1)}/5
                        </span>
                      )}
                    </span>
                    <span className="request-helper-email">{req.helper?.email_id}</span>
                  </div>
                </div>

                {req.status === "pending" && (
                  <div className="request-actions">
                    <Button
                      variant="contained"
                      color="success"
                      size="medium"
                      disabled={updating === req._id}
                      onClick={() => handleUpdate(req._id, "accepted", req.task?._id)}
                      fullWidth
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="medium"
                      disabled={updating === req._id}
                      onClick={() => handleUpdate(req._id, "declined", req.task?._id)}
                      fullWidth
                    >
                      Decline
                    </Button>
                  </div>
                )}

                {req.status === "accepted" && (
                  <div className="request-actions">
                    <Button
                      variant="contained"
                      size="medium"
                      fullWidth
                      startIcon={<ChatBubbleOutlineIcon />}
                      sx={{ py: 1, fontSize: "14px", fontWeight: 600 }}
                      onClick={() => navigate(`/chat/${req.task?._id}`)}
                    >
                      Open Chat
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;