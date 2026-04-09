import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaUserTie, FaPrayingHands, FaUtensils, FaUserCircle, FaBars, FaCalendarAlt
} from 'react-icons/fa';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import './CustomerNavbar.css';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal';
import logo from './image.png';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default closed for cleaner entry
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [upcomingBookings, setUpcomingBookings] = useState(0);

  const sidebarRef = useRef(null);

  // Fetch upcoming bookings
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`${API_BASE}/api/booking/customer/${userId}`)
        .then(res => res.json())
        .then(data => {
          const count = data.filter(b => new Date(b.date || b.datetime) >= new Date()).length;
          setUpcomingBookings(count);
        })
        .catch(() => setUpcomingBookings(0));
    }
  }, [location.pathname]);

  // Handle outside clicks to close sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If sidebar is open and click is NOT inside sidebar and NOT on the hamburger button
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest('.nav-hamburger')) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setIsSidebarOpen(false); // Close sidebar on any item selection
  };

  const links = [
    { path: 'events', name: 'Dashboard', icon: <FaHome /> },
    { path: 'book-priest', name: 'Book Priest', icon: <FaUserTie /> },
    { path: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands /> },
    { path: 'prasadam', name: 'Food', icon: <FaUtensils /> },
  ];

  const isActive = (path) => location.pathname === `/${path}` || location.pathname.startsWith(`/${path}/`);

  return (
    <>
      <nav className="customer-navbar">
        <div className="navbar-content-wrapper">
          <button className="nav-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>

          <div className="nav-brand" onClick={() => handleNavigation('events')}>
            <img src={logo} alt="Logo" className="nav-logo" />
            <span className="brand-text-container">
              <span className="brand-priest">PRIEST</span><span className="brand-ify">IFY</span>
            </span>
          </div>

          <div className="navbar-center-desktop">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`navbar-button ${isActive(link.path) ? 'active-menu-item' : ''}`}
              >
                <span className="nav-btn-icon">{link.icon}</span>
                <span>{link.name}</span>
              </button>
            ))}
          </div>

          <div className="nav-right">
            <div className="nav-profile-trigger" onClick={() => handleNavigation('profile')}>
              <FaUserCircle className="nav-default-avatar" />
            </div>
          </div>
        </div>
      </nav>

      {/* OVERLAY / BACKDROP */}
      {isSidebarOpen && <div className="v2-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Side Navbar */}
      <aside ref={sidebarRef} className={`priestify-sidebar-v2 ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-v2-inner">
          
          <div className={`v2-nav-item upcoming-item ${isActive('your-bookings') ? 'active' : ''}`} onClick={() => handleNavigation('your-bookings')}>
            <span className="v2-icon"><FaCalendarAlt /></span>
            <span className="v2-text">Upcoming Rituals</span>
            <span className="v2-badge">{upcomingBookings}</span>
          </div>

          <div className="v2-divider"></div>

          <div className="sidebar-v2-menu">
            {links.map((link) => (
              <div
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`v2-nav-item ${isActive(link.path) ? 'active' : ''}`}
              >
                <span className="v2-icon">{link.icon}</span>
                <span className="v2-text">{link.name}</span>
              </div>
            ))}
          </div>

          <div className="v2-divider"></div>

          <div className="sidebar-v2-footer">
            <div className={`v2-nav-item ${isActive('profile') ? 'active' : ''}`} onClick={() => handleNavigation('profile')}>
              <FaUserCircle className="v2-icon" />
              <span className="v2-text">Profile</span>
            </div>
            <div className={`v2-nav-item ${isActive('help') ? 'active' : ''}`} onClick={() => handleNavigation('help')}>
              <MdOutlineHelpOutline className="v2-icon" />
              <span className="v2-text">Help</span>
            </div>
            <div className="v2-nav-item logout" onClick={() => { setIsSidebarOpen(false); setShowLogoutConfirm(true); }}>
              <MdOutlineLogout className="v2-icon" />
              <span className="v2-text">Logout</span>
            </div>
          </div>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { onLogout(); handleNavigation('login'); }}
        title="Logout"
        message="Are you sure you want to log out?"
      />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
    </>
  );
};

export default CustomerNavbar;