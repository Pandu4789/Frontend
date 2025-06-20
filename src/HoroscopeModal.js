import React from 'react';
import { toast } from 'react-toastify';
import './BookingModal.css'; // Keep for base modal styles

const HoroscopeModal = ({ priest, onClose }) => {

  // ✅ 1. Define the styles as a JavaScript object
  const contactNoteStyle = {
    backgroundColor: '#fdf5e6', // A light beige from your theme
    border: '1px solid #eee0cb', // A border from your theme
    borderLeft: '4px solid #b74f2f', // A heading color from your theme
    padding: '12px',
    margin: '20px 0', // Added a bit more margin
    borderRadius: '6px',
    fontSize: '0.95rem',
    lineHeight: '1.5' // Improved line spacing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add logic here to submit the horoscope request to your backend.
    toast.info(`Horoscope request for Priest ${priest.firstName} will be implemented soon!`);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Request Horoscope Reading</h2>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <p>You are requesting a horoscope reading from <strong>{priest.firstName} {priest.lastName}</strong>.</p>
            
            {/* ✅ 2. Apply the style object directly to the <p> tag */}
            <p style={contactNoteStyle}>
              For more information about this service, please contact the priest directly at: <strong>{priest.phone || 'the number on their profile'}</strong>.
            </p>
            
            <p>Online requests for this feature will be available soon.</p>
          </div>
          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>Close</button>
            <button type="submit" className="submit-btn" disabled>Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HoroscopeModal;