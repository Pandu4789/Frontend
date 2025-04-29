import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
        const data = await res.json(); // 👈 get the response body
        localStorage.setItem('username', data.username); // 👈 save the username
        onLoginSuccess();
        navigate('/dashboard');
      } else {
        const msg = await res.text();
        setError(msg);
      }
    } catch (err) {
      setError('Login failed. Try again later.');
    }
  };

  const handleForgotPassword = () => {
    navigate('/ForgotPassword'); // Navigate to the Forgot Password page
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
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="auth-btn">Login</button>
        </form>

        <p className="switch-link">
          Don't have an account?{' '}
          <a className="link" onClick={() => navigate('/signup')}>
            Sign Up
          </a>
        </p>

        <p className="forgot-password-link">
          <a className="link" onClick={handleForgotPassword}>
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
}

export default Login;
