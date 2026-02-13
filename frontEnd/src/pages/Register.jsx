import { useState } from "react";
import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // prevent reload

    toast.success("Registration Successful!");
    navigate("/verify-otp");
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
              label="Full Name"
              type="text"
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <EmailIcon />
            <TextField
              fullWidth
              label="Email"
              type="email"
              required
            />
          </div>

          <div style={styles.inputWrapper}>
            <PhoneIcon />
            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              required
              inputProps={{ pattern: "[0-9]{10}", maxLength: 10 }}
              helperText="Enter 10 digit mobile number"
            />
          </div>

          <div style={styles.inputWrapper}>
            <LockIcon />
            <TextField
              fullWidth
              type="password"
              label="Password"
              required
            />
          </div>

          <Button type="submit" variant="contained" fullWidth>
            Register
          </Button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "#2563eb", cursor: "pointer", fontWeight: "500" }}
            onClick={() => navigate("/login")}
          >
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
};

export default Register;
