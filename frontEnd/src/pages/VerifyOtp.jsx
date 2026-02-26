import "./VerifyOtp.css";
import { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api, setToken } from "../lib/api";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const emailId = sessionStorage.getItem("otp_email_id") || "";
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
    }
    
    else if (e.key === "ArrowLeft" && idx > 0) {
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

      const data = await api.post("/api/auth/otp/verify", {
        email_id: emailId,
        code,
      });

      if (data?.token) {
        setToken(data.token);
        localStorage.setItem("isLoggedIn", "true");
        toast.success("OTP verified successfully!");
        navigate("/dashboard", { replace: true });
      }
    } catch (e) {
      const errorMessage = e.message || "OTP verification failed. Please check your code.";
      toast.error(errorMessage);
      
      setDigits(["", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    try {
      if (!emailId) {
        const errorMsg = "Missing email. Please register/login again.";
        toast.error(errorMsg);
        return;
      }
      setLoading(true);
      await api.post("/api/auth/otp/send", { email_id: emailId });
      const successMsg = "OTP resent successfully!";
      toast.success(successMsg);
      
      setDigits(["", "", "", ""]);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
    } catch (e) {
      const errorMessage = e.message || "Failed to resend OTP";
      toast.error(errorMessage);
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

        <button className="verify-btn" disabled={!canSubmit || loading} onClick={onVerify}>
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
