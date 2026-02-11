import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      phone.trim() &&
      password.length >= 8 &&
      !loading
    );
  }, [firstName, lastName, email, phone, password, loading]);

  async function onRegister() {
    try {
      setError("");
      setLoading(true);

      const data = await api.post("/api/auth/register", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone_number: phone.trim(),
        email_id: email.trim(),
        password,
        profile_picture: "",
      });

      sessionStorage.setItem("otp_email_id", data?.user?.email_id || email.trim());
      navigate("/verify-otp");
    } catch (e) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Create Account</h1>

        <div style={styles.inputWrapper}>
          <PersonIcon />
          <TextField
            fullWidth
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <PersonIcon />
          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <EmailIcon />
          <TextField
            fullWidth
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <PhoneIcon />
          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div style={styles.inputWrapper}>
          <LockIcon />
          <TextField
            fullWidth
            type="password"
            label="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error ? <p style={styles.error}>{error}</p> : null}

        <Button variant="contained" fullWidth disabled={!canSubmit} onClick={onRegister}>
          {loading ? "Registering..." : "Register"}
        </Button>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#020617",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "10px",
    width: "100%",
    maxWidth: "420px",
  },
  inputWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
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
  error: {
    color: "#b91c1c",
    marginTop: "0px",
    marginBottom: "14px",
    fontSize: "14px",
  },
};

export default Register;
