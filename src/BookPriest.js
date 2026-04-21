import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaSearch,
  FaFilter,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaStar,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import "./BookPriest.css";

const BookPriest = () => {
  const navigate = useNavigate();
  const [priests, setPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [filters, setFilters] = useState({ name: "", poojaType: "" });
  const [loading, setLoading] = useState(true);

  const [expandedPriestId, setExpandedPriestId] = useState(null);

  const API_URL = "http://localhost:8080";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [priestRes, poojaRes] = await Promise.all([
          axios.get(`${API_URL}/api/auth/priests`),
          axios.get(`${API_URL}/api/events`),
        ]);

        let priestData = priestRes.data || [];
        if (filters.name) {
          priestData = priestData.filter((p) =>
            `${p.firstName} ${p.lastName}`
              .toLowerCase()
              .includes(filters.name.toLowerCase()),
          );
        }
        if (filters.poojaType) {
          priestData = priestData.filter((p) =>
            p.servicesOffered?.includes(filters.poojaType),
          );
        }

        setPriests(priestData);
        setAvailablePoojas(poojaRes.data);
      } catch (err) {
        console.error("Error loading directory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const resetFilters = () => setFilters({ name: "", poojaType: "" });
  const toggleExpand = (id) =>
    setExpandedPriestId(expandedPriestId === id ? null : id);

  return (
    <div className="bp-page-wrapper">
      {/* --- CURVED HERO SECTION --- */}
      <header className="bp-hero">
        <div className="bp-hero-content">
          <h1>Divine Directory</h1>
          <p>
            Connect with verified, experienced priests for your sacred rituals.
          </p>
        </div>
      </header>

      <div className="bp-filter-container">
        <div className="bp-filter-card">
          <div className="bp-filter-group">
            <div className="bp-input-wrapper">
              <FaSearch className="bp-icon" />
              <input
                type="text"
                placeholder="Search by priest name..."
                value={filters.name}
                onChange={(e) =>
                  setFilters({ ...filters, name: e.target.value })
                }
              />
            </div>

            <div className="bp-input-wrapper">
              <FaFilter className="bp-icon" />
              <select
                value={filters.poojaType}
                onChange={(e) =>
                  setFilters({ ...filters, poojaType: e.target.value })
                }
              >
                <option value="">All Sacred Services</option>
                {availablePoojas.map((pooja) => (
                  <option key={pooja.id} value={pooja.name}>
                    {pooja.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={resetFilters} className="bp-btn-reset">
              <FaSyncAlt /> <span>Clear Filters</span>
            </button>
          </div>
        </div>
      </div>

      <main className="bp-main-grid">
        {loading ? (
          <div className="bp-loader-box">
            <div className="bp-spinner"></div>
            <p>Searching the holy directory...</p>
          </div>
        ) : priests.length > 0 ? (
          <div className="bp-grid-layout">
            {priests.map((priest) => (
              <div className="bp-priest-card" key={priest.id}>
                <div className="bp-card-top">
                  <div className="bp-avatar-box">
                    {priest.imageUrl ? (
                      <img src={priest.imageUrl} alt={priest.firstName} />
                    ) : (
                      <FaUserCircle className="bp-user-placeholder" />
                    )}
                  </div>
                  <div className="bp-priest-info">
                    <div className="bp-rating-badge">
                      <FaStar className="star-icon" /> <span>4.9 Verified</span>
                    </div>
                    <h3>
                      {priest.firstName} {priest.lastName}
                    </h3>
                    <div className="bp-location-tag">
                      <FaMapMarkerAlt />
                      <span>
                        {priest.city}, {priest.state}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bp-card-body">
                  <p className="bp-biography">
                    {priest.bio ||
                      "Dedicated Vedic scholar specializing in traditional rituals and spiritual guidance."}
                  </p>

                  <div className="bp-tags-container">
                    <div className="bp-service-tags">
                      {priest.servicesOffered
                        ?.slice(0, 3)
                        .map((service, index) => (
                          <span key={index} className="bp-tag">
                            {service}
                          </span>
                        ))}

                      {priest.servicesOffered?.length > 3 && (
                        <button
                          className="bp-tag-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpand(priest.id);
                          }}
                        >
                          +{priest.servicesOffered.length - 3} More
                        </button>
                      )}
                    </div>

                    {expandedPriestId === priest.id && (
                      <div className="bp-tags-dropdown">
                        <div className="bp-dropdown-header">
                          <span>All Services</span>
                          <FaTimes
                            className="bp-close-tags"
                            onClick={() => setExpandedPriestId(null)}
                          />
                        </div>
                        <div className="bp-dropdown-list">
                          {priest.servicesOffered.map((service, index) => (
                            <span key={index} className="bp-tag-full">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="bp-btn-profile"
                  onClick={() => navigate(`/priests/${priest.id}`)}
                >
                  View Full Profile <FaArrowRight />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bp-empty-state">
            <FaSearch size={40} />
            <h3>No results found</h3>
            <p>Try adjusting your search criteria or clearing filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookPriest;
