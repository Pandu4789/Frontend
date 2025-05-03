import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'react-router-dom';

const PriestProfile = () => {
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id: priestId } = useParams();

  useEffect(() => {
    const fetchPriestData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/priests`);
        const priestData = response.data.find(p => p.id == priestId);
        if (!priestData) throw new Error("Priest not found");
        setPriest(priestData);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch priest details:', err);
        setError('Error fetching priest details.');
        setLoading(false);
      }
    };

    fetchPriestData();
  }, [priestId]);

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="priest-profile-container">
      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          {priest.profile?.profilePicture ? (
            <img
              src={priest.profile.profilePicture}
              alt="Profile"
              className="profile-image"
            />
          ) : (
            <div className="profile-image-placeholder">
              <span>No Image</span>
            </div>
          )}
          <h1 className="priest-name">
            {priest.firstName} {priest.lastName}
          </h1>
        </div>

        {/* Contact Info */}
        <div className="contact-section">
          <div className="contact-item">
            <span className="icon">✉️</span>
            <span>{priest.profile?.mailId || 'N/A'}</span>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <span>{priest.phone}</span>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bio-section">
          <h2 className="section-title">
            <span className="icon">📝</span> Bio
          </h2>
          <p>{priest.profile?.bio || 'No bio available'}</p>
        </div>

        {/* Services Offered */}
        <div className="services-section">
          <h2 className="section-title">
            <span className="icon">🛎️</span> Services Offered
          </h2>
          <div className="services-grid">
            {priest.poojas && priest.poojas.length > 0 ? (
              priest.poojas.map((service, index) => (
                <div key={index} className="service-tag">
                  {service.name}
                </div>
              ))
            ) : (
              <p>No services listed</p>
            )}
          </div>
        </div>

        {/* Experience */}
        {priest.profile?.experience && (
          <div className="experience-section">
            <h2 className="section-title">
              <span className="icon">⏳</span> Experience
            </h2>
            <p>{priest.profile.experience} years</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="muhurtam-btn"
            onClick={() => toast.success('The priest has been notified!')}
          >
            Ask for Muhurtam
          </button>
          <button
            className="book-now-btn"
            onClick={() => toast.success('Booking request sent!')}
          >
            Book Now
          </button>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
      
      <style jsx>{`
        .priest-profile-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f5f7fa;
          padding: 20px;
        }
        
        .profile-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 600px;
          padding: 30px;
          position: relative;
          overflow: hidden;
        }
        
        .profile-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 20px;
          text-align: center;
        }
        
        .profile-image {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #e6f2ff;
          margin-bottom: 15px;
        }
        
        .profile-image-placeholder {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background-color: #e6f2ff;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 15px;
          color: #6c757d;
          font-size: 14px;
          border: 4px solid #e6f2ff;
        }
        
        .priest-name {
          color: #2c3e50;
          font-size: 28px;
          margin: 0;
          font-weight: 600;
        }
        
        .contact-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid #eee;
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #555;
          font-size: 16px;
        }
        
        .icon {
          font-size: 18px;
        }
        
        .section-title {
          color: #2c3e50;
          font-size: 20px;
          margin: 20px 0 15px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .bio-section p {
          color: #555;
          line-height: 1.6;
          margin-bottom: 5px;
        }
        
        .services-section {
          margin-bottom: 20px;
        }
        
        .services-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 10px;
        }
        
        .service-tag {
          background-color: #e6f2ff;
          color: #2980b9;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .experience-section p {
          color: #555;
          font-size: 16px;
        }
        
        .action-buttons {
          display: flex;
          gap: 15px;
          margin-top: 30px;
        }
        
        .muhurtam-btn, .book-now-btn {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .muhurtam-btn {
          background-color: #3498db;
          color: white;
        }
        
        .muhurtam-btn:hover {
          background-color: #2980b9;
        }
        
        .book-now-btn {
          background-color: #2ecc71;
          color: white;
        }
        
        .book-now-btn:hover {
          background-color: #27ae60;
        }
        
        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 50px auto;
        }
        
        .error-message {
          color: #e74c3c;
          text-align: center;
          margin: 50px auto;
          font-size: 18px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 600px) {
          .profile-card {
            padding: 20px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default PriestProfile;