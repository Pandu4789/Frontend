import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaQuestionCircle } from 'react-icons/fa';
import './Help.css';

const Help = () => {
  return (
    <div className="help-page-wrapper">
      <div className="help-container">
        
        <header className="help-header">
          <FaQuestionCircle className="help-header-icon" />
          <h1 className="help-title">How can we help you?</h1>
          <p className="help-subtitle">Our team is here to ensure your spiritual journey is seamless.</p>
        </header>

        <div className="help-grid">
          {/* Phone Card */}
          <div className="help-card">
            <div className="card-icon-wrapper phone-bg">
              <FaPhoneAlt />
            </div>
            <h2>Call Us</h2>
            <p>Speak directly with our support team for urgent queries.</p>
            <a href="tel:+19402798585" className="help-link">+1 (940) 279-8585</a>
          </div>

          {/* Email Card */}
          <div className="help-card">
            <div className="card-icon-wrapper email-bg">
              <FaEnvelope />
            </div>
            <h2>Email Us</h2>
            <p>Send us your inquiries and we'll respond within 24 hours.</p>
            <a href="mailto:support@priestbooking.com" className="help-link">support@priestify.com</a>
          </div>

          {/* Office Card */}
          <div className="help-card">
            <div className="card-icon-wrapper office-bg">
              <FaMapMarkerAlt />
            </div>
            <h2>Our Office</h2>
            <p>302 Seven Springs Way, Brentwood, TN 37027</p>
            <span className="office-hours">Mon - Sat: 9 AM - 6 PM</span>
          </div>
        </div>

        {/* Support Action Section */}
        <section className="support-action-section">
          <div className="whatsapp-box">
            <FaWhatsapp className="whatsapp-icon" />
            <div className="whatsapp-text">
              <h3>Chat with us on WhatsApp</h3>
              <p>Get instant answers to your pooja and booking questions.</p>
            </div>
            <button className="whatsapp-btn" onClick={() => window.open('https://wa.me/19402798585', '_blank')}>
              Start Chat
            </button>
          </div>
        </section>

       <footer className="help-footer">
          <p>“Serving you is our greatest devotion.”</p>
        </footer>
      </div>
    </div>
  );
};

export default Help;