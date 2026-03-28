import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import "./Settings.css";

export default function Settings() {
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isRemoved, setIsRemoved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/user/me").then((res) => {
      setUser(res);
      setImageUrl(res.profile_picture || "");
    });
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const preview = image
    ? URL.createObjectURL(image)
    : imageUrl || "";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleRemovePhoto = async () => {
    try {
      setImage(null);
      setImageUrl("");
      setUser((prev) => ({ ...prev, profile_picture: "" }));

      const formData = new FormData();
      formData.append("remove_profile_picture", "true");

      await api.upload("/api/user/update", formData);

      const updated = await api.get("/api/user/me");

      setUser(updated);
      setImageUrl(updated.profile_picture || "");
      setIsRemoved(true);

      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("user-updated"));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      formData.append("first_name", user.first_name || "");
      formData.append("last_name", user.last_name || "");
      formData.append("email_id", user.email_id || "");
      formData.append("phone_number", user.phone_number || "");
      formData.append("bio", user.bio || "");

      if (isRemoved || (!image && !imageUrl)) {
        formData.append("remove_profile_picture", "true");
      }

      if (image) {
        formData.append("profile_picture", image);
      }

      await api.upload("/api/user/update", formData);

      const updated = await api.get("/api/user/me");

      setUser(updated);
      setImage(null);
      setImageUrl(updated.profile_picture || "");
      setIsRemoved(false);

      localStorage.setItem("user", JSON.stringify(updated));
      window.dispatchEvent(new Event("user-updated"));

      alert("Profile updated!");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>

      {/* PROFILE */}
      <div className="card">
        <h3>Profile Picture</h3>

        <div className="profile-section">
          <img
            src={preview || "/default.png"}
            alt="profile"
            className="profile-img"
          />

          <div className="profile-actions">
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />

            <label htmlFor="fileInput" className="change-btn">
              Change Photo
            </label>

            {(imageUrl || image) && (
              <button className="remove-btn" onClick={handleRemovePhoto}>
                Remove
              </button>
            )}

            <p className="file-info">JPG, PNG up to 5MB</p>
          </div>
        </div>
      </div>

      {/* PERSONAL INFO */}
      <div className="card">
        <h3>Personal Information</h3>

        <div className="grid">
          <input
            name="first_name"
            value={user.first_name || ""}
            onChange={handleChange}
            placeholder="First Name"
          />

          <input
            name="last_name"
            value={user.last_name || ""}
            onChange={handleChange}
            placeholder="Last Name"
          />
        </div>

        <input
          name="email_id"
          value={user.email_id || ""}
          onChange={handleChange}
          placeholder="Email"
        />

        <input
          name="phone_number"
          value={user.phone_number || ""}
          onChange={handleChange}
          placeholder="Phone"
        />

        <textarea
          name="bio"
          value={user.bio || ""}
          onChange={handleChange}
          placeholder="Bio (optional)"
        />

        <button className="save-btn" onClick={handleSubmit}>
          Save Changes
        </button>
      </div>

      {/* SECURITY */}
      <div className="card">
        <h3>Account Security</h3>

        <button
          className="btn"
          onClick={() => navigate("/forgot-password")}
        >
          Change Password
        </button>
      </div>
    </div>
  );
}