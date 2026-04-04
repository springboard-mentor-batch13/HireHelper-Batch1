import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import RatingModal from "../components/RatingModal";
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

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function getGradientClass(task) {
  const key = task._id || task.title || "";
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const idx = (hash % 4) + 1;
  return `gradient-${idx}`;
}

// Status dropdown component
function StatusDropdown({ taskId, currentStatus, onStatusChange }) {
  const [open, setOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSelect(newStatus) {
    if (newStatus === currentStatus) {
      setOpen(false);
      return;
    }
    try {
      setUpdating(true);
      await api.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      onStatusChange(taskId, newStatus);
      toast.success(`Status updated to ${newStatus.replace("_", " ")}`);
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <Chip
        label={updating ? "Updating..." : (currentStatus || "open").replace("_", " ")}
        color={statusColors[currentStatus] || "success"}
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        sx={{
          textTransform: "capitalize",
          fontWeight: 500,
          fontSize: 11,
          cursor: "pointer",
        }}
      />

      {open && (
        <div className="status-dropdown">
          {statusOptions.map((opt) => (
            <div
              key={opt.value}
              className={`status-dropdown-item ${opt.value === currentStatus ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(opt.value);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableTaskCard({ task, onStatusChange, onEdit }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isDragging ? "task-card-dragging" : ""}`}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
    >
      {task.picture ? (
        <img src={task.picture} alt={task.title} className="task-card-image" />
      ) : (
        <div className={`task-card-placeholder ${getGradientClass(task)}`}>
          <span className="task-card-placeholder-title">{task.title}</span>
        </div>
      )}

      <div className="task-card-body">
        <div className="task-card-top">
          <h3 className="task-card-title">{task.title}</h3>
          <StatusDropdown
            taskId={task._id}
            currentStatus={task.status}
            onStatusChange={onStatusChange}
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
          {(() => {
            const accepted = task.requests?.find((r) => r.status === "accepted");
            if (accepted) {
              const name = accepted.helper?.first_name
                ? `${accepted.helper.first_name} ${accepted.helper.last_name}`
                : "Someone";
              return `Accepted: ${name}`;
            }
            return `${task.requests?.length || 0} request${(task.requests?.length || 0) !== 1 ? "s" : ""}`;
          })()}
        </div>
      </div>
    </div>
  );
}

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rating Modal state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingTask, setRatingTask] = useState(null);
  const [ratingHelperName, setRatingHelperName] = useState("");

  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const editFileRef = useRef(null);
  const [editPictureFile, setEditPictureFile] = useState(null);
  const [editPreview, setEditPreview] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [deletingTask, setDeletingTask] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t._id === active.id);
    const newIndex = tasks.findIndex((t) => t._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(tasks, oldIndex, newIndex);
    setTasks(reordered);

    try {
      const res = await api.patch("/api/tasks/reorder", {
        taskIds: reordered.map((t) => t._id),
      });
      if (res?.data) setTasks(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to save order");
      setTasks(tasks);
    }
  };

  // Update status locally without refetching
  const handleStatusChange = (taskId, newStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    // If completed, trigger rating modal
    if (newStatus === "completed") {
      const task = tasks.find((t) => t._id === taskId);
      if (task) {
        // Find accepted helper name from requests OR use generic
        const acceptedRequest = task.requests?.find((r) => r.status === "accepted");
        let helperName = "your helper";
        
        if (acceptedRequest && acceptedRequest.helper) {
          // If the helper object is populated
          if (acceptedRequest.helper.first_name) {
            helperName = `${acceptedRequest.helper.first_name} ${acceptedRequest.helper.last_name}`;
          }
        }
        
        setRatingTask(task);
        setRatingHelperName(helperName);
        setRatingModalOpen(true);
      }
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || "");
    setEditDescription(task.description || "");
    setEditLocation(task.location || "");
    setEditStartTime(task.startTime ? String(task.startTime).slice(0, 16) : "");
    setEditEndTime(task.endTime ? String(task.endTime).slice(0, 16) : "");
    setEditPictureFile(null);
    setEditPreview(task.picture || null);
    if (editFileRef.current) editFileRef.current.value = "";
  };

  const closeEditDialog = () => {
    if (savingEdit || uploadingPicture || deletingTask) return;
    setEditingTask(null);
  };

  const handleEditPictureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image must be under 5 MB");
      return;
    }
    setEditPictureFile(file);
    setEditPreview(URL.createObjectURL(file));
  };

  const handleUploadEditPicture = async () => {
    if (!editingTask) return;
    if (!editPictureFile) {
      toast.warning("Please choose an image first");
      return;
    }
    try {
      setUploadingPicture(true);
      const formData = new FormData();
      formData.append("picture", editPictureFile);
      const res = await api.upload(`/api/tasks/${editingTask._id}/picture`, formData);
      if (res?.data) {
        const updated = res.data;
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
        );
        setEditingTask((prev) => (prev ? { ...prev, ...updated } : prev));
        setEditPictureFile(null);
        toast.success("Picture updated");
      }
    } catch (err) {
      toast.error(err.message || "Failed to update picture");
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    if (!editTitle.trim() || !editLocation.trim() || !editStartTime) {
      toast.warning("Title, location and start time are required");
      return;
    }
    try {
      setSavingEdit(true);
      const body = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        location: editLocation.trim(),
        start_time: new Date(editStartTime).toISOString(),
        end_time: editEndTime ? new Date(editEndTime).toISOString() : "",
      };
      const res = await api.patch(`/api/tasks/${editingTask._id}`, body);
      if (res?.data) {
        const updated = res.data;
        setTasks((prev) =>
          prev.map((t) => (t._id === updated._id ? { ...t, ...updated } : t))
        );
        toast.success("Task updated");
      }
      setEditingTask(null);
    } catch (err) {
      toast.error(err.message || "Failed to update task");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    const confirmed = window.confirm("Delete this task permanently?");
    if (!confirmed) return;

    try {
      setDeletingTask(true);
      await api.delete(`/api/tasks/${editingTask._id}`);
      setTasks((prev) => prev.filter((t) => t._id !== editingTask._id));
      toast.success("Task deleted");
      setEditingTask(null);
    } catch (err) {
      toast.error(err.message || "Failed to delete task");
    } finally {
      setDeletingTask(false);
    }
  };

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h2>Tasks I've Posted</h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/add-task")}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: "8px", px: 2.5 }}
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

      {!loading && tasks.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasks.map((t) => t._id)}
            strategy={rectSortingStrategy}
          >
            <div className="tasks-grid">
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={openEditDialog}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={!!editingTask} onClose={closeEditDialog} fullWidth maxWidth="sm">
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 4, marginBottom: 8 }}>
            {editPreview ? (
              <img
                src={editPreview}
                alt="Task"
                style={{ width: 140, height: 100, borderRadius: 10, objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: 140,
                  height: 100,
                  borderRadius: 10,
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#64748b",
                  fontWeight: 600,
                }}
              >
                No image
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                ref={editFileRef}
                type="file"
                hidden
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleEditPictureChange}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => editFileRef.current?.click()}
                sx={{ textTransform: "none", borderRadius: "8px" }}
                disabled={uploadingPicture || savingEdit}
              >
                Choose image
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleUploadEditPicture}
                sx={{ textTransform: "none", borderRadius: "8px" }}
                disabled={!editPictureFile || uploadingPicture || savingEdit}
              >
                {uploadingPicture ? "Uploading..." : "Update image"}
              </Button>
            </div>
          </div>

          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            minRows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <TextField
            fullWidth
            label="Location"
            margin="normal"
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
          />
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <TextField
              fullWidth
              label="Start Time"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={editStartTime}
              onChange={(e) => setEditStartTime(e.target.value)}
            />
            <TextField
              fullWidth
              label="End Time (optional)"
              type="datetime-local"
              InputLabelProps={{ shrink: true }}
              value={editEndTime}
              onChange={(e) => setEditEndTime(e.target.value)}
            />
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            color="error"
            onClick={handleDeleteTask}
            disabled={savingEdit || uploadingPicture || deletingTask}
            sx={{ textTransform: "none", mr: "auto" }}
          >
            {deletingTask ? "Deleting..." : "Delete Task"}
          </Button>
          <Button onClick={closeEditDialog} disabled={savingEdit || uploadingPicture || deletingTask} sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveEdit}
            disabled={savingEdit || uploadingPicture || deletingTask}
            sx={{ textTransform: "none" }}
          >
            {savingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <RatingModal
        open={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        taskId={ratingTask?._id}
        taskTitle={ratingTask?.title}
        helperName={ratingHelperName}
      />
    </div>
  );
};

export default MyTasks;
