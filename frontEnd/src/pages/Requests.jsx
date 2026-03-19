import { useEffect, useState } from "react";
import { Chip, Button, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { useNavigate } from "react-router-dom";

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

  if (loading)
    return (
      <div style={{ padding: 30 }}>
        <CircularProgress />
      </div>
    );

  if (!requests.length)
    return <div style={{ padding: 30 }}>No Requests Found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Requests</h2>

      {requests.map((req) => (
        <div
          key={req._id}
          style={{
            border: "1px solid #ddd",
            padding: 15,
            marginBottom: 10,
          }}
        >
          <h3>{req.task?.title}</h3>

          <p>
            {req.helper?.first_name} {req.helper?.last_name}
          </p>

          <Chip
            label={req.status}
            color={statusColors[req.status]}
          />

          {req.status === "pending" && (
            <div style={{ marginTop: 10 }}>
              <Button
                variant="contained"
                color="success"
                disabled={updating === req._id}
                onClick={() =>
                  handleUpdate(req._id, "accepted", req.task?._id)
                }
                sx={{ mr: 1 }}
              >
                Accept
              </Button>

              <Button
                variant="outlined"
                color="error"
                disabled={updating === req._id}
                onClick={() =>
                  handleUpdate(req._id, "declined", req.task?._id)
                }
              >
                Decline
              </Button>
            </div>
          )}

          {req.status === "accepted" && (
            <div style={{ marginTop: 10 }}>
              <Button
                variant="contained"
                onClick={() =>
                  navigate(`/chat/${req.task?._id}`)
                }
              >
                Open Chat
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Requests;