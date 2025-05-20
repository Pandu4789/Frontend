import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  // Load saved username if Remember Me was checked
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      setForm(prev => ({ ...prev, username: savedUsername }));
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

    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        const data = await res.json();

        if (data.role) {
          // Save remembered username if checkbox is checked
          if (rememberMe) {
            localStorage.setItem('rememberedUsername', form.username);
          } else {
            localStorage.removeItem('rememberedUsername');
          }

          localStorage.setItem('username', data.username);
          localStorage.setItem('role', data.role);
          localStorage.setItem('token', data.token);
          localStorage.setItem('userId', data.userId);

          onLoginSuccess(data.role);

          if (data.role === 'priest') {
            navigate('/dashboard');
          } else if (data.role === 'customer') {
            navigate('/events');
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
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgotpassword');
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Welcome Back 👋</h2>
        <p className="auth-subtitle">Login to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>
          <div className="input-group">
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="auth-input"
            />
          </div>

          {/* Forgot Password below password */}
          <div className="forgot-password-link-inline">
            <a className="link" onClick={handleForgotPassword}>
              Forgot Password?
            </a>
          </div>

          {/* Remember Me */}
        <div className="remember-me">
  <label className="remember-label">
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={handleCheckboxChange}
    />
    <span>Remember Me</span>
  </label>
</div>



          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="switch-link">
          Don't have an account?{' '}
          <a className="link" onClick={() => navigate('/signup')}>
            Sign Up
          </a>
        </p>

        <div className="guest-link">
          <button
            type="button"
            className="auth-btn guest-btn"
            onClick={() => {
              localStorage.setItem('username', 'guest');
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
