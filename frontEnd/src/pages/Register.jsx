import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";

const Register = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Create Account</h1>

        <div style={styles.inputWrapper}>
          <PersonIcon />
          <TextField fullWidth label="Full Name" />
        </div>

        <div style={styles.inputWrapper}>
          <EmailIcon />
          <TextField fullWidth label="Email" />
        </div>

        <div style={styles.inputWrapper}>
          <PhoneIcon />
          <TextField fullWidth label="Phone Number" />
        </div>

        <div style={styles.inputWrapper}>
          <LockIcon />
          <TextField fullWidth type="password" label="Password" />
        </div>

        <Button variant="contained" fullWidth>
          Register
        </Button>
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
