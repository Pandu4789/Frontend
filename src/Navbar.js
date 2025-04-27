import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate(); 
  const toggleMenu = () => setIsOpen(prev => !prev);

  const goToPage = (path) => {
    navigate(path);
    toggleMenu(); 
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.navbar}>
        <FaBars onClick={toggleMenu} style={styles.icon} />
        <h3 style={styles.logo}>My App</h3>
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
};

export default Navbar;
