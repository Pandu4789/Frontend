import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaUserTie, FaPrayingHands, FaUtensils, FaUserCircle } from 'react-icons/fa';
import './CustomerNavbar.css';

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  const handleDropdownToggle = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleDropdownClick = (action) => {
    setDropdownOpen(false);
    if (action === 'profile') navigate('/profile');
    else if (action === 'help') navigate('/help');
    else if (action === 'logout') handleLogout();
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const links = [
    { path: 'events', name: 'Dashboard', icon: <FaHome /> },
    { path: 'book-priest', name: 'Book Priest', icon: <FaUserTie /> },
    { path: 'pooja-items', name: 'Pooja Items', icon: <FaPrayingHands /> },
    { path: 'prasadam', name: 'Prasadhams', icon: <FaUtensils /> },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => handleNavigation(link.path)}
            className="navbar-button"
          >
            <span className="icon">{link.icon}</span>
            <span>{link.name}</span>
          </button>
        ))}
      </div>

      <div className="dropdown-wrapper" ref={dropdownRef}>
        <FaUserCircle className="profile-icon" onClick={handleDropdownToggle} />

        {dropdownOpen && (
          <div className="dropdown-menu">
            <div onClick={() => handleDropdownClick('profile')} className="dropdown-item">Profile</div>
            <div onClick={() => handleDropdownClick('help')} className="dropdown-item">Help</div>
            <div onClick={() => handleDropdownClick('logout')} className="dropdown-item logout">Logout</div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default CustomerNavbar;
