import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Login from './login'; // Make sure your Login component is imported correctly
import Signup from './SignUp';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Mohurtam from './Mohurtam';
import ForgotPassword from './ForgotPassword';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      {/* Show Navbar only when authenticated */}
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Redirect to Dashboard if already authenticated */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
        />
        
        {/* Login Route */}
        <Route 
          path="/login" 
          element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} 
        />
        
        {/* SignUp Route */}
        <Route path="/signup" element={<Signup />} />

        {/* Forgot Password Route */}
        <Route 
          path="/ForgotPassword" 
          element={<ForgotPassword />}
        />
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Dashboard Route */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        
        {/* Calendar Route */}
        <Route 
          path="/calendar" 
          element={isAuthenticated ? <Calendar /> : <Navigate to="/login" />} 
        />
        
        {/* Mohurtam Route */}
        <Route 
          path="/mohurtam" 
          element={isAuthenticated ? <Mohurtam /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
