import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaUserTie, FaPrayingHands, FaUtensils, FaUserCircle, FaBars, FaOm
} from 'react-icons/fa';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import './CustomerNavbar.css';

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();  // to get current path
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const sidebarRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profileIconRef = useRef(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setIsSidebarOpen(false);
    setDropdownOpen(false);
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
    else if (action === 'logout') handleLogout();
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileIconRef.current &&
        !profileIconRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

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
  }, [isSidebarOpen]);

  const links = [
    { path: 'events', name: 'Dashboard', icon: <FaHome /> },
    { path: 'book-priest', name: 'Book Priest', icon: <FaUserTie /> },
    { path: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands /> },
    { path: 'prasadam', name: 'Food', icon: <FaUtensils /> },
  ];

  // Helper to check if a link is active based on current location.pathname
  const isActive = (path) => {
    // Exact match or path includes (in case of nested routes)
    return location.pathname === `/${path}` || location.pathname.startsWith(`/${path}/`);
  };

  return (
    <>
      <nav className="navbar">
        <div className={`navbar-content-wrapper ${isSidebarOpen ? 'sidebar-active-top-nav' : ''}`}>
          <FaBars
            className="hamburger-icon"
            onClick={toggleSidebar}
            ref={hamburgerRef}
          />

          <div className="app-icon" onClick={() => handleNavigation('events')}>
            <FaOm />
            <span className="app-name">PRIESTify</span>
          </div>

          <div className="navbar-center-desktop">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => handleNavigation(link.path)}
                className={`navbar-button ${isActive(link.path) ? 'active-menu-item' : ''}`}
              >
                <span className="icon">{link.icon}</span>
                <span>{link.name}</span>
              </button>
            ))}
          </div>

          <div className="profile-icon-wrapper" ref={profileIconRef}>
            <FaUserCircle className="profile-icon" onClick={handleDropdownToggle} />
            {dropdownOpen && (
             <div className="dropdown-menu" ref={dropdownRef}>
                <div onClick={() => handleDropdownClick('profile')} className="dropdown-item">
                  <FaUserCircle style={{ marginRight: '8px' }} /> Profile
                </div>
                <div onClick={() => handleDropdownClick('help')} className="dropdown-item">
                  <MdOutlineHelpOutline style={{ marginRight: '8px' }} /> Help
                </div>
                <div onClick={() => handleDropdownClick('logout')} className="dropdown-item logout">
                  <MdOutlineLogout style={{ marginRight: '8px' }} /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <div ref={sidebarRef} className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <FaOm />
          <span className="app-name">PRIESTify</span>
        </div>
        <div className="sidebar-links">
          {links.map((link) => (
            <div
              key={link.path}
              onClick={() => handleNavigation(link.path)}
              className={`sidebar-item ${isActive(link.path) ? 'active-menu-item' : ''}`}
            >
              <span className="icon">{link.icon}</span>
              <span>{link.name}</span>
            </div>
          ))}
          <div
            className={`sidebar-item ${location.pathname === '/profile' ? 'active-menu-item' : ''}`}
            onClick={() => handleNavigation('profile')}
          >
            <FaUserCircle className="icon" />
            <span>Profile</span>
          </div>
          <div
            className={`sidebar-item ${location.pathname === '/help' ? 'active-menu-item' : ''}`}
            onClick={() => handleNavigation('help')}
          >
            <MdOutlineHelpOutline className="icon" />
            <span>Help</span>
          </div>
          <div className="sidebar-item logout" onClick={handleLogout}>
            <MdOutlineLogout className="icon" />
            <span>Logout</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CustomerNavbar;
