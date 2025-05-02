import React from 'react';
import { useNavigate } from 'react-router-dom';

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate(); // Get navigate function for page navigation

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(`/${path}`);
  };

  const links = [
    { path: 'events', name: 'Dashboard' },  // Shows "Dashboard", but keeps path /events
    { path: 'book-priest', name: 'Book Priest' },
    { path: 'pooja-items', name: 'Pooja Items' },
    { path: 'prasadam', name: 'Prasadams' },
  ];

  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'linear-gradient(90deg, #4a00e0, #8e2de2)',
      padding: '14px 28px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      borderRadius: '0 0 16px 16px',
    },
    navbarLeft: {
      display: 'flex',
      gap: '20px',
    },
    navbarButton: {
      background: 'linear-gradient(145deg, #4a00e0, #8e2de2)',
      color: '#fff',
      border: '2px solid transparent',
      padding: '12px 24px',
      borderRadius: '30px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background 0.3s, transform 0.3s, box-shadow 0.3s',
      outline: 'none',
    },
    navbarButtonHover: {
      background: 'linear-gradient(145deg, #ffeb3b, #ff9800)',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
    logoutBtn: {
      background: '#ff4d4d',
      color: '#fff',
      border: 'none',
      padding: '10px 22px',
      borderRadius: '25px',
      fontWeight: '600',
      fontSize: '16px',
      cursor: 'pointer',
      transition: 'background 0.3s, transform 0.3s, box-shadow 0.3s',
    },
    logoutBtnHover: {
      background: '#e91e63',
      transform: 'scale(1.05)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navbarLeft}>
        {links.map((link) => (
          <button
            key={link.path}
            onClick={() => handleNavigation(link.path)}
            style={styles.navbarButton}
            onMouseEnter={(e) => {
              e.target.style.background = styles.navbarButtonHover.background;
              e.target.style.transform = styles.navbarButtonHover.transform;
              e.target.style.boxShadow = styles.navbarButtonHover.boxShadow;
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'linear-gradient(145deg, #4a00e0, #8e2de2)';
              e.target.style.transform = 'none';
              e.target.style.boxShadow = 'none';
            }}
          >
            {link.name}
          </button>
        ))}
      </div>
      <div>
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={(e) => {
            e.target.style.background = styles.logoutBtnHover.background;
            e.target.style.transform = styles.logoutBtnHover.transform;
            e.target.style.boxShadow = styles.logoutBtnHover.boxShadow;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#ff4d4d';
            e.target.style.transform = 'none';
            e.target.style.boxShadow = 'none';
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default CustomerNavbar;
