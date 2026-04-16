import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    FaBars, FaUserCircle, FaPray, FaClipboardList, FaBullhorn, FaChevronDown, FaChevronUp,
    FaCalendarDay, FaHome, FaCalendarCheck, FaChartBar, FaLock, FaRegImages
} from 'react-icons/fa';
import { BsGridFill, BsCalendar } from 'react-icons/bs';
import { MdOutlineHelpOutline, MdOutlineLogout } from 'react-icons/md';
import { isToday, isAfter, startOfDay, parseISO } from 'date-fns';
import ConfirmationModal from './ConfirmationModal';
import ChangePasswordModal from './ChangePasswordModal'; 
import './navbar.css'; 
import logo from './image.png';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [requestsExpanded, setRequestsExpanded] = useState(true);
  const [bookingsExpanded, setBookingsExpanded] = useState(true);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false); 
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [stats, setStats] = useState({
    rituals: { all: 0, pending: 0, accepted: 0, rejected: 0 },
    muhurtams: { all: 0, new: 0, viewed: 0 },
    schedule: { today: 0, upcoming: 0 }
  });

  const sidebarRef = useRef(null);
  const dropdownRef = useRef(null);
  const profileIconRef = useRef(null);

  const priestId = localStorage.getItem('userId');
  const firstName = localStorage.getItem('firstName') || 'Priest';
  const profilePicture = localStorage.getItem('profilePicture');

  // FETCH COUNTS
  useEffect(() => {
    if (!priestId) return;
    const fetchCounts = async () => {
      try {
        const [bRes, mRes] = await Promise.all([
          fetch(`${API_BASE}/api/booking/priest/${priestId}`),
          fetch(`${API_BASE}/api/muhurtam/priest/${priestId}`)
        ]);
        const bData = await bRes.json();
        const mData = await mRes.json();

        const rituals = Array.isArray(bData) ? bData : (bData?.data || []);
        const muhurtams = Array.isArray(mData) ? mData : (mData?.data || []);
        const today = startOfDay(new Date());

        setStats({
          rituals: {
            all: rituals.length,
            pending: rituals.filter(b => (b.status || 'PENDING').toUpperCase() === 'PENDING').length,
            accepted: rituals.filter(b => b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED').length,
            rejected: rituals.filter(b => b.status?.toUpperCase() === 'REJECTED').length,
          },
          muhurtams: {
            all: muhurtams.length,
            new: muhurtams.filter(m => !m.viewed).length,
            viewed: muhurtams.filter(m => m.viewed).length
          },
          schedule: {
            today: rituals.filter(b => b.date && isToday(parseISO(b.date.split('T')[0])) && b.status?.toUpperCase() !== 'REJECTED').length,
            upcoming: rituals.filter(b => b.date && isAfter(parseISO(b.date.split('T')[0]), today) && (b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED')).length
          }
        });
      } catch (err) { console.error("Stats fetch failed", err); }
    };
    fetchCounts();
  }, [location.pathname, priestId]);

  // CLICK OUTSIDE LOGIC (FIXED)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(e.target) && !e.target.closest('.nav-hamburger')) {
        setIsSidebarOpen(false);
      }
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target) && !profileIconRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, dropdownOpen]);

  const goToPage = (path, filter = 'ALL', tab = 'bookings', view = '') => {
    navigate(path, { state: { filter, tab, view } });
    setIsSidebarOpen(false);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
    window.location.reload(); 
  };

  return (
    <>
      <nav className="customer-navbar">
        <div className="navbar-content-wrapper">
          <button className="nav-hamburger" onClick={() => setIsSidebarOpen(!isSidebarOpen)}><FaBars /></button>
          
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
              {profilePicture ? <img src={profilePicture} alt="Profile" className="nav-profile-pic-img" /> : <FaUserCircle className="nav-default-avatar" />}
            </div>

            {dropdownOpen && (
              <div className="profile-dropdown" ref={dropdownRef}>
                <div className="dropdown-user-info">
                   <div className="dropdown-name">{firstName}</div>
                   <div className="dropdown-id">ID: {priestId}</div>
                </div>
                <div className="dropdown-menu">
                  <div onClick={() => goToPage('/Profile')} className="dropdown-item"><FaUserCircle className="dropdown-icon" /> Profile</div>
                  <div onClick={() => { setDropdownOpen(false); setShowChangePasswordModal(true); }} className="dropdown-item"><FaLock className="dropdown-icon" /> Password</div>
                  <div onClick={() => goToPage('/Help')} className="dropdown-item"><MdOutlineHelpOutline className="dropdown-icon" /> Help</div>
                  <div className="dropdown-divider"></div>
                  <div onClick={() => { setDropdownOpen(false); setShowLogoutConfirm(true); }} className="dropdown-item logout-item"><MdOutlineLogout className="dropdown-icon" /> Logout</div>
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
            <div onClick={() => goToPage('/Dashboard')} className={`v2-nav-item ${location.pathname === '/Dashboard' ? 'active' : ''}`}>
              <span className="v2-icon"><FaHome /></span><span className="v2-text">Dashboard</span>
            </div>
            {/* EARNINGS MOVED BELOW DASHBOARD */}
            <div onClick={() => goToPage('/Earnings')} className={`v2-nav-item ${location.pathname === '/Earnings' ? 'active' : ''}`}>
              <span className="v2-icon"><FaChartBar /></span><span className="v2-text">Earnings</span>
            </div>
            {/* MUHURTAM FINDER RESTORED */}
            <div onClick={() => goToPage('/Mohurtam')} className={`v2-nav-item ${location.pathname === '/Mohurtam' ? 'active' : ''}`}>
              <span className="v2-icon"><FaPray /></span><span className="v2-text">Muhurtam Finder</span>
            </div>
          </div>

          <div className="v2-divider"></div>

          {/* INBOX SECTION */}
          <div className="sidebar-section-label" onClick={() => setRequestsExpanded(!requestsExpanded)}>
            INBOX / REQUESTS {requestsExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {requestsExpanded && (
            <div className="sidebar-v2-nested">
                <div className="nested-group">
                    <div className="nested-title"><FaClipboardList /> Muhurtam Inquiries</div>
                    <div className="nested-item" onClick={() => goToPage('/Requests', 'ALL', 'requests')}>
                        Total <span className="v2-badge blue">{stats.muhurtams.all}</span>
                    </div>
                    <div className="nested-item" onClick={() => goToPage('/Requests', 'NEW', 'requests')}>
                        New Inquiry <span className="v2-badge gold">{stats.muhurtams.new}</span>
                    </div>
                </div>

                <div className="nested-group">
                    <div className="nested-title"><FaCalendarCheck /> Ritual Bookings</div>
                    <div className="nested-item" onClick={() => goToPage('/Requests', 'PENDING', 'bookings')}>
                        Pending <span className="v2-badge gold">{stats.rituals.pending}</span>
                    </div>
                    <div className="nested-item" onClick={() => goToPage('/Requests', 'ACCEPTED', 'bookings')}>
                        Accepted <span className="v2-badge green">{stats.rituals.accepted}</span>
                    </div>
                    <div className="nested-item" onClick={() => goToPage('/Requests', 'REJECTED', 'bookings')}>
                        Rejected <span className="v2-badge red">{stats.rituals.rejected}</span>
                    </div>
                </div>
            </div>
          )}

          <div className="v2-divider"></div>

          {/* SCHEDULE SECTION */}
          <div className="sidebar-section-label" onClick={() => setBookingsExpanded(!bookingsExpanded)}>
            SCHEDULE {bookingsExpanded ? <FaChevronUp /> : <FaChevronDown />}
          </div>
          {bookingsExpanded && (
            <div className="sidebar-v2-nested">
                <div className="nested-item" onClick={() => goToPage('/Dashboard', 'ALL', 'bookings', 'today')}>
                   Today's Rituals <span className="v2-badge blue">{stats.schedule.today}</span>
                </div>
                <div className="nested-item" onClick={() => goToPage('/Dashboard', 'ALL', 'bookings', 'upcoming')}>
                   Upcoming <span className="v2-badge blue">{stats.schedule.upcoming}</span>
                </div>
            </div>
          )}

          <div className="v2-divider"></div>

          <div className="sidebar-v2-footer">
            <div className="v2-nav-item" onClick={() => goToPage('/manage-events')}><FaBullhorn className="v2-icon" /> Manage Events</div>
            <div className="v2-nav-item" onClick={() => goToPage('/priest-gallery')}><FaRegImages className="v2-icon" /> Gallery</div>
            <div className="v2-nav-item" onClick={() => goToPage('/Help')}><MdOutlineHelpOutline className="v2-icon" /> Help</div>
            <div className="v2-nav-item logout" onClick={() => setShowLogoutConfirm(true)}><MdOutlineLogout className="v2-icon" /> Logout</div>
          </div>
        </div>
      </aside>

      <ConfirmationModal isOpen={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} title="Logout" message="Are you sure you want to log out?" />
      <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
    </>
  );
};

export default Navbar;