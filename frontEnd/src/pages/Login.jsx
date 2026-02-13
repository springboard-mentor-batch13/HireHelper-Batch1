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
        toast.success("Login successful!");
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      // If backend returns requiresOtp via error (it currently returns 403 with JSON),
      // surface the message and allow user to navigate.
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
        <h1 style={styles.title}>HireHelper</h1>
        <p style={styles.subtitle}>Get help. Get things done.</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputWrapper}>
            <EmailIcon style={styles.icon} />
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputWrapper}>
            <LockIcon style={styles.icon} />
            <TextField
              fullWidth
              label="Password"
              type="password"
              required
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={styles.button}
            disabled={!canSubmit || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p style={styles.footer}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f172a, #020617)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "400px",
    textAlign: "center",
  },
  title: { marginBottom: "5px" },
  subtitle: { color: "#64748b", marginBottom: "30px" },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  icon: {
    color: "#475569",
  },
  button: {
    marginTop: "10px",
    padding: "12px",
  },
  footer: {
    marginTop: "20px",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default Login;
