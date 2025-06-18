import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaPrayingHands, FaUtensils, FaChevronLeft, FaChevronRight, FaBell, FaCalendarAlt, FaHandsHelping } from 'react-icons/fa';
import { format } from 'date-fns';
import DashboardEventsDisplay from './DashboardEventsDisplay';
import './CustomerDashboard.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10), m = parseInt(minutes, 10);
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
  const [carouselImages, setCarouselImages] = useState([]);
  const [todayTimings, setTodayTimings] = useState(null);
  const [isTimingsLoading, setIsTimingsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  const dummyImages = [
    { id: 'dummy-1', type: 'dummy', imageUrl: 'https://via.placeholder.com/1200x400/F0D55C/4A2000?text=Grand+Temple+Celebration', title: 'Grand Temple Celebration', subtitle: '', linkUrl: '/book-priest' },
    { id: 'dummy-2', type: 'dummy', imageUrl: 'https://via.placeholder.com/1200x400/4A2000/FFD700?text=Peaceful+Morning+Pooja', title: 'Peaceful Morning Pooja', subtitle: '', linkUrl: '/book-priest' },
  ];
  
  const quickLinks = [
    { id: 'book-priest', name: 'Book Priest', icon: <FaUserTie />, description: 'Find a priest for your ceremonies.', path: '/book-priest' },
    { id: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands />, description: 'Explore pooja items and significance.', path: '/pooja-items' },
    { id: 'prasadam', name: 'Food', icon: <FaUtensils />, description: 'Get blessed food delivered.', path: '/prasadam' },
    { id: 'your-bookings', name: 'Your Bookings', icon: <FaHandsHelping />, description: 'View all your active bookings.', path: '/your-bookings' }
  ];

  const handleQuickLinkClick = (path) => navigate(path);
  const nextImage = () => carouselImages.length > 0 && setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  const prevImage = () => carouselImages.length > 0 && setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  useEffect(() => {
    const autoSwipe = setInterval(nextImage, 5000);
    const storedFirstName = localStorage.getItem('firstName') || 'Devotee';
    setFirstName(storedFirstName);
    
    const userId = localStorage.getItem('userId');
    if (userId) {
      fetch(`${API_BASE}/api/booking/customer/${userId}`).then(res => res.json()).then(data => {
        setUpcomingBookings(data.filter(b => new Date(b.date || b.datetime) >= new Date()).length);
      }).catch(() => setUpcomingBookings(0));
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const fetchSun = fetch(`${API_BASE}/api/sun?date=${todayStr}`).then(res => res.ok ? res.json() : null);
    const fetchDaily = fetch(`${API_BASE}/api/daily-times/by-date/${todayStr}`).then(res => res.ok ? res.json() : null);
    Promise.all([fetchSun, fetchDaily])
      .then(([sunData, dailyTimesData]) => setTodayTimings({ ...sunData, ...dailyTimesData }))
      .finally(() => setIsTimingsLoading(false));

    const fetchGalleryImages = fetch(`${API_BASE}/api/gallery/all-random`).then(res => res.ok ? res.json() : []);
    const fetchEventImages = fetch(`${API_BASE}/api/events/with-images`).then(res => res.ok ? res.json() : []);

    Promise.all([fetchGalleryImages, fetchEventImages]).then(([galleryData, eventData]) => {
      const normalizedPriestImages = galleryData.map(img => ({ id: `gallery-${img.id}`, type: 'gallery', imageUrl: `${API_BASE}${img.imageUrl}`, title: `By ${img.priestName}`, subtitle: img.caption, linkUrl: `/priests/${img.priestId}` }));
      const now = new Date(); now.setHours(0,0,0,0);
      const normalizedEventImages = eventData.filter(evt => new Date(evt.date) >= now).map(evt => ({ id: `event-${evt.id}`, type: 'event', imageUrl: `${API_BASE}${evt.imageUrl}`, title: evt.name, subtitle: `On ${format(new Date(evt.date), 'MMMM d, yyyy')}`, linkUrl: `/events/${evt.id}` }));

      if (normalizedPriestImages.length > 0) setCarouselImages(normalizedPriestImages);
      else if (normalizedEventImages.length > 0) setCarouselImages(normalizedEventImages);
      else setCarouselImages(dummyImages);
    }).catch(() => setCarouselImages(dummyImages));

    setIsEventsLoading(false);
    return () => clearInterval(autoSwipe);
  }, []);

  return (
    <div className="dashboard-container">
      <section className="dashboard-section user-summary-section">
        <h2 className="user-greeting">Namaste, {userName}!</h2>
        <div className="user-stats">
          <div className="stat-item"><FaCalendarAlt className="stat-icon blue" /><span>{upcomingBookings} Upcoming Bookings</span></div>
          <div className="stat-item"><FaBell className="stat-icon orange" /><span>0 Recent Orders</span></div>
        </div>
      </section>

      <section className="dashboard-section image-carousel-section">
        {carouselImages.length > 0 && (
          <>
            <div className="carousel-inner" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
              {carouselImages.map((image) => (
                <div key={image.id} className="carousel-item">
                  <img src={image.imageUrl} alt={image.title} />
                  <div className="carousel-overlay">
                    <div className="carousel-caption">
                      <h3 className="priest-attribution">{image.title}</h3>
                      <p>{image.subtitle}</p>
                    </div>
                    {image.type !== 'dummy' && (
                       <button className="carousel-book-now" onClick={() => navigate(image.linkUrl)}>
                          {image.type === 'gallery' ? 'Book Now' : 'View Event'}
                       </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="carousel-button prev" onClick={prevImage}><FaChevronLeft /></button>
            <button className="carousel-button next" onClick={nextImage}><FaChevronRight /></button>
            <div className="carousel-dots">
              {carouselImages.map((_, index) => (<span key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)}></span>))}
            </div>
          </>
        )}
      </section>

      <section className="dashboard-section muhurtham-widget">
        <h2 className="section-title"><FaCalendarAlt /> Today's Timings</h2>
        <div className="muhurtham-details">
          {isTimingsLoading ? <p>Loading timings...</p> : (
            <>
              <p><strong>Sunrise:</strong> {formatTime12Hour(todayTimings?.sunrise) ?? 'N/A'}</p>
              <p><strong>Sunset:</strong> {formatTime12Hour(todayTimings?.sunset) ?? 'N/A'}</p>
              <p><strong>Rahu Kalam:</strong> {(todayTimings?.rahukalamStart && todayTimings?.rahukalamEnd) ? `${formatTime12Hour(todayTimings.rahukalamStart)} - ${formatTime12Hour(todayTimings.rahukalamEnd)}` : 'N/A'}</p>
              <p><strong>Yamagandam:</strong> {(todayTimings?.yamagandamStart && todayTimings?.yamagandamEnd) ? `${formatTime12Hour(todayTimings.yamagandamStart)} - ${formatTime12Hour(todayTimings.yamagandamEnd)}` : 'N/A'}</p>
              <p className="muhurtham-note">*(Timings are approximate for your location.)</p>
            </>
          )}
        </div>
      </section>
      
      <section className="dashboard-section book-priest-cta">
        <h2 className="section-title"><FaUserTie /> Need a Priest?</h2>
        <p>Book a qualified priest for your next pooja or ceremony with ease.</p>
        <button className="cta-button" onClick={() => handleQuickLinkClick('/book-priest')}>Book a Priest Now <FaChevronRight className="cta-button-icon" /></button>
      </section>

      <section className="dashboard-section quick-links-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link) => (
            <div key={link.id} className="quick-link-card" onClick={() => handleQuickLinkClick(link.path)}>
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