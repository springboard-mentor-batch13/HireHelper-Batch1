import "./VerifyOtp.css";

const VerifyOtp = () => {
  return (
    <div className="otp-page">
      <div className="otp-card">
        <h1>Verify your account</h1>
        <p className="subtitle">
          Enter the 4-digit verification code sent to your email
        </p>

        <div className="otp-inputs">
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
          <input type="text" maxLength="1" />
        </div>

        <button className="verify-btn">
          Verify & Continue
        </button>

        <p className="resend">
          Didn’t receive the code? <span>Resend</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;
