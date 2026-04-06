import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 
import { MdOutlineMailOutline, MdOutlineLock } from "react-icons/md"; 
import './login.css'; 

import logo from './image.png'; 

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '', 
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail'); 
    if (savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail })); 
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
    setIsSubmitting(true); 

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.role) {
          if (rememberMe) {
            localStorage.setItem('rememberedEmail', form.email); 
          } else {
            localStorage.removeItem('rememberedEmail');
          }

          localStorage.setItem('userEmail', data.email); 
          localStorage.setItem('username', data.email); 
          localStorage.setItem('firstName', data.firstName); 
          localStorage.setItem('lastName', data.lastName); 
          localStorage.setItem('role', data.role);
          localStorage.setItem('userId', data.userId);

          onLoginSuccess(data.role);

          if (data.role === 'priest') {
            navigate('/dashboard');
          } else if (data.role === 'customer') {
            navigate('/events');
          } else if (data.role === 'admin') {
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
      setIsSubmitting(false); 
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-content-wrapper">
        
        {/* --- NEW SIDE PANEL --- */}
        <div className="login-side-panel">
          <div className="login-side-panel-content">
            <img src={logo} alt="Priestify Logo" className="login-side-panel-logo" />
            
            {/* Split colors for the Brand Name */}
            <h1 className="login-brand-text">
              <span className="brand-priest">PRIEST</span>
              <span className="brand-ify">IFY</span>
            </h1>
            
            <p className="login-side-panel-text">
              Your gateway to sacred rituals and spiritual guidance. Connect with authentic priests and bring divine grace to your home.
            </p>
          </div>
        </div>

        {/* --- EXISTING LOGIN FORM --- */}
        <div className="login-card">
          <h2 className="login-title">Welcome Back 👋</h2>
          <p className="login-subtitle">Sign in to book your sacred rituals</p>

          <form onSubmit={handleSubmit} className="login-form-container">
            <div className="login-input-group">
              <MdOutlineMailOutline className="login-input-icon" />
              <input
                name="email"
                type="email"
                placeholder="Email Address"
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

            <div className="login-options-row">
              <label className="remember-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleCheckboxChange}
                  className="remember-checkbox"
                />
                <span>Remember Me</span>
              </label>
              <a className="login-link forgot-link" onClick={() => navigate('/forgotpassword')}>
                Forgot Password?
              </a>
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

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="guest-btn"
            onClick={() => {
              localStorage.setItem('userEmail', 'guest@example.com');
              localStorage.setItem('role', 'customer');
              onLoginSuccess('customer');
              navigate('/events');
            }}
          >
            Explore as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;