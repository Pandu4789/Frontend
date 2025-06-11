// Filename: BookPriest.js - UPDATED (Your Bookings section removed)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle } from 'react-icons/fa'; // Simplified icon imports
import './BookPriest.css';

// Renamed component to reflect its purpose
const BookPriest = () => { 
  // State for Priest Directory
  const [priests, setPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [filters, setFilters] = useState({ name: '', poojaType: '' });

  // --- Priest List Data Loading ---
  const loadPriests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/auth/priests');
      let data = response.data;

      // Apply filters
      if (filters.name) {
        data = data.filter(p => 
          (p.firstName + " " + p.lastName).toLowerCase().includes(filters.name.toLowerCase())
        );
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
      const response = await axios.get('http://localhost:8080/api/events');
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
    setFilters({ name: '', poojaType: '' });
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
          <select
            value={filters.poojaType}
            onChange={e => handleFilterChange('poojaType', e.target.value)}
            className={filters.poojaType === '' ? 'placeholder-selected' : ''}
          >
            <option value="">Filter by pooja type</option>
            {availablePoojas.map(pooja => (
              <option key={pooja.id} value={pooja.name}>{pooja.name}</option>  
            ))}
          </select>
          <button onClick={resetFilters} className="reset-btn">
            Reset Filters
          </button>
        </div>

        <div className="priest-list">
          {priests.length > 0 ? (
            priests.map(priest => (
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
            ))
          ) : (
            <p>No priests found matching your criteria.</p>
          )}
        </div>
      </div>
      
      {/* "Your Bookings" section has been completely removed */}
    </div>
  );
};

export default BookPriest;