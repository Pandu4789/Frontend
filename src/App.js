import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import CustomerNavbar from './CustomerNavbar';
import SplashScreen from './SplashScreen';
import Login from './login';
import Signup from './SignUp';
import Dashboard from './Dashboard';
import Calendar from './Calendar';
import Mohurtam from './Mohurtam';
import ForgotPassword from './ForgotPassword';
import Profile from './Profile';
import Help from './Help';
import Prasadam from './Prasadam';
import BookPriest from './BookPriest';
import Events from './Events';
import PoojaItems from './PoojaItems';
import CustomerMohurtam from './CustomerMohurtam';
import PriestProfile from './PriestProfile';
import MohurtamRequests from './MuhurtamRequests';
import SessionTimeout from './SessionTimeout';
import AdminPage from './AdminPage';
import Footer from './Footer';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // Hide splash after 3 seconds
    }, 1000);

    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    console.log('Token:', token);
    console.log('Role:', role); // Debugging

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
     return () => clearTimeout(timer);
  }, []); // Run only once on component mount

  const handleLoginSuccess = (role) => {
    console.log('Login successful, role:', role); // Debugging
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('role', role); // Save role to localStorage
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  console.log('isAuthenticated:', isAuthenticated);
  console.log('userRole:', userRole); // Debugging
 if (showSplash) {
    return <SplashScreen />;
  }
  return (
    <Router>
      <SessionTimeout timeout={10 * 60 * 1000}> {/* 10 minutes timeout */}
         <div style={{ paddingBottom: '80px' }}>
      {/* Conditionally render Navbar based on role */}
      {isAuthenticated && userRole === 'priest' && <Navbar onLogout={handleLogout} />}
      {isAuthenticated && userRole === 'customer' && <CustomerNavbar onLogout={handleLogout} />}

      <Routes>
        {/* Redirect based on role */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              userRole === 'priest' ? <Navigate to="/dashboard" /> : <Navigate to="/events" />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />

        <Route 
          path="/login" 
          element={<Login onLoginSuccess={handleLoginSuccess} />} 
        />
        
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/help" element={<Help />} />
        <Route path="/priests/:id" element={<PriestProfile />} />


        {/* Priest Routes */}
        {userRole === 'priest' && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/mohurtam" element={<Mohurtam />} />
            <Route path="/Requests" element={<MohurtamRequests />} />
          </>
        )}

        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Route path="/AdminPage" element={<AdminPage />} />
          
          </>
        )}
        {/* Customer Routes */}
        {userRole === 'customer' && (
          <>
            <Route path="/events" element={<Events />} />
            <Route path="/customer-mohurtam" element={<CustomerMohurtam />} />
            <Route path="/book-priest" element={<BookPriest />} />
            <Route path="/pooja-items" element={<PoojaItems />} />
            <Route path="/prasadam" element={<Prasadam />} />
          </>
        )}
      </Routes>
      </div>
      <Footer />
        
      </SessionTimeout>
      
    </Router>
  );
}

export default App;
