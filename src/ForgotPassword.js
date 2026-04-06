import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineMailOutline, MdOutlineLock } from "react-icons/md"; 
import './ForgotPassword.css';

// Import your logo here
import logo from './image.png'; 

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleNewPasswordChange = (e) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const res = await fetch('http://localhost:8080/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep(2);
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (res.ok) {
        setMessage('Password reset successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="forget-password-container">
      <div className="forget-password-card">
        
        {/* BRAND HEADER WITH LOGO */}
        <div className="forget-password-header">
            <img src={logo} alt="Priestify Logo" className="forget-password-logo" />
            <h1 className="forget-password-brand-text">
              <span className="brand-priest-dark">PRIEST</span>
              <span className="brand-ify">IFY</span>
            </h1>
            
            <h2 className="forget-password-title">Reset Password</h2>
            <p className="forget-password-subtitle">
              {step === 1
                ? 'Enter your registered email to reset your password.'
                : 'Set your new secure password below.'}
            </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit} className="forget-password-form-container">
            <div className="forget-password-input-group">
              <MdOutlineMailOutline className="forget-password-input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                required
                className="forget-password-auth-input"
              />
            </div>

            {error && <p className="forget-password-error-text">{error}</p>}
            {message && <p className="forget-password-success-text">{message}</p>}

            <button type="submit" className="forget-password-auth-btn">Submit</button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="forget-password-form-container">
            <div className="forget-password-input-group">
              <MdOutlineLock className="forget-password-input-icon" />
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
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
            
            <div className="forget-password-input-group">
              <MdOutlineLock className="forget-password-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
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
            {message && <p className="forget-password-success-text">{message}</p>}

            <button type="submit" className="forget-password-auth-btn">Reset Password</button>
          </form>
        )}

        <p className="forget-password-switch-link">
          Remembered your password?{' '}
          <span className="forget-password-link" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;