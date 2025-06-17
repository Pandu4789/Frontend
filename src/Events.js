import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie, FaPrayingHands, FaUtensils, FaChevronLeft, FaChevronRight,
  FaBell, FaCalendarAlt, FaHandsHelping
} from 'react-icons/fa';
import DashboardEventsDisplay from './DashboardEventsDisplay';
import './CustomerDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// This helper function already handles null/undefined input gracefully
const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null; // Return null instead of 'N/A'
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (isNaN(h) || isNaN(m)) return null;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userName, setFirstName] = useState("Devotee");
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [recentOrders, setRecentOrders] = useState(0);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  // State for the timings widget
  const [todayTimings, setTodayTimings] = useState(null);
  const [isTimingsLoading, setIsTimingsLoading] = useState(true);

  // (Dummy data and other functions remain the same)
  const displayImages = [
    { id: 1, src: 'https://via.placeholder.com/1200x400/F0D55C/4A2000?text=Grand+Temple+Celebration', alt: 'Grand Temple Celebration' },
    { id: 2, src: 'https://via.placeholder.com/1200x400/4A2000/FFD700?text=Peaceful+Morning+Pooja', alt: 'Peaceful Morning Pooja' },
    { id: 3, src: 'https://via.placeholder.com/1200x400/B74F2F/FDF5E6?text=Community+Gathering', alt: 'Community Gathering' },
  ];
  const quickLinks = [
    { id: 'book-priest', name: 'Book Priest', icon: <FaUserTie />, description: 'Find a priest for your ceremonies.', path: '/book-priest', isProminent: true },
    { id: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands />, description: 'Explore pooja items and significance.', path: '/pooja-items' },
    { id: 'prasadam', name: 'Food', icon: <FaUtensils />, description: 'Get blessed food delivered.', path: '/prasadam' },
    { id: 'your-bookings', name: 'Your Bookings', icon: <FaHandsHelping />, description: 'View all your active bookings.', path: '/your-bookings' }
  ];
  const handleQuickLinkClick = (path) => navigate(path);
  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  useEffect(() => {
    // Auto-swipe for carousel
    const autoSwipe = setInterval(nextImage, 5000);
    const storedFirstName = localStorage.getItem('firstName') || 'Devotee';
    setFirstName(storedFirstName);
    const timer = setTimeout(() => setIsEventsLoading(false), 1500);

    // Fetch user bookings
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`${API_BASE}/api/booking/customer/${userId}`)
        .then(res => res.json())
        .then(data => {
          const upcoming = data.filter(booking => new Date(booking.date || booking.datetime) >= new Date());
          setUpcomingBookings(upcoming.length);
        })
        .catch(err => setUpcomingBookings(0));
    }
    setRecentOrders(0);

    // --- UPDATED: More resilient data fetching for timings ---
    const todayStr = new Date().toISOString().split('T')[0];
    const sunApiUrl = `${API_BASE}/api/sun?date=${todayStr}`;
    const dailyTimesApiUrl = `${API_BASE}/api/daily-times/by-date/${todayStr}`;

    // Fetch each piece of data, resolving to null if the fetch fails
    const fetchSun = fetch(sunApiUrl).then(res => res.ok ? res.json() : null).catch(() => null);
    const fetchDaily = fetch(dailyTimesApiUrl).then(res => res.ok ? res.json() : null).catch(() => null);

    Promise.all([fetchSun, fetchDaily])
    .then(([sunData, dailyTimesData]) => {
      // Create the final object, even if parts are missing
      const timings = {
        sunrise: sunData?.sunrise, // Optional chaining in case sunData is null
        sunset: sunData?.sunset,
        rahukalamStart: dailyTimesData?.rahukalamStart,
        rahukalamEnd: dailyTimesData?.rahukalamEnd,
        yamagandamStart: dailyTimesData?.yamagandamStart,
        yamagandamEnd: dailyTimesData?.yamagandamEnd,
      };
      setTodayTimings(timings);
    })
    .catch(error => {
      // This will only catch critical programming errors, not failed fetches
      console.error("A critical error occurred fetching timings:", error);
      setTodayTimings({}); // Set an empty object to render N/A for all fields
    })
    .finally(() => {
      setIsTimingsLoading(false);
    });

    return () => {
      clearInterval(autoSwipe);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="dashboard-container">
      {/* (Other sections like Greeting, Carousel, CTA, Quick Links remain the same) */}
      <section className="dashboard-section user-summary-section">
        <h2 className="user-greeting">Namaste, {userName}!</h2>
        <div className="user-stats">
          <div className="stat-item">
            <FaCalendarAlt className="stat-icon blue" />
            <span>{upcomingBookings} Upcoming Bookings</span>
          </div>
          <div className="stat-item">
            <FaBell className="stat-icon orange" />
            <span>{recentOrders} Recent Orders</span>
          </div>
        </div>
      </section>

      <section className="dashboard-section image-carousel-section">
        <div className="carousel-inner" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {displayImages.map((image) => (
            <div key={image.id} className="carousel-item"><img src={image.src} alt={image.alt} /></div>
          ))}
        </div>
        <button className="carousel-button prev" onClick={prevImage}><FaChevronLeft /></button>
        <button className="carousel-button next" onClick={nextImage}><FaChevronRight /></button>
        <div className="carousel-dots">
          {displayImages.map((_, index) => (
            <span key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)}></span>
          ))}
        </div>
      </section>

      {/* --- UPDATED: Today's Timings Widget with Graceful Fallbacks --- */}
      <section className="dashboard-section muhurtham-widget">
        <h2 className="section-title"><FaCalendarAlt /> Today's Timings</h2>
        <div className="muhurtham-details">
          {isTimingsLoading ? (
            <p>Loading timings...</p>
          ) : (
            <>
              <p><strong>Sunrise:</strong> {formatTime12Hour(todayTimings?.sunrise) ?? 'N/A'}</p>
              <p><strong>Sunset:</strong> {formatTime12Hour(todayTimings?.sunset) ?? 'N/A'}</p>
              <p>
                <strong>Rahu Kalam:</strong> 
                {(todayTimings?.rahukalamStart && todayTimings?.rahukalamEnd) 
                  ? `${formatTime12Hour(todayTimings.rahukalamStart)} - ${formatTime12Hour(todayTimings.rahukalamEnd)}` 
                  : 'N/A'}
              </p>
              <p>
                <strong>Yamagandam:</strong> 
                {(todayTimings?.yamagandamStart && todayTimings?.yamagandamEnd)
                  ? `${formatTime12Hour(todayTimings.yamagandamStart)} - ${formatTime12Hour(todayTimings.yamagandamEnd)}`
                  : 'N/A'}
              </p>
              <p className="muhurtham-note">*(Timings are approximate for your location.)</p>
            </>
          )}
        </div>
      </section>
      
      {/* (Other sections like CTA, Quick Links, Events Display remain the same) */}
      <section className="dashboard-section book-priest-cta">
        <h2 className="section-title"><FaUserTie /> Need a Priest?</h2>
        <p>Book a qualified priest for your next pooja or ceremony with ease.</p>
        <button className="cta-button" onClick={() => handleQuickLinkClick('/book-priest')}>
          Book a Priest Now <FaChevronRight className="cta-button-icon" />
        </button>
      </section>
      <section className="dashboard-section quick-links-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link) => (
            <div key={link.id} className={`quick-link-card ${link.isProminent ? 'prominent-link' : ''}`} onClick={() => handleQuickLinkClick(link.path)}>
              <div className="quick-link-icon">{link.icon}</div>
              <h3 className="quick-link-title">{link.name}</h3>
              <p className="quick-link-description">{link.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="dashboard-section events-display-section">
        <h2 className="section-title">Daily Events</h2>
        <DashboardEventsDisplay isLoading={isEventsLoading} />
      </section>
    </div>
  );
};

export default Dashboard;