import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaPhoneAlt, FaUserCircle, FaCalendarAlt, FaClock, FaCheckCircle, FaExclamationCircle
} from 'react-icons/fa';
import './BookPriest.css'; // All CSS for this page in one file

const PriestList = () => {
  // State for Priest Directory
  const [priests, setPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [filters, setFilters] = useState({ name: '', phone: '', poojaType: '' });

  // Dummy data for Your Bookings (as per your screenshot)
  const yourBookings = [
    {
      id: 1,
      type: 'Griha Pravesh Puja',
      priest: 'Pandit Sharma',
      date: 'May 31, 2025',
      time: '10:00 AM',
      status: 'Confirmed',
    },
    {
      id: 2,
      type: 'Birthday Puja',
      priest: 'Acharya Tiwari',
      date: 'June 10, 2025',
      time: '05:00 PM',
      status: 'Pending',
    },
    // Add more dummy bookings if needed for testing
  ];

  // Helper to get status icon for bookings
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed':
        return <FaCheckCircle className="status-icon confirmed" />;
      case 'Pending':
        return <FaExclamationCircle className="status-icon pending" />;
      default:
        return null;
    }
  };

  // --- Priest List Data Loading ---
  const loadPriests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/priests');
      let data = response.data;

      if (filters.name) {
        data = data.filter(p => p.firstName.toLowerCase().includes(filters.name.toLowerCase()));
      }
      if (filters.phone) {
        data = data.filter(p => p.phone && p.phone.includes(filters.phone));
      }
     if (filters.poojaType) {
  data = data.filter(p =>
    p.servicesOffered && p.servicesOffered.includes(filters.poojaType)
  );
}

      setPriests(data);
    } catch (err) {
      console.error('Failed to fetch priests:', err);
    }
  };

  const loadAvailablePoojas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/events'); // Adjust endpoint if needed
      setAvailablePoojas(response.data);
    } catch (err) {
      console.error('Failed to fetch pooja types:', err);
    }
  };

  useEffect(() => {
    loadAvailablePoojas();
  }, []);

  useEffect(() => {
    loadPriests();
  }, [filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', phone: '', poojaType: '' });
  };

  return (
    <div className="priest-booking-page-container">
      {/* Priest Directory Section */}
      <div className="priest-directory">
        <h1>Priest Directory</h1>

        <div className="filters">
          <input
            type="text"
            placeholder="Filter by name"
            value={filters.name}
            onChange={e => handleFilterChange('name', e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by phone"
            value={filters.phone}
            onChange={e => handleFilterChange('phone', e.target.value)}
          />

        <select
  value={filters.poojaType}
  onChange={e => handleFilterChange('poojaType', e.target.value)}
  className={filters.poojaType === '' ? 'placeholder-selected' : ''}
>
  <option value="" disabled>Filter by pooja type</option>
  {availablePoojas.map(pooja => (
    <option key={pooja.id} value={pooja.name}>{pooja.name}</option>  
  ))}
</select>


          <button onClick={resetFilters} className="reset-btn">
            Reset Filters
          </button>
        </div>

        <div className="priest-list">
          {priests.map(priest => (
            <div className="priest-card" key={priest.id}>
              <div className="priest-image-container">
                {priest.imageUrl ? (
                  <img
                    src={priest.imageUrl}
                    alt={`${priest.firstName} ${priest.lastName}`}
                    className="priest-image"
                  />
                ) : (
                  <div className="priest-image-placeholder">
                    <FaUserCircle size={80} className="placeholder-icon" />
                  </div>
                )}
              </div>

              <h2>{priest.firstName} {priest.lastName}</h2>
              <p className="bio">{priest.bio || 'No bio available.'}</p>

              <button
                className="view-profile"
                onClick={() => window.location.href = `/priests/${priest.id}`}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Your Bookings Section - Placed at the bottom */}
      <div className="your-bookings-container">
        <h2 className="bookings-title">Your Bookings</h2>
        <div className="bookings-grid">
          {yourBookings.map((booking) => (
            <div key={booking.id} className="booking-card">
              <div className="booking-header">
                <h3 className="booking-type">{booking.type}</h3>
                <div className="booking-status">
                  {getStatusIcon(booking.status)}
                  <span className={`status-text ${booking.status.toLowerCase()}`}>{booking.status}</span>
                </div>
              </div>
              <p className="booking-priest">With {booking.priest}</p>
              <div className="booking-details">
                <div className="detail-item">
                  <FaCalendarAlt className="detail-icon" />
                  <span>{booking.date}</span>
                </div>
                <div className="detail-item">
                  <FaClock className="detail-icon" />
                  <span>{booking.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PriestList;