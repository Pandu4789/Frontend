import React from 'react';

const Footer = () => {
  const footerStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: '#000000',
    color: '#ffffff',
    textAlign: 'center',
    padding: '20px 10px',
    fontSize: '14px',
    boxShadow: '0 -2px 5px rgba(0,0,0,0.5)',
    zIndex: 1000,
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const mottoStyle = {
    marginTop: '6px',
    fontStyle: 'italic',
    fontSize: '13px',
    color: '#ddd',
  };

  return (
    <footer style={footerStyle}>
      <div style={containerStyle}>
        <div>
          © {new Date().getFullYear()} PRIESTify. All rights reserved.
        </div>
        <div style={{ marginTop: '8px' }}>
          Developed and maintained by <strong>Mohit Kumar Nagubandi</strong>
        </div>
        <div style={mottoStyle}>
          Connecting priests and customers seamlessly — book priests, pooja items, and prasadams; priests can manage bookings, calendars, and consult on muhurtham and jyotishyam.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
