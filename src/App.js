import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

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
import ProtectedRoute from './ProtectedRoute';

function MainApp({
  isAuthenticated,
  userRole,
  handleLoginSuccess,
  handleLogout,
  showSplash
}) {
  const location = useLocation();

  const currentPath = location.pathname;
  const hideNavAndFooterRoutes = ['/login', '/signup', '/forgotpassword'];
  const shouldShowLayout = !hideNavAndFooterRoutes.includes(currentPath);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <SessionTimeout timeout={10 * 60 * 1000}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        {shouldShowLayout && isAuthenticated && userRole === 'priest' && <Navbar onLogout={handleLogout} />}
        {shouldShowLayout && isAuthenticated && userRole === 'customer' && <CustomerNavbar onLogout={handleLogout} />}

        {/* Main content */}
        <div style={{ flex: 1, paddingTop: shouldShowLayout ? '70px' : 0, paddingBottom: '80px' }}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  userRole === 'priest' ? <Navigate to="/dashboard" /> :
                  userRole === 'customer' ? <Navigate to="/events" /> :
                  userRole === 'admin' ? <Navigate to="/adminpage" /> :
                  <Navigate to="/login" />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* Auth Routes */}
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />

            {/* Common Routes */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
            <Route path="/priests/:id" element={<PriestProfile />} />

            {/* Priest Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['priest']} userRole={userRole}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['priest']} userRole={userRole}>
                  <Calendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mohurtam"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['priest']} userRole={userRole}>
                  <Mohurtam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/requests"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['priest']} userRole={userRole}>
                  <MohurtamRequests />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/adminpage"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']} userRole={userRole}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

            {/* Customer Routes */}
            <Route
              path="/events"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer-mohurtam"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                  <CustomerMohurtam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/book-priest"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                  <BookPriest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pooja-items"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                  <PoojaItems />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prasadam"
              element={
                <ProtectedRoute isAuthenticated={isAuthenticated} allowedRoles={['customer']} userRole={userRole}>
                  <Prasadam />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>

        {/* Footer */}
        {shouldShowLayout && <Footer />}
      </div>
    </SessionTimeout>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role.toLowerCase());
    }

    const timer = setTimeout(() => setShowSplash(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleLoginSuccess = (role) => {
    const normalizedRole = role.toLowerCase();
    setIsAuthenticated(true);
    setUserRole(normalizedRole);
    localStorage.setItem('role', normalizedRole);
    localStorage.setItem('token', 'sample_token'); // Replace with actual token from backend
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
  };

  return (
    <Router>
      <MainApp
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        handleLoginSuccess={handleLoginSuccess}
        handleLogout={handleLogout}
        showSplash={showSplash}
      />
    </Router>
  );
}
