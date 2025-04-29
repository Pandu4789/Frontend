import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);  // Reference to the profile dropdown
  const profileIconRef = useRef(null); // Reference to the profile icon
  const navigate = useNavigate();
  
  // Read the profile picture URL from localStorage on page load
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture'));

  // Set navbar open state based on sessionStorage on page load
  useEffect(() => {
    const storedMenuState = sessionStorage.getItem('navbarIsOpen');
    if (storedMenuState === 'true') {
      setIsOpen(true);
    }
  }, []);

  const toggleMenu = () => {
    setIsOpen(prev => {
      const newState = !prev;
      sessionStorage.setItem('navbarIsOpen', newState);  // Save the state in sessionStorage
      return newState;
    });
  };

  const toggleProfileDropdown = (event) => {
    event.stopPropagation(); // Prevent the click from propagating to the document level
    setProfileOpen(prev => !prev);
  };

  const goToPage = (path) => {
    navigate(path);
    toggleMenu();
  };

  const handleLogout = () => {
    onLogout();  // Call the onLogout function passed as prop
    sessionStorage.removeItem('navbarIsOpen');  // Clear the navbar state
    navigate('/login');  // Redirect to login page
    setProfileOpen(false);
  };

  // Close profile dropdown if click is outside of the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target) && !profileIconRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    // Add event listener for click outside
    document.addEventListener('click', handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.navbar}>
        <FaBars onClick={toggleMenu} style={styles.icon} />
        <h3 style={styles.logo}>My App</h3>
        
        {/* Profile Icon */}
        <div 
          style={styles.profileIconContainer} 
          onClick={toggleProfileDropdown}
          ref={profileIconRef} // Add ref to the profile icon
        >
          {/* Show profile picture if available, else use default icon */}
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt="Profile" 
              style={styles.profileIcon} 
            />
          ) : (
            <FaUserCircle style={styles.profileIcon} />
          )}
        </div>
      </div>

      {isOpen && <div style={styles.overlay} onClick={toggleMenu}></div>}

      <div style={{
        ...styles.sideMenu,
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)'
      }}>
        <div onClick={() => goToPage('/Dashboard')} style={styles.menuItem}>Dashboard</div>
        <div onClick={() => goToPage('/Calendar')} style={styles.menuItem}>Calendar</div>
        <div onClick={() => goToPage('/Mohurtam')} style={styles.menuItem}>Mohurtam</div>
      </div>

      {/* Profile Dropdown */}
      {profileOpen && (
        <div ref={profileDropdownRef} style={styles.dropdown}>
          <div onClick={() => goToPage('/Profile')} style={styles.dropdownItem}>Profile</div>

          <div onClick={() => goToPage('/Help')} style={styles.dropdownItem}>Help</div>
          <div onClick={handleLogout} style={{...styles.dropdownItem, color: 'red'}}>Logout</div>
        </div>
      )}
    </div>
  );
};

const styles = {
  wrapper: {
    position: 'relative', 
    zIndex: 1,
  },
  navbar: {
    background: '#333',
    color: 'white',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    position: 'sticky',
    top: 0,
    zIndex: 2000,
  },
  icon: {
    fontSize: '24px',
    cursor: 'pointer',
    marginRight: '15px',
  },
  logo: {
    margin: 0,
  },
  sideMenu: {
    position: 'absolute', 
    top: '50px', 
    left: 0,
    width: '200px',
    height: 'calc(100vh - 50px)',
    background: '#444',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1000,
  },
  menuItem: {
    padding: '15px 20px',
    color: '#fff',
    textDecoration: 'none',
    borderBottom: '1px solid #555',
  },
  overlay: {
    position: 'fixed',
    top: '50px', 
    left: 200,
    width: '100vw',
    height: 'calc(100vh - 50px)',
    backgroundColor: 'rgba(251, 247, 247, 0.3)',
    zIndex: 1500,
  },
  profileIconContainer: {
    marginLeft: 'auto',
    cursor: 'pointer',
  },
  profileIcon: {
    fontSize: '30px',
    color: 'white',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    objectFit: 'cover',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: 0,
    backgroundColor: '#444',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 2000,
    width: '180px',
    marginTop: '10px',
    animation: 'fadeIn 0.3s ease-out',
  },
  dropdownItem: {
    padding: '10px 15px',
    color: '#fff',
    cursor: 'pointer',
    borderBottom: '1px solid #555',
  },
};

export default Navbar;
