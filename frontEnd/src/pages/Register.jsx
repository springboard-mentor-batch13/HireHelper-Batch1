import { useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      toast.success("Registration successful! Please verify your OTP.");
      navigate("/verify-otp");
    } catch (e) {
      const errorMessage = e.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (canSubmit) {
      onRegister();
    } else {
      if (password.length < 8) {
        toast.warning("Password must be at least 8 characters long");
      } else {
        toast.warning("Please fill in all required fields");
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Create Account</h1>

        <form onSubmit={handleSubmit}>
          <div style={styles.inputWrapper}>
            <PersonIcon />
            <TextField
              fullWidth
              label="First Name"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputWrapper}>
            <PersonIcon />
            <TextField
              fullWidth
              label="Last Name"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputWrapper}>
            <EmailIcon />
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div style={styles.inputWrapper}>
            <PhoneIcon />
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
              helperText="Enter 10 digit mobile number"
              disabled={loading}
            />
          </div>

          <div style={styles.inputWrapper}>
            <LockIcon />
            <TextField
              fullWidth
              type="password"
              label="Password (min 8 chars)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={!canSubmit || loading}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

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
};

export default Register;
