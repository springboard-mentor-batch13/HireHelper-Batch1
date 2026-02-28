import "./VerifyOtp.css";
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../lib/api";

const ResetVerifyOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const emailId = sessionStorage.getItem("reset_email_id") || "";
  const code = useMemo(() => digits.join(""), [digits]);

  const canSubmit = useMemo(() => {
    return emailId && code.length === 4 && !loading;
  }, [emailId, code, loading]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  function setDigit(idx, val) {
    const cleaned = String(val || "").replace(/\D/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = cleaned;
      return next;
    });
    if (cleaned && idx < 3) {
      setTimeout(() => {
        inputRefs.current[idx + 1]?.focus();
      }, 0);
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
      setDigits((prev) => {
        const next = [...prev];
        next[idx - 1] = "";
        return next;
      });
    } else if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < 3) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData.length > 0) {
      const newDigits = ["", "", "", ""];
      for (let i = 0; i < Math.min(pastedData.length, 4); i++) {
        newDigits[i] = pastedData[i];
      }
      setDigits(newDigits);
      const nextEmptyIdx = newDigits.findIndex((d) => !d);
      const focusIdx = nextEmptyIdx === -1 ? 3 : nextEmptyIdx;
      setTimeout(() => {
        inputRefs.current[focusIdx]?.focus();
      }, 0);
    }
  }

  async function onVerify() {
    try {
      setLoading(true);
      await api.post("/api/auth/verify-reset-otp", {
        email_id: emailId,
        code,
      });
      sessionStorage.setItem("reset_otp_code", code);
      toast.success("OTP verified!");
      navigate("/reset-password");
    } catch (e) {
      toast.error(e.message || "Invalid OTP");
      setDigits(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    try {
      setLoading(true);
      await api.post("/api/auth/forgot-password", { email_id: emailId });
      toast.success("OTP resent!");
      setDigits(["", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (e) {
      toast.error(e.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="otp-page">
      <div className="otp-card">
        <h1>Reset Password</h1>
        <p className="subtitle">Enter the 4-digit code sent to your email</p>

        <div style={{ marginBottom: "10px", color: "#64748b", fontSize: "14px" }}>
          {emailId ? `Email: ${emailId}` : "Missing email. Go back."}
        </div>

        <div className="otp-inputs">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={(el) => (inputRefs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength="1"
              value={d}
              onChange={(e) => setDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={idx === 0 ? handlePaste : undefined}
              disabled={loading}
            />
          ))}
        </div>

        <button className="verify-btn" disabled={!canSubmit} onClick={onVerify}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p className="resend">
          Didn't receive the code?{" "}
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

export default ResetVerifyOtp;
s