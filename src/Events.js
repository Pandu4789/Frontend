import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserTie, FaPrayingHands, FaUtensils, FaChevronLeft, FaChevronRight, FaBell, FaCalendarAlt, FaHandsHelping, FaSun, FaMoon, FaOm } from 'react-icons/fa';
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
    { id: 'dummy-1', type: 'dummy', imageUrl: 'https://images.unsplash.com/photo-1604318721473-cb7223b37803?q=80&w=2070', title: 'Find Divine Peace', subtitle: 'Book authentic priests for your home ceremonies.', linkUrl: '/book-priest' },
    { id: 'dummy-2', type: 'dummy', imageUrl: 'https://images.unsplash.com/photo-1590050882195-2bd076329381?q=80&w=2070', title: 'Sacred Rituals', subtitle: 'Ensure every pooja is performed with devotion.', linkUrl: '/book-priest' },
  ];
  
  const quickLinks = [
    { id: 'book-priest', name: 'Book Priest', icon: <FaUserTie />, description: 'Find a priest for ceremonies', path: '/book-priest' },
    { id: 'pooja-items', name: 'Pooja Guide', icon: <FaPrayingHands />, description: 'Explore pooja significance', path: '/pooja-items' },
    { id: 'prasadam', name: 'Food', icon: <FaUtensils />, description: 'Blessed food delivered', path: '/prasadam' },
    { id: 'your-bookings', name: 'Your Bookings', icon: <FaHandsHelping />, description: 'View active bookings', path: '/your-bookings' }
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
    const fetchDaily = fetch(`${API_BASE}/api/daily-times/by-date=${todayStr}`).then(res => res.ok ? res.json() : null);
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
    <div className="dashboard-page-wrapper">
      <div className="dashboard-container">
        
        {/* Welcome Section */}
        <section className="dashboard-hero-section">
          <div className="hero-content">
            <h1 className="user-greeting">Namaste, {userName} <FaOm className="greeting-icon"/></h1>
            <p className="user-greeting-sub">Welcome back to your spiritual hub.</p>
            
            <div className="user-stats-container">
              <div className="stat-card" onClick={() => navigate('/your-bookings')}>
                <div className="stat-icon-wrapper blue-bg">
                  <FaCalendarAlt />
                </div>
                <div className="stat-info">
                  <h3>{upcomingBookings}</h3>
                  <p>Upcoming Bookings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper orange-bg">
                  <FaBell />
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Recent Orders</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="dashboard-main-grid">
          {/* Left Column */}
          <div className="dashboard-left-col">
            
            {/* Image Carousel Section */}
            <section className="dashboard-card carousel-card">
              {carouselImages.length > 0 && (
                <div className="carousel-wrapper">
                  <div className="carousel-inner" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                    {carouselImages.map((image) => (
                      <div key={image.id} className="carousel-item">
                        <img src={image.imageUrl} alt={image.title} />
                        <div className="carousel-overlay">
                          <div className="carousel-caption">
                            <h3 className="carousel-title">{image.title}</h3>
                            <p className="carousel-subtitle">{image.subtitle}</p>
                          </div>
                          {image.type !== 'dummy' && (
                            <button className="carousel-btn" onClick={() => navigate(image.linkUrl)}>
                                {image.type === 'gallery' ? 'Book Now' : 'View Event'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="carousel-nav-btn prev" onClick={prevImage}><FaChevronLeft /></button>
                  <button className="carousel-nav-btn next" onClick={nextImage}><FaChevronRight /></button>
                  <div className="carousel-dots">
                    {carouselImages.map((_, index) => (
                      <span key={index} className={`dot ${index === currentImageIndex ? 'active' : ''}`} onClick={() => setCurrentImageIndex(index)}></span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Quick Actions */}
            <section className="dashboard-card quick-links-card">
              <h2 className="card-title">Quick Actions</h2>
              <div className="quick-links-grid">
                {quickLinks.map((link) => (
                  <div key={link.id} className="quick-link-tile" onClick={() => handleQuickLinkClick(link.path)}>
                    <div className="tile-icon-wrapper">{link.icon}</div>
                    <h3 className="tile-title">{link.name}</h3>
                    <p className="tile-desc">{link.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Events Display */}
            <section className="dashboard-card events-card">
              <h2 className="card-title">Daily Events</h2>
              <DashboardEventsDisplay isLoading={isEventsLoading} />
            </section>

          </div>

          {/* Right Column (Sidebar Widgets) */}
          <div className="dashboard-right-col">
            
            {/* Muhurtham Widget */}
            <section className="dashboard-card muhurtham-card">
              <h2 className="card-title"><FaCalendarAlt className="title-icon"/> Today's Timings</h2>
              <div className="muhurtham-content">
                {isTimingsLoading ? <p className="loading-text">Loading auspicious timings...</p> : (
                  <div className="timing-list">
                    <div className="timing-item">
                      <FaSun className="timing-icon sun" />
                      <div className="timing-details">
                        <span className="timing-label">Sunrise</span>
                        <span className="timing-value">{formatTime12Hour(todayTimings?.sunrise) ?? 'N/A'}</span>
                      </div>
                    </div>
                    <div className="timing-item">
                      <FaMoon className="timing-icon moon" />
                      <div className="timing-details">
                        <span className="timing-label">Sunset</span>
                        <span className="timing-value">{formatTime12Hour(todayTimings?.sunset) ?? 'N/A'}</span>
                      </div>
                    </div>
                    <div className="timing-divider"></div>
                    <div className="timing-item">
                      <div className="timing-details">
                        <span className="timing-label bad-time">Rahu Kalam</span>
                        <span className="timing-value">{(todayTimings?.rahukalamStart && todayTimings?.rahukalamEnd) ? `${formatTime12Hour(todayTimings.rahukalamStart)} - ${formatTime12Hour(todayTimings.rahukalamEnd)}` : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="timing-item">
                      <div className="timing-details">
                        <span className="timing-label bad-time">Yamagandam</span>
                        <span className="timing-value">{(todayTimings?.yamagandamStart && todayTimings?.yamagandamEnd) ? `${formatTime12Hour(todayTimings.yamagandamStart)} - ${formatTime12Hour(todayTimings.yamagandamEnd)}` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                )}
                <p className="timing-note">*Timings are approximate for your location.</p>
              </div>
            </section>

            {/* Book Priest CTA Widget */}
            <section className="dashboard-card cta-card">
              <div className="cta-content">
                <FaUserTie className="cta-huge-icon" />
                <h3>Need a Priest?</h3>
                <p>Book a qualified, authentic priest for your next pooja or ceremony.</p>
                <button className="primary-cta-btn" onClick={() => handleQuickLinkClick('/book-priest')}>
                  Book Now <FaChevronRight className="btn-icon" />
                </button>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;