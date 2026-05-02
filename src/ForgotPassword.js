import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaCircle } from "react-icons/fa";
import { MdOutlineMailOutline, MdOutlineLock } from "react-icons/md";
import "./ForgotPassword.css";
import logo from "./image.png";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Requirements logic
  const requirements = [
    { label: "8+ characters", test: (p) => p.length >= 8 },
    { label: "Uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Number", test: (p) => /[0-9]/.test(p) },
    {
      label: "Special character",
      test: (p) => /[!@#$%^&*]/.test(p),
    },
  ];

  const allMet = requirements.every((req) => req.test(newPassword));

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.VALIDATE_EMAIL), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        const msg = await res.text();
        setError(msg || "Email not found.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!allMet) {
      setError("Please meet all password requirements.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(buildApiUrl(API_ENDPOINTS.AUTH.RESET_PASSWORD), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (res.ok) {
        setMessage("Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const msg = await res.text();
        setError(msg || "Failed to reset password.");
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-card">
        <div className="forget-password-header">
          <img
            src={logo}
            alt="Priestify Logo"
            className="forget-password-logo"
          />
          <h1 className="forget-password-brand-text">
            <span className="brand-priest-dark">PRIEST</span>
            <span className="brand-ify">FY</span>
          </h1>
          <h2 className="forget-password-title">Reset Password</h2>
          <p className="forget-password-subtitle">
            {step === 1
              ? "Enter your registered email to reset your password."
              : "Set your new secure password below."}
          </p>
        </div>

        {step === 1 ? (
          <form
            onSubmit={handleEmailSubmit}
            className="forget-password-form-container"
          >
            <div className="forget-password-input-group">
              <MdOutlineMailOutline className="forget-password-input-icon" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="forget-password-auth-input"
              />
            </div>
            {error && <p className="forget-password-error-text">{error}</p>}
            <button type="submit" className="forget-password-auth-btn">
              Submit
            </button>
          </form>
        ) : (
          <form
            onSubmit={handlePasswordSubmit}
            className="forget-password-form-container"
          >
            <div className="forget-password-input-group">
              <MdOutlineLock className="forget-password-input-icon" />
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="forget-password-auth-input"
              />
              <span
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="forget-password-toggle"
              >
                {showNewPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {/* REQUIREMENTS BOX - Only shows when typing */}
            {newPassword.length > 0 && (
              <div className="password-requirements-box fade-in">
                {requirements.map((req, index) => {
                  const met = req.test(newPassword);
                  return (
                    <div
                      key={index}
                      className={`requirement-item ${met ? "met" : "unmet"}`}
                    >
                      {met ? <FaCheckCircle /> : <FaCircle />}
                      <span>{req.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="forget-password-input-group">
              <MdOutlineLock className="forget-password-input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="forget-password-auth-input"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="forget-password-toggle"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            {error && <p className="forget-password-error-text">{error}</p>}
            {message && (
              <p className="forget-password-success-text">{message}</p>
            )}

            <button
              type="submit"
              className="forget-password-auth-btn"
              disabled={!allMet}
            >
              Reset Password
            </button>
          </form>
        )}

        <p className="forget-password-switch-link">
          Remembered?{" "}
          <span
            className="forget-password-link"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
