import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUserTie, FaPrayingHands, FaUtensils, FaChevronLeft, FaChevronRight,
  FaBell, FaCalendarAlt, FaHandsHelping // New icons for enhancements
} from 'react-icons/fa';
import DashboardEventsDisplay from './DashboardEventsDisplay';
import './CustomerDashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userName, setFirstName] = useState("Devotee"); // State for user name
  const [upcomingBookings, setUpcomingBookings] = useState(0); // State for dummy data
  const [recentOrders, setRecentOrders] = useState(0); // State for dummy data
  const [isEventsLoading, setIsEventsLoading] = useState(true); // State for events loading

  // Dummy data for prominent display images
  const displayImages = [
    { id: 1, src: 'https://via.placeholder.com/1200x400/F0D55C/4A2000?text=Grand+Temple+Celebration', alt: 'Grand Temple Celebration' },
    { id: 2, src: 'https://via.placeholder.com/1200x400/4A2000/FFD700?text=Peaceful+Morning+Pooja', alt: 'Peaceful Morning Pooja' },
    { id: 3, src: 'https://via.placeholder.com/1200x400/B74F2F/FDF5E6?text=Community+Gathering', alt: 'Community Gathering' },
    { id: 4, src: 'https://via.placeholder.com/1200x400/FFD700/B74F2F?text=Divine+Offerings', alt: 'Divine Offerings' },
  ];

  const quickLinks = [
    {
      id: 'book-priest',
      name: 'Book Priest',
      icon: <FaUserTie />,
      description: 'Find and book a priest for your ceremonies.',
      path: '/book-priest',
      isProminent: true, // Mark this for potential special styling if needed
    },
    {
      id: 'pooja-items',
      name: 'Pooja Guide',
      icon: <FaPrayingHands />,
      description: 'Explore pooja items and its significance.',
      path: '/pooja-items',
    },
    {
      id: 'prasadam',
      name: 'Food',
      icon: <FaUtensils />,
      description: 'Get blessed food delivered to your home.',
      path: '/prasadam',
    },
    {
      id: 'your-bookings',
      name: 'Your Bookings',
      icon: <FaHandsHelping />,
      description: 'View all your active bookings and requests.',
      path: '/your-bookings',
    }
  ];

  const handleQuickLinkClick = (path) => {
    navigate(path);
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex + 1) % displayImages.length
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      (prevIndex - 1 + displayImages.length) % displayImages.length
    );
  };

  // Auto-swipe functionality for carousel
  useEffect(() => {
    const autoSwipe = setInterval(nextImage, 5000); // Change image every 5 seconds
    return () => clearInterval(autoSwipe);
  }, [displayImages.length]);

  // Simulate fetching user data and event loading
  useEffect(() => {
    // In a real app, fetch user name from auth context or API
    const storedFirstName = localStorage.getItem('firstName') || 'Devotee';
    setFirstName(storedFirstName);

    // Simulate loading for events (it will eventually become false in DashboardEventsDisplay)
    const timer = setTimeout(() => {
      setIsEventsLoading(false);
    }, 1500); // Simulate 1.5 seconds loading time for events

    // Simulate fetching user's upcoming bookings/orders
    setUpcomingBookings(0); // Example value
    setRecentOrders(0); // Example value

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="dashboard-container">
      {/* Personalized Greeting & Summary */}
      <section className="dashboard-section user-summary-section">
        <h2 className="user-greeting">Namaste, {userName}!</h2>
        <div className="user-stats">
          <div className="stat-item">
            <FaCalendarAlt className="stat-icon" />
            <span>{upcomingBookings} Upcoming Bookings</span>
          </div>
          <div className="stat-item">
            <FaBell className="stat-icon" />
            <span>{recentOrders} Recent Orders</span>
          </div>
        </div>
      </section>

      {/* Image Carousel Section */}
      <section className="dashboard-section image-carousel-section">
        <div className="carousel-inner" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
          {displayImages.map((image) => (
            <div key={image.id} className="carousel-item">
              <img src={image.src} alt={image.alt} />
            </div>
          ))}
        </div>
        <button className="carousel-button prev" onClick={prevImage}>
          <FaChevronLeft />
        </button>
        <button className="carousel-button next" onClick={nextImage}>
          <FaChevronRight />
        </button>
        <div className="carousel-dots">
          {displayImages.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentImageIndex ? 'active' : ''}`}
              onClick={() => setCurrentImageIndex(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Today's Muhurtham / Auspicious Timings Widget */}
      <section className="dashboard-section muhurtham-widget">
        <h2 className="section-title"><FaCalendarAlt /> Today's Auspicious Timings</h2>
        <div className="muhurtham-details">
          <p><strong>Sunrise:</strong> 06:00 AM</p>
          <p><strong>Sunset:</strong> 07:00 PM</p>
          <p><strong>Rahu Kalam:</strong> 03:00 PM - 04:30 PM</p>
          <p><strong>Auspicious Time:</strong> 09:15 AM - 10:45 AM</p>
          <p className="muhurtham-note">*(Timings are approximate and subject to location.)</p>
        </div>
      </section>

      {/* Prominent Call-to-Action for Booking */}
      <section className="dashboard-section book-priest-cta">
        <h2 className="section-title"><FaUserTie /> Need a Priest?</h2>
        <p>Book a qualified priest for your next pooja or ceremony with ease.</p>
        <button
          className="cta-button"
          onClick={() => handleQuickLinkClick('/book-priest')}
        >
          Book a Priest Now
          <FaChevronRight className="cta-button-icon" />
        </button>
      </section>

      {/* Quick Links Section */}
      <section className="dashboard-section quick-links-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map((link) => (
            <div
              key={link.id}
              className={`quick-link-card ${link.isProminent ? 'prominent-link' : ''}`}
              onClick={() => handleQuickLinkClick(link.path)}
            >
              <div className="quick-link-icon">{link.icon}</div>
              <h3 className="quick-link-title">{link.name}</h3>
              <p className="quick-link-description">{link.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Daily Events Display */}
      <section className="dashboard-section events-display-section">
        <h2 className="section-title">Daily Events</h2>
        <DashboardEventsDisplay isLoading={isEventsLoading} /> {/* Pass loading state */}
      </section>
    </div>
  );
};

export default Dashboard;