import { TextField, Button } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent page reload

    localStorage.setItem("isLoggedIn", "true");
    toast.success("Login Successful!");
    navigate("/dashboard");
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
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            style={styles.button}
          >
            Login
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
  icon: { color: "#475569" },
  button: { marginTop: "10px", padding: "12px" },
  footer: { marginTop: "20px", fontSize: "14px" },
  link: { color: "#2563eb", cursor: "pointer", fontWeight: "500" },
};

export default Login;
