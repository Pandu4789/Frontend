import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaHandsHelping, FaClock } from 'react-icons/fa';
import './Help.css';

const Help = () => {
  return (
    <div className="help-page-wrapper">
      <div className="help-container">
        
        <header className="help-header">
          <div className="help-icon-circle">
            <FaHandsHelping />
          </div>
          <h1 className="help-title">Divine Support</h1>
          <p className="help-subtitle">Our team is dedicated to ensuring your spiritual journey is seamless and sacred.</p>
        </header>

        <div className="help-grid">
          {/* Phone Card */}
          <div className="help-card">
            <div className="card-icon-wrapper phone-bg">
              <FaPhoneAlt />
            </div>
            <h2>Call Us</h2>
            <p>Direct assistance for urgent ritual bookings.</p>
            <a href="tel:+19402798585" className="help-link">+1 (940) 279-8585</a>
          </div>

          {/* Email Card */}
          <div className="help-card">
            <div className="card-icon-wrapper email-bg">
              <FaEnvelope />
            </div>
            <h2>Email Support</h2>
            <p>Detailed inquiries? We respond within 24 hours.</p>
            <a href="mailto:support@priestify.com" className="help-link">support@priestify.com</a>
          </div>

          {/* Office Card */}
          <div className="help-card">
            <div className="card-icon-wrapper office-bg">
              <FaMapMarkerAlt />
            </div>
            <h2>Headquarters</h2>
            <p>302 Seven Springs Way, Brentwood, TN 37027</p>
            <div className="office-hours">
                <FaClock className="clock-icon" /> <span>Mon - Sat: 9 AM - 6 PM</span>
            </div>
          </div>
        </div>

        {/* WhatsApp Action Section */}
        <section className="support-action-section">
          <div className="whatsapp-box">
            <div className="whatsapp-icon-bg">
                <FaWhatsapp className="whatsapp-icon" />
            </div>
            <div className="whatsapp-text">
              <h3>Live WhatsApp Support</h3>
              <p>Instant answers to your Muhurtam and pooja questions.</p>
            </div>
            <button className="whatsapp-btn" onClick={() => window.open('https://wa.me/19402798585', '_blank')}>
              Start Chat
            </button>
          </div>
        </section>

       <footer className="help-footer">
          <p>“Serving you is our greatest devotion.”</p>
          <div className="footer-line"></div>
        </footer>
      </div>
    </div>
  );
};

export default Help;