import { useMemo, useState } from "react";
import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).{8,}$/;

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
      passwordRegex.test(password) &&
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

      sessionStorage.setItem(
        "otp_email_id",
        data?.user?.email_id || email.trim()
      );

      toast.success("Registration successful! Please verify your OTP.");
      navigate("/verify-otp");
    } catch (e) {
      const errorMessage =
        e.message || "Registration failed. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phone || !password) {
      toast.warning("Please fill in all required fields");
      return;
    }

    if (!passwordRegex.test(password)) {
      toast.warning(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one special character."
      );
      return;
    }

    onRegister();
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoMark}>H</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.subtitle}>Join HireHelper and start getting things done</p>

        <form onSubmit={handleSubmit}>
          <div style={styles.nameRow}>
            <TextField
              fullWidth
              label="First Name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: <PersonIcon sx={{ color: "#94a3b8", mr: 1 }} />,
                },
              }}
            />
            <TextField
              fullWidth
              label="Last Name"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={loading}
              slotProps={{
                input: {
                  startAdornment: <PersonIcon sx={{ color: "#94a3b8", mr: 1 }} />,
                },
              }}
            />
          </div>

          <TextField
            fullWidth
            label="Email"
            type="email"
            required
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
            label="Phone Number"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
            helperText="Enter 10 digit mobile number"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: <PhoneIcon sx={{ color: "#94a3b8", mr: 1 }} />,
              },
            }}
            sx={{ mb: 2.5 }}
          />

          <TextField
            fullWidth
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            helperText="Min 8 chars, 1 uppercase, 1 lowercase & 1 special character"
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
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/login")}>
            Sign in
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
    maxWidth: "540px",
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
  nameRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
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

export default Register;
