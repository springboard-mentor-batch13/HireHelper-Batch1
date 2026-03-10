import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip } from "@mui/material";
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

function SortableTaskCard({ task, onNavigate, onStatusChange }) {
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
          {task.requests?.length || 0} request
          {(task.requests?.length || 0) !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}

const MyTasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-header">
        <h2>My Tasks</h2>
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
                  onNavigate={(id) => navigate(`/task/${id}`)}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default MyTasks;
