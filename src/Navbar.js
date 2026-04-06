import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle, FaPray, FaClipboardList, FaRegImages, FaLock, FaOm } from 'react-icons/fa';
import { BsGridFill, BsCalendar } from 'react-icons/bs';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal'; 
import './navbar.css'; // Importing the new styles

const Navbar = ({ onLogout, onSidebarToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileIconRef = useRef(null);
  const sideMenuRef = useRef(null);
  const hamburgerIconRef = useRef(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const firstName = localStorage.getItem('firstName') || 'Priest';
  const priestId = localStorage.getItem('userId') || 'ID123';
  const profilePicture = localStorage.getItem('profilePicture');

  const sidebarWidthCollapsed = '0px';
  const sidebarWidthExpanded = '260px'; // Made slightly wider for a modern feel

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const toggleProfileDropdown = (e) => {
    e.stopPropagation();
    setProfileOpen((prev) => !prev);
  };

  const goToPage = (path) => {
    navigate(path);
    setIsOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('firstName');
    setShowLogoutConfirm(false); 
    navigate('/login'); 
    setProfileOpen(false);
    window.location.reload(); 
  };

  const handleLogoutClick = () => {
    setProfileOpen(false);      
    setShowLogoutConfirm(true); 
  };

  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen ? sidebarWidthExpanded : sidebarWidthCollapsed);
    }
  }, [isOpen, onSidebarToggle]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close profile dropdown
      if (
        profileOpen &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileIconRef.current &&
        !profileIconRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      // Close sidebar if clicking outside
      let target = event.target;
      let isHamburgerClick = false;
      while (target) {
        if (target === hamburgerIconRef.current) {
          isHamburgerClick = true;
          break;
        }
        target = target.parentElement;
      }

      if (
        isOpen &&
        sideMenuRef.current &&
        !sideMenuRef.current.contains(event.target) &&
        !isHamburgerClick
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, profileOpen]);

  return (
    <>
      {/* Top Navbar */}
      <div className="priestify-navbar">
        <div className="nav-left">
          <button 
            className="nav-hamburger" 
            onClick={toggleMenu} 
            ref={hamburgerIconRef}
          >
            <FaBars />
          </button>
          
          <div className="nav-brand" onClick={() => goToPage('/Dashboard')}>
            <FaOm className="nav-om-icon" />
            <span className="brand-priest">PRIEST</span>
            <span className="brand-ify">IFY</span>
          </div>
        </div>

        <div className="nav-right">
          <div
            className="nav-profile-trigger"
            onClick={toggleProfileDropdown}
            ref={profileIconRef}
          >
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" className="nav-profile-pic" />
            ) : (
              <FaUserCircle className="nav-default-avatar" />
            )}
          </div>
        </div>
      </div>

      {/* Overlay for Sidebar */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      {/* Sidebar Menu */}
      <div
        ref={sideMenuRef}
        className={`priestify-sidebar ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-content">
          <div
            onClick={() => goToPage('/Dashboard')}
            className={`sidebar-item ${location.pathname === '/Dashboard' ? 'active' : ''}`}
          >
            <BsGridFill className="sidebar-icon" />
            <span>Dashboard</span>
          </div>
          
          <div
            onClick={() => goToPage('/Calendar')}
            className={`sidebar-item ${location.pathname === '/Calendar' ? 'active' : ''}`}
          >
            <BsCalendar className="sidebar-icon" />
            <span>Calendar</span>
          </div>
          
          <div
            onClick={() => goToPage('/Mohurtam')}
            className={`sidebar-item ${location.pathname === '/Mohurtam' ? 'active' : ''}`}
          >
            <FaPray className="sidebar-icon" />
            <span>Mohurtam</span>
          </div>
          
          <div
            onClick={() => goToPage('/Requests')}
            className={`sidebar-item ${location.pathname === '/Requests' ? 'active' : ''}`}
          >
            <FaClipboardList className="sidebar-icon" />
            <span>Requests</span>
          </div>
          
          <div
            onClick={() => goToPage('/priest-gallery')}
            className={`sidebar-item ${location.pathname === '/priest-gallery' ? 'active' : ''}`}
          >
            <FaRegImages className="sidebar-icon" />
            <span>Gallery</span>
          </div>
        </div>
      </div>

      {/* Profile Dropdown */}
      {profileOpen && (
        <div ref={profileDropdownRef} className="profile-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-name">{firstName}</div>
            <div className="dropdown-id">ID: {priestId}</div>
          </div>

          <div className="dropdown-menu">
            <div onClick={() => goToPage('/Profile')} className="dropdown-item">
              <FaUserCircle className="dropdown-icon" />
              Profile
            </div>
            
            <div 
              onClick={() => { setProfileOpen(false); setShowChangePasswordModal(true); }} 
              className="dropdown-item"
            >
              <FaLock className="dropdown-icon" />
              Change Password
            </div>
            
            <div onClick={() => goToPage('/Help')} className="dropdown-item">
              <MdOutlineHelpOutline className="dropdown-icon" />
              Help
            </div>
            
            <div className="dropdown-divider"></div>
            
            <div onClick={handleLogoutClick} className="dropdown-item logout-item">
              <MdOutlineLogout className="dropdown-icon" />
              Logout
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        confirmText="Logout"
        cancelText="Cancel"
      />
      
      <ChangePasswordModal 
        isOpen={showChangePasswordModal} 
        onClose={() => setShowChangePasswordModal(false)} 
      />
    </>
  );
};

export default Navbar;