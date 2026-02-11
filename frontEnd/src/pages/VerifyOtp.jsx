import "./VerifyOtp.css";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, setToken } from "../lib/api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const emailId = sessionStorage.getItem("otp_email_id") || "";
  const code = useMemo(() => digits.join(""), [digits]);

  const canSubmit = useMemo(() => {
    return emailId && code.length === 4 && !loading;
  }, [emailId, code, loading]);

  function setDigit(idx, val) {
    const cleaned = String(val || "").replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });
  }

  async function onVerify() {
    try {
      setError("");
      setInfo("");
      setLoading(true);

      const data = await api.post("/api/auth/otp/verify", {
        email_id: emailId,
        code,
      });

      if (data?.token) setToken(data.token);
      navigate("/dashboard");
    } catch (e) {
      setError(e.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    try {
      setError("");
      setInfo("");
      if (!emailId) {
        setError("Missing email. Please register/login again.");
        return;
      }
      setLoading(true);
      await api.post("/api/auth/otp/send", { email_id: emailId });
      setInfo("OTP resent.");
    } catch (e) {
      setError(e.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="otp-page">
      <div className="otp-card">
        <h1>Verify your account</h1>
        <p className="subtitle">Enter the 4-digit verification code sent to your email</p>

        <div style={{ marginBottom: "10px", color: "#64748b", fontSize: "14px" }}>
          {emailId ? `Email: ${emailId}` : "Missing email. Go back to register/login."}
        </div>

        <div className="otp-inputs">
          {digits.map((d, idx) => (
            <input
              key={idx}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={d}
              onChange={(e) => setDigit(idx, e.target.value)}
            />
          ))}
        </div>

        {error ? <p style={{ color: "#b91c1c", marginTop: "10px" }}>{error}</p> : null}
        {info ? <p style={{ color: "#166534", marginTop: "10px" }}>{info}</p> : null}

        <button className="verify-btn" disabled={!canSubmit} onClick={onVerify}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </button>

        <p className="resend">
          Didn’t receive the code?{" "}
          <span style={{ cursor: "pointer" }} onClick={onResend}>
            Resend
          </span>
        </p>

        <p style={{ marginTop: "14px", fontSize: "14px" }}>
          <span style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => navigate("/login")}>
            Back to Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
