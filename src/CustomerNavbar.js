import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaUserTie, FaPrayingHands, FaUtensils, FaUserCircle, FaBars, FaLock
} from 'react-icons/fa';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import './CustomerNavbar.css';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal';

// Import your logo here
import logo from './image.png';

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profileIconRef = useRef(null);

  const handleLogout = () => {
    setShowLogoutConfirm(false); 
    if (onLogout) onLogout();   
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    setIsSidebarOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setIsSidebarOpen(false);
    setDropdownOpen(false);
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleDropdownClick = (action) => {
    setDropdownOpen(false);
    if (action === 'profile') navigate('/profile');
    else if (action === 'help') navigate('/help');
    else if (action === 'changePassword') setShowChangePasswordModal(true);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Handle Dropdown outside click
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileIconRef.current &&
        !profileIconRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

      // Handle Sidebar outside click
      let target = event.target;
      let isClickOnNavElements = false;

      while (target) {
        if (target === hamburgerRef.current || target === profileIconRef.current) {
          isClickOnNavElements = true;
          break;
        }
        target = target.parentElement;
      }

      if (
        isSidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !isClickOnNavElements
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarOpen, dropdownOpen]);

  const links = [
    { path: 'events', name: 'Dashboard', icon: <FaHome /> },
    { path: 'book-priest', name: 'Book Priest', icon: <FaUserTie /> },
    { path: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands /> },
    { path: 'prasadam', name: 'Food', icon: <FaUtensils /> },
  ];

  const isActive = (path) => {
    return location.pathname === `/${path}` || location.pathname.startsWith(`/${path}/`);
  };

  return (
    <>
      <nav className="customer-navbar">
        {/* Dynamic class added here to track sidebar state */}
        <div className={`navbar-content-wrapper ${isSidebarOpen ? 'sidebar-is-open' : ''}`}>
          
          <button
            className="nav-hamburger"
            onClick={toggleSidebar}
            ref={hamburgerRef}
          >
            <FaBars />
          </button>

          <div className="nav-brand" onClick={() => handleNavigation('events')}>
            <img src={logo} alt="Priestify Logo" className="nav-logo" />
            {/* WRAPPED IN ONE SPAN TO PREVENT FLEXBOX SPACING */}
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
            <div 
              className="nav-profile-trigger" 
              onClick={handleDropdownToggle} 
              ref={profileIconRef}
            >
              <FaUserCircle className="nav-default-avatar" />
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="dropdown-menu">
                  <div onClick={() => handleDropdownClick('profile')} className="dropdown-item">
                    <FaUserCircle className="dropdown-icon" /> Profile
                  </div>
                  <div onClick={() => handleDropdownClick('changePassword')} className="dropdown-item">
                    <FaLock className="dropdown-icon" /> Change Password
                  </div>
                  <div onClick={() => handleDropdownClick('help')} className="dropdown-item">
                    <MdOutlineHelpOutline className="dropdown-icon" /> Help
                  </div>
                  <div className="dropdown-divider"></div>
                  <div onClick={handleLogoutClick} className="dropdown-item logout-item">
                    <MdOutlineLogout className="dropdown-icon" /> Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Mobile Sidebar */}
      <div ref={sidebarRef} className={`priestify-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src={logo} alt="Priestify Logo" className="nav-logo" />
          {/* WRAPPED IN ONE SPAN TO PREVENT FLEXBOX SPACING */}
          <span className="brand-text-container">
            <span className="brand-priest">PRIEST</span><span className="brand-ify">IFY</span>
          </span>
        </div>
        
        <div className="sidebar-content">
          {links.map((link) => (
            <div
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              className={`sidebar-item ${isActive(link.path) ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span>{link.name}</span>
            </div>
          ))}
          
          <div className="sidebar-divider"></div>

          <div
            className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={() => handleNavigation('profile')}
          >
            <FaUserCircle className="sidebar-icon" />
            <span>Profile</span>
          </div>
          <div
            className={`sidebar-item ${location.pathname === '/help' ? 'active' : ''}`}
            onClick={() => handleNavigation('help')}
          >
            <MdOutlineHelpOutline className="sidebar-icon" />
            <span>Help</span>
          </div>
          <div className="sidebar-item logout-item" onClick={handleLogoutClick}>
            <MdOutlineLogout className="sidebar-icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
      />
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </>
  );
};

export default CustomerNavbar;