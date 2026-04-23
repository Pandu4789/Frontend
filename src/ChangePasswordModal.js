import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaCheckCircle,
  FaCircle,
  FaShieldAlt,
} from "react-icons/fa";
import "./ChangePasswordModal.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [checks, setChecks] = useState({
    length: false,
    number: false,
    special: false,
    upper: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setPasswords((prev) => ({ ...prev, [name]: value }));

    if (name === "newPassword") {
      setChecks({
        length: value.length >= 8,
        number: /[0-9]/.test(value),
        special: /[^A-Za-z0-9]/.test(value),
        upper: /[A-Z]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!Object.values(checks).every(Boolean)) {
      setError("Please meet all strength requirements.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: localStorage.getItem("userEmail"),
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      };
      await axios.post(
        buildApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD),
        payload,
      );
      toast.success("Security updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Check your current password.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <ToastContainer />
      <div className="cp-modal-card" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="cp-close-btn">
          &times;
        </button>

        <div className="cp-modal-header">
          <div className="cp-icon-circle">
            <FaShieldAlt />
          </div>
          <h2>Security Update</h2>
          <p>
            Maintain your account's divine protection with a strong password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="cp-form">
          <div className="cp-input-group">
            <label>Current Password</label>
            <div className="cp-input-wrapper">
              <input
                type={showCurrent ? "text" : "password"}
                name="currentPassword"
                value={passwords.currentPassword}
                onChange={handleChange}
                placeholder="Verify current password"
                className={
                  error && error.includes("current") ? "error-input" : ""
                }
              />
              <span
                className="cp-toggle"
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <div className="cp-input-group">
            <label>New Password</label>
            <div className="cp-input-wrapper">
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                placeholder="Create new password"
              />
              <span className="cp-toggle" onClick={() => setShowNew(!showNew)}>
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="cp-requirements">
              <div className={checks.length ? "met" : ""}>
                {checks.length ? (
                  <FaCheckCircle />
                ) : (
                  <FaCircle className="dot-icon" />
                )}{" "}
                8+ Characters
              </div>
              <div className={checks.upper ? "met" : ""}>
                {checks.upper ? (
                  <FaCheckCircle />
                ) : (
                  <FaCircle className="dot-icon" />
                )}{" "}
                Uppercase
              </div>
              <div className={checks.number ? "met" : ""}>
                {checks.number ? (
                  <FaCheckCircle />
                ) : (
                  <FaCircle className="dot-icon" />
                )}{" "}
                Number
              </div>
              <div className={checks.special ? "met" : ""}>
                {checks.special ? (
                  <FaCheckCircle />
                ) : (
                  <FaCircle className="dot-icon" />
                )}{" "}
                Special Char
              </div>
            </div>
          </div>

          <div className="cp-input-group">
            <label>Confirm Password</label>
            <input
              className="cp-simple-input"
              type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat new password"
            />
          </div>

          {error && <div className="cp-error-box">{error}</div>}

          <div className="cp-actions">
            <button
              type="button"
              className="cp-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="cp-btn-primary" disabled={loading}>
              {loading ? <FaSpinner className="cp-spin" /> : "Update Security"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
