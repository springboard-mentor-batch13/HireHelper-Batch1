import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";
import PersonIcon from "@mui/icons-material/Person";
import SecurityIcon from "@mui/icons-material/Security";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import PaletteIcon from "@mui/icons-material/Palette";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import "./Settings.css";

export default function Settings() {
  const [user, setUser] = useState({});
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isRemoved, setIsRemoved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FAForm, setShow2FAForm] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isDisabling, setIsDisabling] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get("/api/user/me")
      .then((res) => {
        setUser(res);
        setImageUrl(res.profile_picture || "");
      })
      .catch((err) => {
        toast.error("Failed to fetch user data");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const preview = image
    ? URL.createObjectURL(image)
    : imageUrl || "";

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setImage(file);
      setIsRemoved(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile picture?")) return;
    
    try {
      setLoading(true);
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
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err.message || "Failed to remove photo");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      formData.append("first_name", user.first_name || "");
      formData.append("last_name", user.last_name || "");
      formData.append("email_id", user.email_id || "");
      formData.append("phone_number", user.phone_number || "");

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

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      setLoading(true);
      const data = await api.post("/api/auth/2fa/generate");
      setQrCodeData(data);
      setShow2FAForm(true);
    } catch (err) {
      toast.error(err.message || "Failed to generate 2FA secret");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEnable2FA = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/2fa/enable", { token: twoFactorToken });
      toast.success("2FA enabled successfully!");
      setShow2FAForm(false);
      setQrCodeData(null);
      setTwoFactorToken("");
      // Refresh user data
      const updated = await api.get("/api/user/me");
      setUser(updated);
    } catch (err) {
      toast.error(err?.data?.message || "Invalid 2FA code");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDisable2FA = async () => {
    try {
      setLoading(true);
      await api.post("/api/auth/2fa/disable", { password: confirmPassword });
      toast.success("2FA disabled");
      setIsDisabling(false);
      setConfirmPassword("");
      // Refresh user data
      const updated = await api.get("/api/user/me");
      setUser(updated);
    } catch (err) {
      toast.error(err?.data?.message || "Incorrect password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Account & Profile Settings</h2>
        <p>Manage your account settings and profile information</p>
      </div>

      <div className="settings-grid">
        {/* ROW 1, LEFT: PERSONAL INFO CARD */}
        <form className="card" onSubmit={handleSubmit}>
          <div className="card-header">
            <PersonIcon />
            <h3>Personal Information</h3>
          </div>

          <div className="settings-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input
                  name="first_name"
                  className="settings-input"
                  value={user.first_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. John"
                  required
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  name="last_name"
                  className="settings-input"
                  value={user.last_name || ""}
                  onChange={handleChange}
                  placeholder="e.g. Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email_id"
                className="settings-input"
                value={user.email_id || ""}
                onChange={handleChange}
                placeholder="email@example.com"
                required
                type="email"
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                name="phone_number"
                className="settings-input"
                value={user.phone_number || ""}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="save-section">
              <button className="save-btn" type="submit" disabled={loading}>
                {loading ? "Saving..." : (
                  <>
                    <SaveIcon sx={{ fontSize: 20 }} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* ROW 1, RIGHT: PROFILE PICTURE CARD */}
        <div className="card">
          <div className="card-header">
            <PhotoCameraIcon />
            <h3>Profile Picture</h3>
          </div>

          <div className="profile-section-sidebar">
            <div className="profile-img-container-sq">
              {preview ? (
                <img
                  src={preview}
                  alt="profile"
                  className="profile-img-sq"
                />
              ) : (
                <div className="profile-img-sq placeholder">
                  <PersonIcon sx={{ fontSize: 64 }} />
                </div>
              )}
            </div>

            <div className="profile-actions-sidebar">
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              <label htmlFor="fileInput" className="change-btn">
                <PhotoCameraIcon sx={{ fontSize: 18, mr: 1 }} />
                Change image
              </label>

              {(imageUrl || image) && (
                <button className="remove-btn" onClick={handleRemovePhoto}>
                  <DeleteIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  Remove image
                </button>
              )}

              <p className="file-info">JPG or PNG (max 5MB)</p>
            </div>
          </div>
        </div>

        {/* ROW 2, LEFT: ACCOUNT SECURITY CARD */}
        <div className="card">
          <div className="card-header">
            <SecurityIcon />
            <h3>Account Security</h3>
          </div>
          
          <div className="security-card">
            <div className="security-info">
              <h4>Password</h4>
              <p>Ensure your account stays secure</p>
            </div>
            <button
              className="change-password-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Update
            </button>
          </div>

          <div className="security-card" style={{ marginTop: '20px' }}>
            <div className="security-info">
              <h4>Two-Factor Authentication</h4>
              <p>{user.two_factor_enabled ? "🛡️ Enabled" : "⚠️ Disabled"}</p>
            </div>
            {user.two_factor_enabled ? (
              <button
                className="remove-btn"
                style={{ width: 'auto', padding: '6px 12px' }}
                onClick={() => setIsDisabling(true)}
              >
                Disable
              </button>
            ) : (
              <button
                className="save-btn"
                style={{ width: 'auto', padding: '6px 12px' }}
                onClick={handleSetup2FA}
              >
                Enable
              </button>
            )}
          </div>

          {/* 2FA SETUP MODAL UI */}
          {show2FAForm && qrCodeData && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Setup 2FA</h3>
                <p>Scan this QR code with Google Authenticator or Authy:</p>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <img src={qrCodeData.qrCodeUrl} alt="2FA QR Code" style={{ maxWidth: '200px' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Or enter manually: <strong>{qrCodeData.secret}</strong>
                </p>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Enter 6-digit Code</label>
                  <input
                    className="settings-input"
                    placeholder="000000"
                    value={twoFactorToken}
                    onChange={(e) => setTwoFactorToken(e.target.value)}
                    maxLength={6}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="save-btn" onClick={handleVerifyEnable2FA} disabled={loading}>
                    Verify & Enable
                  </button>
                  <button className="remove-btn" onClick={() => { setShow2FAForm(false); setQrCodeData(null); }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2FA DISABLE CONFIRM MODAL */}
          {isDisabling && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h3>Disable 2FA</h3>
                <p>Enter your password to confirm disabling 2FA:</p>
                <div className="form-group" style={{ marginTop: '20px' }}>
                  <label>Password</label>
                  <input
                    type="password"
                    className="settings-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button className="remove-btn" onClick={handleConfirmDisable2FA} disabled={loading}>
                    Confirm Disable
                  </button>
                  <button className="save-btn" onClick={() => setIsDisabling(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ROW 2, RIGHT: APPEARANCE CARD */}
        <div className="card">
          <div className="card-header">
            <PaletteIcon />
            <h3>Appearance</h3>
          </div>
          <div className="theme-options-grid">
            {[
              { id: "light", label: "Light", c1: "#ffffff", c2: "#2563eb" },
              { id: "dark", label: "Dark", c1: "#111827", c2: "#3b82f6" },
              { id: "midnight", label: "Midnight", c1: "#0f172a", c2: "#6366f1" },
              { id: "amethyst", label: "Amethyst", c1: "#1e1b4b", c2: "#a855f7" },
            ].map((t) => (
              <div
                key={t.id}
                className={`theme-option ${
                  (document.documentElement.dataset.theme || "light") === t.id
                    ? "active"
                    : ""
                }`}
                onClick={() => {
                  document.documentElement.dataset.theme = t.id;
                  localStorage.setItem("theme", t.id);
                  setUser({ ...user }); 
                }}
              >
                <div className="theme-preview-dual">
                  <div className={`color-dot c1 ${t.id === 'light' ? 'light-mode-dot' : ''}`} style={{ backgroundColor: t.c1 }}></div>
                  <div className="color-dot c2" style={{ backgroundColor: t.c2 }}></div>
                </div>
                <span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}