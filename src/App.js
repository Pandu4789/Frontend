import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './login';
import Signup from './SignUp';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Mohurtam from './Mohurtam';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import Help from './Help';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('token', 'your-token-here'); // Save token to localStorage
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('token'); // Remove token on logout
  };

  return (
    <Router>
      {/* Show Navbar only when authenticated */}
      {isAuthenticated && <Navbar onLogout={handleLogout} />}

      <Routes>
        {/* Redirect to Dashboard if already authenticated */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        
        {/* Login Route */}
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        {/* SignUp Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Forgot Password Route */}
        <Route 
          path="/ForgotPassword" 
          element={<ForgotPassword />} 
        />
        <Route path="/profile" 
        element={<Profile />} />
        <Route path="/help" 
        element={<Help />} />

        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={ <Dashboard /> } 
        />
        
        {/* Calendar Route */}
        <Route 
          path="/calendar" 
          element={<Calendar /> } 
        />
        
        {/* Mohurtam Route */}
        <Route 
          path="/mohurtam" 
          element={ <Mohurtam />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
