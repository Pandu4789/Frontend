import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle, FaPray, FaClipboardList, FaRegImages, FaLock, FaTimes } from 'react-icons/fa';
import { BsGridFill, BsCalendar } from 'react-icons/bs';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal'; 
import './navbar.css'; 
import logo from './image.png'; // Using your brand logo

const Navbar = ({ onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileIconRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const firstName = localStorage.getItem('firstName') || 'Priest';
  const priestId = localStorage.getItem('userId') || 'ID123';
  const profilePicture = localStorage.getItem('profilePicture');

  const goToPage = (path) => {
    navigate(path);
    setIsSidebarOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
    window.location.reload(); 
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest('.nav-hamburger')) {
        setIsSidebarOpen(false);
      }
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && !profileIconRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isSidebarOpen, dropdownOpen]);

  const navLinks = [
    { path: '/Dashboard', name: 'Dashboard', icon: <BsGridFill /> },
    { path: '/Calendar', name: 'Calendar', icon: <BsCalendar /> },
    { path: '/Mohurtam', name: 'Mohurtam', icon: <FaPray /> },
    { path: '/Requests', name: 'Requests', icon: <FaClipboardList /> },
    { path: '/priest-gallery', name: 'Gallery', icon: <FaRegImages /> },
  ];

  return (
    <>
      <nav className="customer-navbar">
        <div className="navbar-content-wrapper">
          <button className="nav-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <FaBars />
          </button>
          
          <div className="nav-brand" onClick={() => goToPage('/Dashboard')}>
            <img src={logo} alt="Logo" className="nav-logo" />
            <span className="brand-text-container">
              <span className="brand-priest">PRIEST</span><span className="brand-ify">IFY</span>
            </span>
          </div>

          <div className="nav-right">
            <div className="nav-greeting-text">Namaste, <strong>{firstName}</strong></div>
            <div 
              className="nav-profile-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              ref={profileIconRef}
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="nav-profile-pic-img" />
              ) : (
                <FaUserCircle className="nav-default-avatar" />
              )}
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="dropdown-user-info">
                   <div className="dropdown-name">{firstName}</div>
                   <div className="dropdown-id">ID: {priestId}</div>
                </div>
                <div className="dropdown-menu">
                  <div onClick={() => goToPage('/Profile')} className="dropdown-item">
                    <FaUserCircle className="dropdown-icon" /> Profile
                  </div>
                  <div onClick={() => { setDropdownOpen(false); setShowChangePasswordModal(true); }} className="dropdown-item">
                    <FaLock className="dropdown-icon" /> Change Password
                  </div>
                  <div onClick={() => goToPage('/Help')} className="dropdown-item">
                    <MdOutlineHelpOutline className="dropdown-icon" /> Help
                  </div>
                  <div className="dropdown-divider"></div>
                  <div onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }} className="dropdown-item logout-item">
                    <MdOutlineLogout className="dropdown-icon" /> Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar Drawer */}
      {isSidebarOpen && <div className="v2-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside ref={sidebarRef} className={`priestify-sidebar-v2 ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-v2-inner">
          <div className="sidebar-v2-menu">
            {navLinks.map((link) => (
              <div 
                key={link.path} 
                onClick={() => goToPage(link.path)} 
                className={`v2-nav-item ${location.pathname === link.path ? 'active' : ''}`}
              >
                <span className="v2-icon">{link.icon}</span>
                <span className="v2-text">{link.name}</span>
              </div>
            ))}
          </div>

          <div className="v2-divider"></div>

          <div className="sidebar-v2-footer">
            <div className="v2-nav-item" onClick={() => goToPage('/Profile')}><FaUserCircle className="v2-icon" /> Profile</div>
            <div className="v2-nav-item" onClick={() => goToPage('/Help')}><MdOutlineHelpOutline className="v2-icon" /> Help</div>
            <div className="v2-nav-item logout" onClick={() => setShowLogoutConfirm(true)}><MdOutlineLogout className="v2-icon" /> Logout</div>
          </div>
        </div>
      </aside>

      <ConfirmationModal 
        isOpen={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)} 
        onConfirm={handleLogout} 
        title="Logout" 
        message="Are you sure you want to log out?" 
      />
      
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </>
  );
};

export default Navbar;