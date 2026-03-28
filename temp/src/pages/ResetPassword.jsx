import { useState } from "react";
import { TextField, Button } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const emailId = sessionStorage.getItem("reset_email_id") || "";
  const otpCode = sessionStorage.getItem("reset_otp_code") || "";

  async function onSubmit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters!");
      return;
    }

    try {
      setLoading(true);
      await api.post("/api/auth/reset-password", {
        email_id: emailId,
        code: otpCode,
        new_password: password,
      });

      // Clean up session storage
      sessionStorage.removeItem("reset_email_id");
      sessionStorage.removeItem("reset_otp_code");

      toast.success("Password reset successfully! Please login.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoMark}>H</div>
        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>Enter your new password below</p>

        <form onSubmit={onSubmit}>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            required
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: <LockIcon sx={{ color: "#94a3b8", mr: 1 }} />,
            }}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="Confirm New Password"
            type="password"
            required
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
            InputProps={{
              startAdornment: <LockIcon sx={{ color: "#94a3b8", mr: 1 }} />,
            }}
            sx={{ mb: 2.5 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!password || !confirmPassword || loading}
            sx={styles.button}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p style={styles.footer}>
          <span style={styles.link} onClick={() => navigate("/login")}>
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    background: "#ffffff",
    padding: "48px 40px 40px",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "500px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
  },
  logoMark: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "#1976d2",
    color: "#fff",
    fontSize: "28px",
    fontWeight: "800",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 6px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 32px",
  },
  button: {
    marginTop: "16px",
    padding: "12px",
    fontWeight: 600,
    fontSize: "15px",
    textTransform: "none",
    borderRadius: "10px",
  },
  footer: {
    marginTop: "24px",
    fontSize: "14px",
    color: "#64748b",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default ResetPassword;
