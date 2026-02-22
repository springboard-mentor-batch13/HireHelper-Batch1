import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
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

  const canSubmit = useMemo(
    () => title.trim() && location.trim() && startTime && !loading,
    [title, location, startTime, loading]
  );

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!canSubmit) {
      toast.warning("Please fill in all required fields");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("location", location.trim());
      formData.append("start_time", new Date(startTime).toISOString());
      if (endTime) formData.append("end_time", new Date(endTime).toISOString());
      if (picture) formData.append("picture", picture);

      await api.upload("/api/tasks", formData);
      toast.success("Task created successfully!");
      navigate("/my-tasks");
    } catch (err) {
      toast.error(err.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-task-page">
      <h2>Create a New Task</h2>
      <p className="add-task-subtitle">
        Fill out the details below to post a task for helpers.
      </p>

      <div className="add-task-card">
        <form onSubmit={handleSubmit}>
          {/* Details section */}
          <div className="form-section">
            <div className="form-section-label">
              <InfoOutlinedIcon /> Details
            </div>
            <div className="form-fields">
              <TextField
                fullWidth
                label="Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="e.g. Help with groceries"
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                minRows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Describe what you need help with..."
              />
            </div>
          </div>

          {/* Location section */}
          <div className="form-section">
            <div className="form-section-label">
              <LocationOnIcon /> Location
            </div>
            <TextField
              fullWidth
              label="Location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="e.g. Sector 18, Noida"
            />
          </div>

          {/* Schedule section */}
          <div className="form-section">
            <div className="form-section-label">
              <AccessTimeIcon /> Schedule
            </div>
            <div className="time-row">
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={loading}
              />
              <TextField
                fullWidth
                label="End Time (optional)"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                disabled={loading}
              />
            </div>
          </div>

          {/* Picture section */}
          <div className="form-section">
            <div className="form-section-label">
              <CloudUploadIcon /> Picture
            </div>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePictureChange}
            />

            <div
              className={`upload-area ${preview ? "has-preview" : ""}`}
              onClick={() => !preview && fileRef.current?.click()}
            >
              {!preview ? (
                <div className="upload-placeholder">
                  <CloudUploadIcon />
                  <p>
                    <span>Click to upload</span> an image
                  </p>
                  <p className="upload-hint">JPEG, PNG, GIF or WebP (max 5 MB)</p>
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
                    &times;
                  </button>
                </div>
              )}
            </div>
            {picture && (
              <p className="preview-filename">{picture.name}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!canSubmit}
            sx={{
              py: 1.5,
              fontWeight: 600,
              fontSize: 15,
              textTransform: "none",
              borderRadius: "8px",
              mt: 1,
            }}
          >
            {loading ? "Creating Task..." : "Create Task"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
