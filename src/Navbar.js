import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaUserCircle } from 'react-icons/fa';
import { BsGridFill, BsCalendar } from 'react-icons/bs';
import { FaPray, FaClipboardList,  FaOm, FaCalendarCheck } from 'react-icons/fa';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';

const colors = {
  primaryDark: '#4A2000',
  textLight: '#FFD700',
  textAccent: '#F5F5DC',
  activeBgDark: '#6F3000',
  navbarBg: '#4A2000',
  navbarTextLight: '#FFD700',
  mainContentBg: '#FDF5E6',
  dropdownBg: '#ffffff',
  dropdownText: '#343a40',
  dropdownHover: '#f8f9fa',
  dropdownBorder: '#eeeeee',
  danger: '#dc3545',
  profileIconPlaceholderBg: '#F5F5DC',
  profileIconDefaultColor: '#4A2000',
};

const Navbar = ({ onLogout, onSidebarToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  const profileIconRef = useRef(null);
  const sideMenuRef = useRef(null);
  const hamburgerIconRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const firstName = localStorage.getItem('firstName') || 'Priest';
 const priestId = localStorage.getItem('userId') || 'ID123';
  const [profilePicture, setProfilePicture] = useState(localStorage.getItem('profilePicture'));

  const sidebarWidthCollapsed = '0px';
  const sidebarWidthExpanded = '220px';

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
    onLogout();
    navigate('/login');
    setProfileOpen(false);
  };

  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen ? sidebarWidthExpanded : sidebarWidthCollapsed);
    }
  }, [isOpen, onSidebarToggle]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target) &&
        profileIconRef.current &&
        !profileIconRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

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
  }, [isOpen]);

  return (
    <>
      {/* Top Navbar */}
      <div style={styles.navbar}>
        <div style={styles.left}>
          <FaBars
            onClick={toggleMenu}
            style={styles.hamburgerIcon}
            ref={hamburgerIconRef}
            id="menu-toggle"
          />
          <h3 style={styles.logo} onClick={() => goToPage('/Dashboard')}>
  <FaOm style={styles.omIcon} /> PRIESTify
</h3>
        </div>

        <div
          style={styles.profileIconContainer}
          onClick={toggleProfileDropdown}
          ref={profileIconRef}
        >
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" style={styles.profilePicture} />
          ) : (
            <FaUserCircle style={styles.defaultProfileIcon} />
          )}
        </div>
      </div>

      {isOpen && <div style={styles.overlay} onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
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
          <BsGridFill style={styles.menuIcon} />
          <span>Dashboard</span>
        </div>
        <div
          onClick={() => goToPage('/Calendar')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Calendar' ? styles.activeMenuItem : {}),
          }}
        >
          <BsCalendar style={styles.menuIcon} />
          <span>Calendar</span>
        </div>
        <div
          onClick={() => goToPage('/Mohurtam')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Mohurtam' ? styles.activeMenuItem : {}),
          }}
        >
          <FaPray style={styles.menuIcon} />
          <span>Mohurtam</span>
        </div>
        <div
          onClick={() => goToPage('/Requests')}
          style={{
            ...styles.menuItem,
            ...(location.pathname === '/Requests' ? styles.activeMenuItem : {}),
          }}
        >
          <FaClipboardList style={styles.menuIcon} />
          <span>Requests</span>
        </div>
        </div>
      {/* Profile Dropdown */}
      {profileOpen && (
        <div ref={profileDropdownRef} style={styles.dropdown}>
          <div style={styles.dropdownHeader}>
            <div style={styles.dropdownUserName}>{firstName}</div>
            <div style={styles.dropdownUserEmail}>ID: {priestId}</div>
          </div>

          <div onClick={() => goToPage('/Profile')} style={styles.dropdownItem}>
            <FaUserCircle style={styles.dropdownItemIcon} />
            Profile
          </div>
          <div onClick={() => goToPage('/Help')} style={styles.dropdownItem}>
            <MdOutlineHelpOutline style={styles.dropdownItemIcon} />
            Help
          </div>
          <div onClick={handleLogout} style={{ ...styles.dropdownItem, ...styles.logoutItem }}>
            <MdOutlineLogout style={styles.dropdownItemIcon} />
            Logout
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  navbar: {
    background: colors.navbarBg,
    color: colors.navbarTextLight,
    padding: '1px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  hamburgerIcon: {
    fontSize: '24px',
    cursor: 'pointer',
    color: colors.navbarTextLight,
  },
  logo: {
    margin: 0,
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    color: colors.navbarTextLight,
  },
  profileIconContainer: {
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: colors.profileIconPlaceholderBg,
    overflow: 'hidden',
  },
  profilePicture: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  defaultProfileIcon: {
    fontSize: '28px',
    color: colors.profileIconDefaultColor,
  },
  sideMenu: {
    position: 'fixed',
    top: '60px',
    left: 0,
    width: '220px',
    height: 'calc(100vh - 60px)',
    background: colors.primaryDark,
    paddingTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 950,
    boxShadow: '2px 0 5px rgba(0,0,0,0.2)',
  },
  menuItem: {
    padding: '15px 20px',
    color: colors.textLight,
    borderBottom: `1px solid ${colors.activeBgDark}`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'background-color 0.2s ease-in-out',
  },
  activeMenuItem: {
    backgroundColor: colors.activeBgDark,
    fontWeight: 'bold',
  },
  menuIcon: {
    fontSize: '20px',
    color: colors.textLight,
  },
  dropdown: {
    position: 'fixed',
    top: '60px',
    right: '20px',
    backgroundColor: colors.dropdownBg,
    borderRadius: '5px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
    zIndex: 1100,
    width: '200px',
  },
  dropdownHeader: {
    padding: '10px 15px',
    borderBottom: `1px solid ${colors.dropdownBorder}`,
    color: colors.dropdownText,
    marginBottom: '5px',
  },
  dropdownUserName: {
    fontWeight: 'bold',
    fontSize: '16px',
  },
  dropdownUserEmail: {
    color: colors.dropdownText,
    fontSize: '13px',
  },
  dropdownItem: {
    padding: '10px 15px',
    color: colors.dropdownText,
    cursor: 'pointer',
    borderBottom: `1px solid ${colors.dropdownBorder}`,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'background-color 0.2s ease-in-out',
  },
  dropdownItemIcon: {
    fontSize: '18px',
    color: colors.dropdownText,
  },
  logoutItem: {
    color: colors.danger,
    borderBottom: 'none',
  },
  overlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 900,
  },
};

export default Navbar;