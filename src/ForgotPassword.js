import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // To control the flow (1: username, 2: new password)
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleNewPasswordChange = (e) => {
    setNewPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
  
    try {
      const res = await fetch('http://localhost:8080/api/auth/validate-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
  
      if (res.ok) {
        setStep(2); // Go to new password screen
      } else {
        const msg = await res.text();
        setError(msg); // Invalid username error
      }
    } catch (err) {
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
        body: JSON.stringify({ username, newPassword }),
      });

      if (res.ok) {
        setMessage('Password reset successfully! You can now log in.');
        setTimeout(() => navigate('/login'), 2000); // Redirect to login page after 2 seconds
      } else {
        const msg = await res.text();
        setError(msg); // Error resetting password
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Forgot Password?</h2>

        {step === 1 ? (
          <form onSubmit={handleUsernameSubmit} className="auth-form">
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                required
                className="auth-input"
              />
            </div>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            <button type="submit" className="auth-btn">Submit</button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="auth-form">
            <div className="input-group">
              <input
                type="password"
                name="newPassword"
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                required
                className="auth-input"
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                required
                className="auth-input"
              />
            </div>

            {error && <p className="error-text">{error}</p>}
            {message && <p className="success-text">{message}</p>}

            <button type="submit" className="auth-btn">Reset Password</button>
          </form>
        )}

        <p className="switch-link">
          Remembered your password?{' '}
          <a className="link" onClick={() => navigate('/login')}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
