import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaUserCircle, FaSearch, FaFilter, FaSyncAlt, FaMapMarkerAlt } from 'react-icons/fa';
import './BookPriest.css';

const BookPriest = () => { 
  const [priests, setPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [filters, setFilters] = useState({ name: '', poojaType: '' });
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:8080";

  const loadData = async () => {
    setLoading(true);
    try {
      const [priestRes, poojaRes] = await Promise.all([
        axios.get(`${API_URL}/api/auth/priests`),
        axios.get(`${API_URL}/api/events`)
      ]);

      let priestData = priestRes.data;

      if (filters.name) {
        priestData = priestData.filter(p => 
          `${p.firstName} ${p.lastName}`.toLowerCase().includes(filters.name.toLowerCase())
        );
      }
      if (filters.poojaType) {
        priestData = priestData.filter(p =>
          p.servicesOffered?.includes(filters.poojaType)
        );
      }

      setPriests(priestData);
      setAvailablePoojas(poojaRes.data);
    } catch (err) {
      console.error('Error loading holy directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters]);

  const resetFilters = () => setFilters({ name: '', poojaType: '' });

  return (
    <div className="bp-page-wrapper">
      <header className="bp-header">
        <div className="bp-header-content">
          <h1>Divine Connections</h1>
          <p>Book experienced priests for your sacred poojas and rituals.</p>
        </div>
      </header>

      {/* FILTER SECTION */}
      <div className="bp-filter-container">
        <div className="bp-filter-card">
          <div className="bp-filter-group">
            
            <div className="bp-input-wrapper">
              <FaSearch className="bp-icon" />
              <input
                type="text"
                placeholder="Search by priest name..."
                value={filters.name}
                onChange={e => setFilters({...filters, name: e.target.value})}
              />
            </div>

            <div className="bp-input-wrapper">
              <FaFilter className="bp-icon" />
              <select
                value={filters.poojaType}
                onChange={e => setFilters({...filters, poojaType: e.target.value})}
              >
                <option value="">All Pooja Services</option>
                {availablePoojas.map(pooja => (
                  <option key={pooja.id} value={pooja.name}>{pooja.name}</option>  
                ))}
              </select>
            </div>

            <button onClick={resetFilters} className="bp-btn-reset">
              <FaSyncAlt /> <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIEST GRID */}
      <main className="bp-main-grid">
        {loading ? (
          <div className="bp-status">Loading holy directory...</div>
        ) : priests.length > 0 ? (
          <div className="bp-grid-layout">
            {priests.map(priest => (
              <div className="bp-priest-card" key={priest.id}>
                <div className="bp-card-top">
                  <div className="bp-avatar-box">
                    {priest.imageUrl ? (
                      <img src={priest.imageUrl} alt={priest.firstName} />
                    ) : (
                      <div className="bp-placeholder-wrapper">
                        <FaUserCircle className="bp-user-placeholder" />
                      </div>
                    )}
                  </div>
                  <div className="bp-priest-info">
                    <h3>{priest.firstName} {priest.lastName}</h3>
                    <div className="bp-location-tag">
                      <FaMapMarkerAlt /> 
                      <span>
                        {priest.city && priest.state 
                          ? `${priest.city}, ${priest.state}` 
                          : 'Location not set'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bp-card-body">
                  <p className="bp-biography">
                    {priest.bio || 'Experienced priest offering traditional Vedic services and spiritual guidance.'}
                  </p>
                  <div className="bp-service-tags">
                    {priest.servicesOffered?.slice(0, 3).map((service, index) => (
                      <span key={index} className="bp-tag">{service}</span>
                    ))}
                  </div>
                </div>

                <button
                  className="bp-btn-profile"
                  onClick={() => window.location.href = `/priests/${priest.id}`}
                >
                  View Full Profile
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bp-status">No priests found matching your criteria.</div>
        )}
      </main>
    </div>
  );
};

export default BookPriest;