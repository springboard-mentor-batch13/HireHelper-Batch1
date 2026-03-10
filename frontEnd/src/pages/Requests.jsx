import { useEffect, useState } from "react";
import { Avatar, Chip, Button, CircularProgress } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import "./Requests.css";

const statusColors = {
  pending: "warning",
  accepted: "success",
  declined: "error",
};

function getInitials(user) {
  if (!user) return "?";
  return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase();
}

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await api.get("/api/requests/received");
        setRequests(res.data || []);
      } catch (err) {
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

  async function handleUpdate(requestId, status) {
    try {
      setUpdating(requestId);
      await api.patch(`/api/requests/${requestId}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r._id === requestId ? { ...r, status } : r))
      );
      toast.success(`Request ${status}`);
    } catch (err) {
      toast.error(err.message || "Failed to update request");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="requests-page">
      <div className="requests-header">
        <h2>Requests</h2>
        <span className="requests-count">{requests.length} total</span>
      </div>

      {loading && (
        <div className="requests-loading">
          <CircularProgress size={32} />
        </div>
      )}

      {!loading && requests.length === 0 && (
        <div className="requests-empty">
          <AssignmentIcon className="empty-icon" />
          <h3>No requests yet</h3>
          <p>When someone requests to help with your tasks, they'll appear here.</p>
        </div>
      )}

      {!loading && requests.length > 0 && (
        <div className="requests-list">
          {requests.map((req) => (
            <div key={req._id} className="request-card">
              <div className="request-task-banner">
                {req.task?.picture ? (
                  <img src={req.task.picture} alt={req.task.title} />
                ) : (
                  <div className="request-task-placeholder">
                    <AssignmentIcon />
                  </div>
                )}
                <span className="request-task-title">{req.task?.title || "Unknown Task"}</span>
              </div>

              <div className="request-card-body">
                <div className="request-helper-row">
                  <Avatar
                    src={req.helper?.profile_picture}
                    sx={{ width: 44, height: 44, bgcolor: "#2563eb", fontSize: 16 }}
                  >
                    {getInitials(req.helper)}
                  </Avatar>
                  <div className="request-helper-info">
                    <span className="request-helper-name">
                      {req.helper?.first_name} {req.helper?.last_name}
                    </span>
                    <span className="request-helper-email">{req.helper?.email_id}</span>
                  </div>
                  <Chip
                    label={req.status}
                    color={statusColors[req.status] || "default"}
                    size="small"
                    sx={{ textTransform: "capitalize", fontWeight: 600, ml: "auto" }}
                  />
                </div>

                <div className="request-time">
                  {new Date(req.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>

                {req.status === "pending" && (
                  <div className="request-actions">
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckIcon />}
                      disabled={updating === req._id}
                      onClick={() => handleUpdate(req._id, "accepted")}
                      sx={{ textTransform: "none", borderRadius: "8px", flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<CloseIcon />}
                      disabled={updating === req._id}
                      onClick={() => handleUpdate(req._id, "declined")}
                      sx={{ textTransform: "none", borderRadius: "8px", flex: 1 }}
                    >
                      Decline
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
