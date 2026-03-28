import { TextField, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, setToken } from "../lib/api";
import { getSocket } from "../lib/socket";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim() !== "" && password !== "" && !loading;
  }, [email, password, loading]);

  async function onLogin() {
    try {
      setLoading(true);

      // ✅ CALL API (your api.js returns data directly)
      const data = await api.post("/api/auth/login", {
        email_id: email.trim(),
        password,
      });

      console.log("🔥 LOGIN RESPONSE:", data);

      // ✅ OTP FLOW
      if (data?.requiresOtp) {
        sessionStorage.setItem("otp_email_id", email.trim());
        toast.info("OTP verification required");
        navigate("/verify-otp");
        return;
      }

      // ✅ SUCCESS LOGIN
      if (data?.user || data?.id) {
        // ✅ GET USER ID SAFELY
        const userId =
          data?.user?._id ||
          data?.user?.id ||
          data?._id ||
          data?.id ||
          data?.user?.userId;

        if (!userId) {
          console.error("❌ userId missing in response:", data);
          toast.error("Login failed: userId missing");
          return;
        }

        console.log("✅ Logged in user:", userId);

        if (data?.token) {
          setToken(data.token);
        }
        localStorage.setItem("isLoggedIn", "true");
        if (data?.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // ✅ CONNECT SOCKET
        getSocket();

        toast.success("Login successful");
        
        // Use a small delay or window.location.href to ensure cookies are processed?
        // Actually navigate should be fine as it's the same domain.
        // We need to notify AppRoutes that login status changed.
        // For now, let's keep it simple.
        navigate("/dashboard", { replace: true });
        window.location.reload(); // re-runs /me check with persisted token
      } else {
        toast.error("Invalid login response");
      }
    } catch (err) {
      console.error("❌ LOGIN ERROR:", err);

      toast.error(
        err?.data?.message ||
        err?.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.warning("Enter email and password");
      return;
    }
    onLogin();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoMark}>H</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>
          Sign in to your HireHelper account
        </p>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1 }} />,
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 1 }}
            InputProps={{
              startAdornment: <LockIcon sx={{ mr: 1 }} />,
            }}
          />

          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <span
              style={styles.link}
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </span>
          </div>

          <div style={{ textAlign: "center" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              sx={{
                width: "100%",
                padding: "10px",
                fontSize: "14px",
                borderRadius: "8px",
                textTransform: "none",
              }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </div>
        </form>

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <span
            style={styles.link}
            onClick={() => navigate("/register")}
          >
            Create one
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#0f172a,#1e293b)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: 40,
    borderRadius: 12,
    width: 420,
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
  },
  logoMark: {
    width: 50,
    height: 50,
    borderRadius: 12,
    background: "#1976d2",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 15px",
    fontWeight: "bold",
    fontSize: 22,
  },
  title: { marginBottom: 5 },
  subtitle: { marginBottom: 25, color: "gray" },
  footer: { marginTop: 25 },
  link: {
    color: "#1976d2",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default Login;