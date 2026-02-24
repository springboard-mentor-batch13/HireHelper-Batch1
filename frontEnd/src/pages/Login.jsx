import { TextField, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, setToken } from "../lib/api";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim() && password && !loading;
  }, [email, password, loading]);

  async function onLogin() {
    try {
      setLoading(true);

      const data = await api.post("/api/auth/login", {
        email_id: email.trim(),
        password,
      });

      if (data?.requiresOtp) {
        sessionStorage.setItem("otp_email_id", email.trim());
        toast.info("OTP verification required");
        navigate("/verify-otp");
        return;
      }

      if (data?.token) {
        setToken(data.token);
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("user", JSON.stringify(data.user));
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      if (e?.data?.requiresOtp) {
        sessionStorage.setItem("otp_email_id", email.trim());
        toast.info("OTP verification required");
        navigate("/verify-otp");
        return;
      }
      const errorMessage = e.message || "Login failed. Please check your credentials.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onLogin();
    } else {
      toast.warning("Please fill in all required fields");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoMark}>H</div>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your HireHelper account</p>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: <EmailIcon sx={{ color: "#94a3b8", mr: 1 }} />,
              },
            }}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            required
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: <LockIcon sx={{ color: "#94a3b8", mr: 1 }} />,
              },
            }}
            sx={{ mb: 1 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!canSubmit || loading}
            sx={styles.button}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
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

export default Login;
