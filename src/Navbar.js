import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';

const Navbar = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileIconRef = useRef(null);
  const sideMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture'));

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleProfileDropdown = (event) => {
    event.stopPropagation();
    setProfileOpen((prev) => !prev);
  };

  const goToPage = (path) => {
    navigate(path);
    setIsOpen(false);
    setProfileOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
    setProfileOpen(false);
  };

  // Close dropdown or menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        !profileIconRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        sideMenuRef.current &&
        !sideMenuRef.current.contains(event.target) &&
        event.target.id !== 'menu-toggle'
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.navbar}>
        <div style={styles.left}>
          <FaBars
            onClick={toggleMenu}
            style={styles.icon}
            id="menu-toggle"
          />
          <h3 style={styles.logo} onClick={() => goToPage('/Dashboard')}>
            My App
          </h3>
        </div>

        <div
          style={styles.profileIconContainer}
          onClick={toggleProfileDropdown}
          ref={profileIconRef}
        >
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" style={styles.profileIcon} />
          ) : (
            <FaUserCircle style={styles.profileIcon} />
          )}
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      <div
        ref={sideMenuRef}
        style={{
          ...styles.sideMenu,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div
          onClick={() => goToPage('/Dashboard')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Dashboard' ? styles.activeMenuItem : {}),
          }}
        >
          Dashboard
        </div>
        <div
          onClick={() => goToPage('/Calendar')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Calendar' ? styles.activeMenuItem : {}),
          }}
        >
          Calendar
        </div>
        <div
          onClick={() => goToPage('/Mohurtam')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Mohurtam' ? styles.activeMenuItem : {}),
          }}
        >
          Mohurtam
        </div>
        <div
  onClick={() => goToPage('/Requests')}
  style={{
    ...styles.menuItem,
    ...(location.pathname === '/Requests' ? styles.activeMenuItem : {}),
  }}
>
  Requests
</div>

      </div>

      {profileOpen && (
        <div ref={profileDropdownRef} style={styles.dropdown}>
          <div onClick={() => goToPage('/Profile')} style={styles.dropdownItem}>
            Profile
          </div>
          <div onClick={() => goToPage('/Help')} style={styles.dropdownItem}>
            Help
          </div>
          <div onClick={handleLogout} style={{ ...styles.dropdownItem, color: 'red' }}>
            Logout
          </div>
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
    padding: '10px 15px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 2000,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  icon: {
    fontSize: '24px',
    cursor: 'pointer',
  },
  logo: {
    margin: 0,
    cursor: 'pointer',
    fontSize: '18px',
  },
  sideMenu: {
    position: 'absolute',
    top: '50px',
    left: 0,
    width: '220px',
    height: '100vh',
    background: '#444',
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1500,
  },
  menuItem: {
    padding: '15px 20px',
    color: '#fff',
    borderBottom: '1px solid #555',
    cursor: 'pointer',
  },
  activeMenuItem: {
    backgroundColor: '#555',
    fontWeight: 'bold',
  },
  profileIconContainer: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIcon: {
    fontSize: '30px',
    color: 'white',
    borderRadius: '50%',
    width: '35px',
    height: '35px',
    objectFit: 'cover',
    animation: 'pulse 3s infinite ease-in-out',
  },
  dropdown: {
    position: 'absolute',
    top: '50px',
    right: '15px',
    backgroundColor: '#444',
    borderRadius: '5px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 2000,
    width: '180px',
    animation: 'fadeIn 0.3s ease-out',
  },
  dropdownItem: {
    padding: '10px 15px',
    color: '#fff',
    cursor: 'pointer',
    borderBottom: '1px solid #555',
  },
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1400,
  },
  '@media (max-width: 768px)': {
    sideMenu: {
      width: '100%',
      height: '100vh',
    },
    overlay: {
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 1400,
    },
  }
};

export default Navbar;