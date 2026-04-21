import React from "react";
import { toast } from "react-toastify";
import {
  FaStar,
  FaPhoneAlt,
  FaTimes,
  FaCheckCircle,
  FaInfoCircle,
  FaUserCircle,
} from "react-icons/fa";
import "./HoroscopeModal.css"; // Create this or use existing

const HoroscopeModal = ({ priest, onClose }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.info(
      `The automated horoscope request system is currently being finalized.`,
    );
  };

  return (
    <div className="hm-overlay">
      <div className="hm-card">
        {/* CLOSE BUTTON AT TOP RIGHT */}
        <button className="hm-close" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="hm-split-container">
          {/* LEFT SIDE: PRIEST INFO */}
          <div className="hm-summary-side">
            <div className="hm-priest-mini">
              {priest.imageUrl ? (
                <img src={priest.imageUrl} alt="Priest" />
              ) : (
                <FaUserCircle size={55} color="#eee" />
              )}
              <div className="hm-mini-meta">
                <h4>
                  {priest.firstName} {priest.lastName}
                </h4>
                <span>Vedic Astrology Service</span>
              </div>
            </div>

            <div className="hm-trust-badges">
              <div className="hm-trust-item">
                <FaCheckCircle className="icon-green" /> Personalized Chart
                Analysis
              </div>
              <div className="hm-trust-item">
                <FaStar className="icon-green" /> Future Path Guidance
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: INFO & CALL TO ACTION */}
          <div className="hm-form-side">
            <header className="hm-form-header">
              <h3>Horoscope Reading</h3>
            </header>

            <div className="hm-info-body">
              <p className="hm-main-text">
                Request a comprehensive horoscope reading and astrological
                consultation with <strong>{priest.firstName}</strong>.
              </p>

              {/* SERVICE NOTE CARD */}
              <div className="hm-contact-note">
                <FaInfoCircle className="hm-note-icon" />
                <div>
                  <p className="hm-note-title">Direct Consultation</p>
                  <p className="hm-note-desc">
                    To schedule a reading immediately, please contact the priest
                    at:
                  </p>
                  <span className="hm-phone-link">
                    <FaPhoneAlt /> {priest.phone || "Contact via Profile"}
                  </span>
                </div>
              </div>

              <div className="hm-coming-soon">
                <span className="hm-status-tag">Coming Soon</span>
                <p>
                  In-app booking for digital charts and recorded consultations
                  is being implemented.
                </p>
              </div>
            </div>

            <footer className="hm-actions">
              <button className="hm-btn-cancel" onClick={onClose}>
                Close
              </button>
              <button className="hm-btn-submit" onClick={handleSubmit} disabled>
                Request Analysis
              </button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeModal;
