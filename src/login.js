import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // For password toggle
import { MdOutlineMailOutline } from "react-icons/md"; // For email icon
import { MdOutlineLock } from 'react-icons/md'; // For password icon
import './login.css'; // Make sure this is the correct path to your CSS file

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', // Changed from username to email
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // State for button loading

  // Load saved email if Remember Me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail'); // Changed to rememberedEmail
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail })); // Set email
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true); // Set submitting state

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send email instead of username
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.role) {
          // Save remembered email if checkbox is checked
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', form.email); // Save email
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          localStorage.setItem('userEmail', data.email); // Store email
          localStorage.setItem('firstName', data.firstName); // Store firstName
          localStorage.setItem('lastName', data.lastName); // Store lastName
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.userId);
          // Token is not part of the login response in your current backend.
          // If your backend provides a token, save it here: localStorage.setItem('token', data.token);

          onLoginSuccess(data.role);

          if (data.role === 'priest') {
            navigate('/dashboard');
          } else if (data.role === 'customer') {
            navigate('/events');
          }
          else if (data.role === 'admin') {
            navigate('/adminpage');
          }
        } else {
          setError('Role not found in response');
        }
      } else {
        let msg = 'Login failed';
        try {
          const errData = await res.json();
          msg = errData.message || msg;
        } catch {
          msg = await res.text();
        }
        setError(msg);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsSubmitting(false); // Reset submitting state
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgotpassword'); // This page will also need to be updated to use email
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back 👋</h2>
        <p className="login-subtitle">Login to continue</p>

        <form onSubmit={handleSubmit} className="login-form-container">
          <div className="login-input-group">
            <MdOutlineMailOutline className="login-input-icon" /> {/* Using email icon */}
            <input
              name="email" // Changed name to email
              type="email" // Changed type to email
              placeholder="Email ID"
              value={form.email}
              onChange={handleChange}
              required
              className="login-auth-input"
            />
          </div>
          <div className="login-input-group">
            <MdOutlineLock className="login-input-icon" />
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="login-auth-input"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="login-password-toggle"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <div className="forgot-password-link-inline">
            <a className="login-link" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </div>

          <div className="remember-me">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={handleCheckboxChange}
                className="remember-checkbox"
              />
              <span>Remember Me</span>
            </label>
          </div>

          {error && <p className="login-error-text">{error}</p>}

          <button type="submit" className="login-auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Logging In...' : 'Login'}
          </button>
        </form>

        <p className="login-switch-link">
          Don't have an account?{' '}
          <a className="login-link" onClick={() => navigate('/signup')}>
            Sign Up
          </a>
        </p>

        <div className="guest-link">
          <button
            type="button"
            className="login-auth-btn guest-btn"
            onClick={() => {
              // Note: For guest, email/userId might not be set. Adjust as needed.
              localStorage.setItem('userEmail', 'guest@example.com');
              localStorage.setItem('role', 'customer');
              onLoginSuccess('customer');
              navigate('/events');
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;