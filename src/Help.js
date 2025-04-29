import React from 'react';
import './Help.css'; // Make sure path is correct

const Help = () => {
  return (
    <div className="help-container">
      <h1 className="help-title">Need Help?</h1>

      <div className="help-grid">
        <div className="help-card">
          <h2>📞 Contact Us</h2>
          <p>
            Reach us at <strong>+1 (940) 279-8585</strong> for support or inquiries about priest services and bookings.
          </p>
        </div>

        <div className="help-card">
          <h2>✉️ Mail Us</h2>
          <p>
            Email us at <strong>support@priestbooking.com</strong> and we’ll respond as soon as possible.
          </p>
        </div>

        <div className="help-card">
          <h2>📍 Our Main Office</h2>
          <p>
            614 Mills Ln, Irving, TX 75062<br />
            Mon - Sat, 9:00 AM - 6:00 PM
          </p>
        </div>
      </div>

      <div className="help-footer">
        <p>We’re here to help. Don’t hesitate to reach out!</p>
      </div>
    </div>
  );
};

export default Help;
