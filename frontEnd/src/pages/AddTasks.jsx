import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Typography, InputAdornment } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import "./AddTasks.css";

const AddTask = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [picture, setPicture] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const nowString = useMemo(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60 * 1000);
    return local.toISOString().slice(0, 16);
  }, []);

  const canSubmit = useMemo(
    () => title.trim() && location.trim() && startTime && !loading,
    [title, location, startTime, loading]
  );

  const progress = useMemo(() => {
    const fields = [title, description, location, startTime, endTime, picture];
    const filledCount = fields.filter((f) => !!f).length;
    return Math.floor((filledCount / fields.length) * 100);
  }, [title, description, location, startTime, endTime, picture]);

  function handlePictureChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning("Image must be under 5 MB");
      return;
    }

    setPicture(file);
    setPreview(URL.createObjectURL(file));
  }

  function removePicture() {
    setPicture(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleStartTimeChange(e) {
    const selected = e.target.value;
    const now = new Date();
    const selectedDate = new Date(selected);

    if (selectedDate < now) {
      toast.warning("Start time cannot be in the past!");
      setStartTime("");
      return;
    }

    setStartTime(selected);

    if (endTime && new Date(endTime) <= selectedDate) {
      setEndTime("");
      toast.warning("End time cleared — it was before the new start time");
    }
  }

  function handleEndTimeChange(e) {
    const selected = e.target.value;

    if (startTime && new Date(selected) <= new Date(startTime)) {
      toast.warning("End time must be after start time!");
      setEndTime("");
      return;
    }

    setEndTime(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      toast.warning("Please fill in all required fields");
      return;
    }

    const now = new Date();
    if (new Date(startTime) < now) {
      toast.error("Start time cannot be in the past!");
      return;
    }

    if (endTime && new Date(endTime) <= new Date(startTime)) {
      toast.error("End time must be after start time!");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("startTime", startTime);
      if (endTime) {
        formData.append("endTime", endTime);
      }

      if (picture) {
        formData.append("picture", picture);
      }

      await api.upload("/api/tasks", formData);
      toast.success("Task created successfully!");
      navigate("/my-tasks");

    } catch (err) {
      toast.error(err?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-task-page">
      <div className="add-task-header">
        <h2>Create a New Task</h2>
        <p className="add-task-subtitle">
          Fill out the details below to post a task for helpers in your area.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="add-task-sections">
        <div className="add-task-card details-card">
          <div className="card-section-header">
            <InfoOutlinedIcon /> Task Details
          </div>

          <div className="field-group">
            <label className="field-label">Title <span className="required">*</span></label>
            <TextField
              fullWidth
              placeholder="Help with moving groceries"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <TextField
              fullWidth
              placeholder="Describe what help you need in detail..."
              multiline
              minRows={4}
              maxRows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="add-task-card photo-card">
          <div className="card-section-header">
            <CameraAltIcon /> Task Photo
          </div>
          <Typography variant="body2" sx={{ color: "var(--text-muted)", mb: 2, lineHeight: 1.6 }}>
            Adding a photo helps helpers understand the task better and increases your chances of getting help.
          </Typography>

          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/*"
            onChange={handlePictureChange}
          />

          <div
            className={`upload-area ${preview ? "has-preview" : ""}`}
            onClick={() => !preview && fileRef.current?.click()}
          >
            {!preview ? (
              <div className="upload-placeholder">
                <div className="upload-icon-wrapper">
                  <CloudUploadIcon />
                </div>
                <p><span>Click here to upload</span> or drag and drop</p>
                <p className="upload-support-text">
                  PNG, JPG or WEBP (Max. 5MB)
                </p>
              </div>
            ) : (
              <div className="preview-wrapper">
                <img src={preview} alt="Preview" className="picture-preview" />
                <button
                  type="button"
                  className="remove-preview"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePicture();
                  }}
                >
                  ×
                </button>
              </div>
            )}
          </div>

          </div>

        <div className="add-task-card location-card">
          <div className="card-section-header">
            <EventNoteIcon /> Location & Schedule
          </div>

          <div className="field-group">
            <label className="field-label">
              <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
              Location <span className="required">*</span>
            </label>
            <TextField
              fullWidth
              placeholder="e.g., Brigade Road, Bangalore"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationOnIcon sx={{ fontSize: 20, opacity: 0.4 }} />
                  </InputAdornment>
                ),
              }}
            />
          </div>

          <div className="field-group">
            <label className="field-label">
              <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
              Time
            </label>
            <div className="time-row">
              <TextField
                fullWidth
                label="Start Time *"
                type="datetime-local"
                required
                value={startTime}
                onChange={handleStartTimeChange}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                inputProps={{ min: nowString }}
                helperText="Must be today or a future date/time"
              />
              <TextField
                fullWidth
                label="End Time (optional)"
                type="datetime-local"
                value={endTime}
                onChange={handleEndTimeChange}
                InputLabelProps={{ shrink: true }}
                disabled={loading || !startTime}
                inputProps={{ min: startTime || nowString }}
                helperText={startTime ? "Must be after start time" : "Set start time first"}
              />
            </div>
          </div>
        </div>

        <div className="add-task-card notes-card">
          <div className="card-section-header">
            <InfoOutlinedIcon /> Important Notes
          </div>
          <ul className="notes-list">
            <li>Be <strong>specific</strong> about what help you need — vague tasks get fewer responses.</li>
            <li>Include a <strong>fair budget</strong> in your description to attract quality helpers.</li>
            <li>Adding a <strong>photo</strong> increases your chances of getting help by 3×.</li>
            <li>Set a <strong>realistic time</strong> — helpers need time to prepare and travel.</li>
            <li>Your <strong>location</strong> helps match nearby helpers for faster assistance.</li>
          </ul>
        </div>

        <div className="add-task-footer-progress">
          <div className="progress-section">
            <div className="progress-label">
              <span>Form Completeness</span>
              <span className="progress-percent">{progress}%</span>
            </div>
            <div className={`progress-bar-container ${progress === 0 ? 'is-empty' : ''}`}>
              <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          className="create-task-btn"
          disabled={!canSubmit}
        >
          {loading ? "Creating Task..." : "🚀 Post Task Now"}
        </Button>
      </form>
    </div>
  );
};

export default AddTask;