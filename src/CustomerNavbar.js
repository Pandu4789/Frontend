import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome, FaUserTie, FaPrayingHands, FaUtensils, FaUserCircle, FaBars, 
  FaCalendarCheck, FaClock, FaChevronDown, FaChevronUp, FaLock
} from 'react-icons/fa';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import './CustomerNavbar.css';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal';
import logo from './image.png';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const CustomerNavbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bookingExpanded, setBookingExpanded] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Get User Details
  const firstName = localStorage.getItem('firstName') || 'User';

  const [stats, setStats] = useState({ 
    ritual: { all: 0, upcoming: 0, accepted: 0, rejected: 0, pending: 0 }, 
    muhurtam: { all: 0, pending: 0, acknowledged: 0 } 
  });

  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileIconRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    const fetchStats = async () => {
      try {
        const [bookingRes, muhurtamRes] = await Promise.all([
          fetch(`${API_BASE}/api/booking/customer/${userId}`).then(res => res.json()),
          fetch(`${API_BASE}/api/muhurtam/customer/${userId}`).then(res => res.json())
        ]);

        const todayStart = new Date().setHours(0, 0, 0, 0);
        const isPastDate = (dateStr) => {
            if (!dateStr) return false;
            return new Date(dateStr).setHours(0, 0, 0, 0) < todayStart;
        };

        setStats({
          ritual: {
            all: bookingRes.length,
            upcoming: bookingRes.filter(b => !isPastDate(b.date)).length,
            accepted: bookingRes.filter(b => b.status?.toUpperCase().includes('ACCEPT')).length,
            rejected: bookingRes.filter(b => b.status?.toUpperCase().includes('REJECT')).length,
            pending: bookingRes.filter(b => 
                (!b.status || b.status.toUpperCase() === 'PENDING') && 
                !b.viewed && 
                !isPastDate(b.date)
            ).length,
          },
          muhurtam: {
            all: muhurtamRes.length,
            pending: muhurtamRes.filter(m => !m.viewed).length,
            acknowledged: muhurtamRes.filter(m => m.viewed).length
          }
        });
      } catch (err) {
        console.error("Sidebar stats fetch failed", err);
      }
    };

    fetchStats();
  }, [location.pathname]);

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

  const handleNavigation = (path, filter = 'ALL', tab = 'bookings') => {
    navigate(`/${path}`, { state: { filter, tab } });
    setIsSidebarOpen(false);
    setDropdownOpen(false);
  };

  const handleDropdownAction = (action) => {
    setDropdownOpen(false);
    if (action === 'profile') navigate('/profile');
    else if (action === 'help') navigate('/help');
    else if (action === 'changePassword') setShowChangePasswordModal(true);
    else if (action === 'logout') setShowLogoutConfirm(true);
  };

  const mainLinks = [
    { path: 'events', name: 'Dashboard', icon: <FaHome /> },
    { path: 'book-priest', name: 'Book Priest', icon: <FaUserTie /> },
    { path: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands /> },
    { path: 'prasadam', name: 'Food', icon: <FaUtensils /> },
  ];

  return (
    <>
      <nav className="customer-navbar">
        <div className="navbar-content-wrapper">
          <button className="nav-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><FaBars /></button>
          
          <div className="nav-brand" onClick={() => handleNavigation('events')}>
            <img src={logo} alt="Logo" className="nav-logo" />
            <span className="brand-text-container">
              <span className="brand-priest">PRIEST</span><span className="brand-ify">IFY</span>
            </span>
          </div>

          <div className="nav-right">
            {/* Added Namaste Greeting */}
            <div className="nav-greeting-text">Namaste, <strong>{firstName}</strong></div>
            
            <div 
              className="nav-profile-trigger" 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              ref={profileIconRef}
            >
              <FaUserCircle className="nav-default-avatar" />
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="dropdown-menu">
                  <div onClick={() => handleDropdownAction('profile')} className="dropdown-item">
                    <FaUserCircle className="dropdown-icon" /> Profile
                  </div>
                  <div onClick={() => handleDropdownAction('changePassword')} className="dropdown-item">
                    <FaLock className="dropdown-icon" /> Change Password
                  </div>
                  <div onClick={() => handleDropdownAction('help')} className="dropdown-item">
                    <MdOutlineHelpOutline className="dropdown-icon" /> Help
                  </div>
                  <div className="dropdown-divider"></div>
                  <div onClick={() => handleDropdownAction('logout')} className="dropdown-item logout-item">
                    <MdOutlineLogout className="dropdown-icon" /> Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {isSidebarOpen && <div className="v2-sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}

      <aside ref={sidebarRef} className={`priestify-sidebar-v2 ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-v2-inner">
          <div className="sidebar-v2-menu">
            {mainLinks.map((link) => (
              <div key={link.path} onClick={() => handleNavigation(link.path)} className={`v2-nav-item ${location.pathname === `/${link.path}` ? 'active' : ''}`}>
                <span className="v2-icon">{link.icon}</span>
                <span className="v2-text">{link.name}</span>
              </div>
            ))}
          </div>

          <div className="v2-divider"></div>

          <div className="sidebar-section-label" onClick={() => setBookingExpanded(!bookingExpanded)}>
            BOOKINGS {bookingExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>

          {bookingExpanded && (
            <div className="sidebar-v2-nested">
              <div className="nested-group">
                <div className="nested-title"><FaCalendarCheck /> Ritual Bookings</div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'ALL', 'bookings')}>
                   All Rituals <span className="v2-badge blue">{stats.ritual.all}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'UPCOMING', 'bookings')}>
                   Upcoming <span className="v2-badge blue">{stats.ritual.upcoming}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'PENDING', 'bookings')}>
                   Pending <span className="v2-badge gold">{stats.ritual.pending}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'ACCEPTED', 'bookings')}>
                   Accepted <span className="v2-badge green">{stats.ritual.accepted}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'REJECTED', 'bookings')}>
                   Rejected <span className="v2-badge red">{stats.ritual.rejected}</span>
                </div>
              </div>

              <div className="nested-group">
                <div className="nested-title"><FaClock /> Muhurtam Requests</div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'MUHURTAM', 'requests')}>
                   All Requests <span className="v2-badge blue">{stats.muhurtam.all}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'PENDING', 'requests')}>
                   Pending <span className="v2-badge gold">{stats.muhurtam.pending}</span>
                </div>
                <div className="nested-item" onClick={() => handleNavigation('your-bookings', 'ACKNOWLEDGED', 'requests')}>
                   Acknowledged <span className="v2-badge green">{stats.muhurtam.acknowledged}</span>
                </div>
              </div>
            </div>
          )}

          <div className="v2-divider"></div>

          <div className="sidebar-v2-footer">
            <div className="v2-nav-item" onClick={() => handleNavigation('profile')}><FaUserCircle className="v2-icon" /> Profile</div>
            <div className="v2-nav-item" onClick={() => handleNavigation('help')}><MdOutlineHelpOutline className="v2-icon" /> Help</div>
            <div className="v2-nav-item logout" onClick={() => setShowLogoutConfirm(true)}><MdOutlineLogout className="v2-icon" /> Logout</div>
          </div>
        </div>
      </aside>

      <ConfirmationModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={onLogout} title="Logout" message="Are you sure you want to log out?" />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
    </>
  );
};

export default CustomerNavbar;