import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useParams, useNavigate } from 'react-router-dom';
import './PriestProfile.css';

const PriestProfile = () => {
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
  const [showBirthDetailsModal, setShowBirthDetailsModal] = useState(false);

  const [nakshatram, setNakshatram] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlace, setBirthPlace] = useState('');

  const [customer, setCustomer] = useState(null);
  const [nakshatramList, setNakshatramList] = useState([]);

  const navigate = useNavigate();
  const { id: priestId } = useParams();

  useEffect(() => {
    const fetchPriestData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/auth/priests`);
        const priestData = response.data.find(p => p.id == priestId);
        if (!priestData) {
          throw new Error('Priest not found');
        }
        setPriest(priestData);
      } catch (err) {
        console.error('Failed to fetch priest details:', err);
        setError('Error fetching priest details.');
      } finally {
        setLoading(false);
      }
    };

    const fetchNakshatramList = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/nakshatram');
        setNakshatramList(response.data);
      } catch (err) {
        console.error('Failed to fetch nakshatram list:', err);
      }
    };

    const fetchCustomerData = async () => {
      try {
        // Dynamically get the username (replace with real user auth, here using localStorage for simplicity)
        const username = localStorage.getItem('username');
        const response = await axios.get(`http://localhost:8080/api/profile`, {
          params: { username }
        });
        const data = response.data;
        setCustomer({
          name: `${data.firstName} ${data.lastName}`,
          address: data.address,
        });
      } catch (err) {
        console.error('Failed to fetch customer data:', err);
        toast.error('Failed to load customer details');
      }
    };

    fetchPriestData();
    fetchNakshatramList();
    fetchCustomerData();
  }, [priestId]);

  const handleSendMuhurtamRequest = async () => {
    if (!customer || !customer.name || !customer.email || !customer.phone || !customer.address) {
      toast.error('Please fill in all customer details.');
      return;
    }
  
    try {
      const payload = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        nakshatram: nakshatram || null,
        date: birthTime ? birthTime.split('T')[0] : null, // extract date part
        time: birthTime ? birthTime.split('T')[1] : null, // extract time part
        place: birthPlace || null
      };
  
      await axios.post('http://localhost:8080/api/muhurtam/request', payload);
      toast.success(`Muhurtam request sent to Priest: ${priest.firstName} ${priest.lastName}`);
      setShowMuhurtamModal(false);
      setNakshatram('');
      setBirthTime('');
      setBirthPlace('');
    } catch (error) {
      console.error('Failed to send Muhurtam request:', error);
      toast.error('Failed to send request.');
    }
  };
  

  const handleSendBirthDetails = () => {
    if (!birthTime || !birthPlace.trim()) {
      toast.error('Please fill both birth time and place.');
      return;
    }
    toast.success('Birth details saved!');
    setShowBirthDetailsModal(false);
    setBirthTime('');
    setBirthPlace('');
  };

  const handleBookNow = () => {
    toast.success('Booking request sent!');
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="priest-profile-container">
      <div className="profile-card">
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

        <div className="contact-section">
          <div className="contact-item">
            <span className="icon">✉️</span>
            <span>{priest.profile?.mailId || 'N/A'}</span>
          </div>
          <div className="contact-item">
            <span className="icon">📞</span>
            <span>{priest.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="bio-section">
          <h2 className="section-title">
            <span className="icon">📝</span> Bio
          </h2>
          <p>{priest.profile?.bio || 'No bio available'}</p>
        </div>

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

        {priest.profile?.experience && (
          <div className="experience-section">
            <h2 className="section-title">
              <span className="icon">⏳</span> Experience
            </h2>
            <p>{priest.profile.experience} years</p>
          </div>
        )}

        <div className="action-buttons">
          <button className="muhurtam-btn" onClick={() => setShowMuhurtamModal(true)}>
            Ask for Muhurtam
          </button>
          <button className="book-now-btn" onClick={handleBookNow}>
            Book Now
          </button>
        </div>
      </div>

      {showMuhurtamModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Your Nakshatram</h2>
            <select
              value={nakshatram}
              onChange={e => setNakshatram(e.target.value)}
            >
              <option value="">-- Select Nakshatram --</option>
              {nakshatramList.map(n => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>
            <div className="small-link" onClick={() => setShowBirthDetailsModal(true)}>
              Don’t know Nakshatram? No problem...
            </div>

            {customer ? (
              <div className="customer-details">
              <p><strong>Name:</strong> {customer.name}</p>
            
              {/* Editable fields for email, phone, and address */}
              <div>
                <label htmlFor="email">Email:</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={customer.email || ''}
                  onChange={e => setCustomer(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            
              <div>
                <label htmlFor="phone">Phone:</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone"
                  value={customer.phone || ''}
                  onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            
              <div>
                <label htmlFor="address">Address:</label>
                <input
                  id="address"
                  type="text"
                  placeholder="Enter your address"
                  value={customer.address || ''}
                  onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            
            ) : (
              <div className="guest-prompt">
                <p>Continue to SignUp? <span className="signup-link" onClick={() => navigate('/signup')}>Sign Up</span></p>
              </div>
            )}

            <div className="modal-actions">
              <button onClick={handleSendMuhurtamRequest}>Send</button>
              <button onClick={() => setShowMuhurtamModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showBirthDetailsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Your Birth Details</h2>
            <input
              type="datetime-local" 
              placeholder="Birth Date and Time"
              value={birthTime}
              onChange={e => setBirthTime(e.target.value)}
            />
            <input
              type="text"
              placeholder="Birth Place"
              value={birthPlace}
              onChange={e => setBirthPlace(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleSendBirthDetails}>Send</button>
              <button onClick={() => setShowBirthDetailsModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default PriestProfile;
