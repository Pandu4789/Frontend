import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import {
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaShieldAlt,
  FaLock,
} from "react-icons/fa";
import "./ChangePasswordModal.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const initialState = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

  const [passwords, setPasswords] = useState(initialState);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [checks, setChecks] = useState({
    length: false,
    number: false,
    special: false,
    upper: false,
    lower: false,
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setPasswords(initialState);
      setChecks({
        length: false,
        number: false,
        special: false,
        upper: false,
        lower: false,
      });
      setError("");
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    }
  }, [isOpen]);

  const strengthCount = Object.values(checks).filter(Boolean).length;
  const isMatch =
    passwords.newPassword === passwords.confirmPassword &&
    passwords.confirmPassword !== "";
  const canSubmit =
    strengthCount === 5 && isMatch && passwords.currentPassword.length > 0;

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
        lower: /[a-z]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

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
      toast.success("Security updated!");
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Current password incorrect.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <ToastContainer position="top-center" autoClose={2000} />
      <div className="cp-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* FIXED HEADER */}
        <div className="cp-modal-header">
          <button onClick={onClose} className="cp-close-btn">
            &times;
          </button>
          <div className="cp-icon-circle">
            <FaShieldAlt />
          </div>
          <h2>Security Update</h2>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="cp-modal-body">
          <form id="cp-form" onSubmit={handleSubmit} className="cp-form">
            <div className="cp-input-group">
              <label>Current Password</label>
              <div className="cp-input-wrapper">
                <FaLock className="cp-field-icon" />
                <input
                  type={showCurrent ? "text" : "password"}
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
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
                <FaLock className="cp-field-icon" />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  placeholder="Create new password"
                  required
                />
                <span
                  className="cp-toggle"
                  onClick={() => setShowNew(!showNew)}
                >
                  {showNew ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {passwords.newPassword.length > 0 && (
                <div className="cp-strength-container">
                  <div className="cp-meter-bar">
                    <div
                      className={`cp-meter-fill strength-${strengthCount}`}
                      style={{ width: `${(strengthCount / 5) * 100}%` }}
                    ></div>
                  </div>
                  <div className="cp-requirements-grid">
                    <span className={checks.length ? "met" : ""}>8+ Chars</span>
                    <span className={checks.upper ? "met" : ""}>Uppercase</span>
                    <span className={checks.lower ? "met" : ""}>Lowercase</span>
                    <span className={checks.number ? "met" : ""}>Number</span>
                    <span className={checks.special ? "met" : ""}>Symbol</span>
                  </div>
                </div>
              )}
            </div>

            <div className="cp-input-group">
              <label>Confirm Password</label>
              <div className="cp-input-wrapper">
                <FaLock className="cp-field-icon" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  required
                />
                <span
                  className="cp-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwords.confirmPassword && (
                <div
                  className={`cp-inline-feedback ${isMatch ? "match" : "error"}`}
                >
                  {isMatch ? "Passwords match" : "Passwords do not match"}
                </div>
              )}
            </div>
          </form>
        </div>

        {/* FIXED FOOTER */}
        <div className="cp-modal-footer">
          {error && <div className="cp-server-error">{error}</div>}
          <div className="cp-actions">
            <button type="button" className="cp-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              form="cp-form"
              className={`cp-btn-submit ${canSubmit ? "active" : ""}`}
              disabled={loading || !canSubmit}
            >
              {loading ? <FaSpinner className="cp-spin" /> : "Update Security"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
