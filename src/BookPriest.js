import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaMapMarkerAlt,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaBolt,
  FaUserCircle,
} from "react-icons/fa";
import QuickBookModal from "./QuickBookModal";
import "./BookPriest.css";

const BookPriest = () => {
  const navigate = useNavigate();
  const sortRef = useRef(null); // Reference for the sort container

  const [priests, setPriests] = useState([]);
  const [filteredPriests, setFilteredPriests] = useState([]);
  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedPriest, setSelectedPriest] = useState(null);

  // Sidebar Collapse States
  const [collapsed, setCollapsed] = useState({
    events: false,
    languages: true,
    distance: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    services: [],
    languages: [],
    distance: [],
  });
  const [sortBy, setSortBy] = useState("Recommended");

  const API_BASE = process.env.REACT_APP_API_BASE_URL;

  // --- NEW: CLOSE DROPDOWN ON OUTSIDE CLICK ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [priestRes, poojaRes] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/priests`),
          axios.get(`${API_BASE}/api/events`),
        ]);
        setPriests(priestRes.data || []);
        setAvailablePoojas(poojaRes.data || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [API_BASE]);

  // Filtering & Sorting Logic
  useEffect(() => {
    let result = [...priests];

    // Search logic
    if (searchTerm) {
      result = result.filter((p) =>
        `${p.firstName} ${p.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }

    // STRICT "AND" LOGIC: Priest must offer ALL selected services
    if (activeFilters.services.length > 0) {
      result = result.filter((p) =>
        activeFilters.services.every((s) => p.servicesOffered?.includes(s)),
      );
    }

    // Language Filter
    if (activeFilters.languages.length > 0) {
      result = result.filter((p) =>
        activeFilters.languages.some((l) => p.languagesSpoken?.includes(l)),
      );
    }

    // Sorting Logic
    if (sortBy === "A - Z")
      result.sort((a, b) => a.firstName.localeCompare(b.firstName));
    if (sortBy === "Z - A")
      result.sort((a, b) => b.firstName.localeCompare(a.firstName));

    setFilteredPriests(result);
  }, [searchTerm, activeFilters, sortBy, priests]);

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const next = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };

  const toggleSection = (section) => {
    setCollapsed((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Enhanced filter toggle to close sort dropdown
  const handleToggleFilters = () => {
    setShowSortDropdown(false);
    setShowFilters(!showFilters);
  };

  return (
    <div className="bp-page-container">
      {/* --- STICKY SUB-NAV --- */}
      <div className="bp-sub-nav">
        <div className="bp-nav-inner">
          <div className="bp-nav-left">
            <h2 className="bp-main-title">
              Available Priests{" "}
              <span className="bp-count">({filteredPriests.length})</span>
            </h2>
          </div>
          <div className="bp-nav-center">
            <div className="bp-search-group">
              <FaSearch className="bp-search-icon" />
              <input
                type="text"
                placeholder="Search name ...."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="bp-nav-right">
            {/* ATTACHED sortRef HERE */}
            <div className="bp-sort-container" ref={sortRef}>
              <button
                className="bp-sort-trigger"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                Sort By: <strong>{sortBy}</strong> <FaChevronDown />
              </button>
              {showSortDropdown && (
                <div className="bp-dropdown-menu">
                  {["Recommended", "A - Z", "Z - A", "Nearest"].map((opt) => (
                    <div
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSortDropdown(false);
                      }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="bp-filter-toggle-btn"
              onClick={handleToggleFilters}
            >
              {showFilters ? (
                <>
                  <FaTimes /> Hide Filters
                </>
              ) : (
                <>
                  <FaFilter /> Show Filters
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bp-main-content">
        {/* --- COLLAPSIBLE SIDEBAR --- */}
        {showFilters && (
          <aside className="bp-sidebar-panel">
            <div className="bp-sidebar-section">
              <div
                className="section-header"
                onClick={() => toggleSection("events")}
              >
                <h4>Sacred Events</h4>
                {collapsed.events ? <FaChevronDown /> : <FaChevronUp />}
              </div>
              {!collapsed.events && (
                <div className="bp-check-list fade-in">
                  {availablePoojas.map((p) => (
                    <label key={p.id} className="bp-check-item">
                      <input
                        type="checkbox"
                        checked={activeFilters.services.includes(p.name)}
                        onChange={() => toggleFilter("services", p.name)}
                      />
                      <span>{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bp-sidebar-section">
              <div
                className="section-header"
                onClick={() => toggleSection("languages")}
              >
                <h4>Languages</h4>
                {collapsed.languages ? <FaChevronDown /> : <FaChevronUp />}
              </div>
              {!collapsed.languages && (
                <div className="bp-check-list fade-in">
                  {[
                    "English",
                    "Hindi",
                    "Tamil",
                    "Telugu",
                    "Kannada",
                    "Sanskrit",
                    "Malayalam",
                    "Gujarati",
                    "Bengali",
                    "Marathi",
                    "Punjabi",
                  ].map((lang) => (
                    <label key={lang} className="bp-check-item">
                      <input
                        type="checkbox"
                        checked={activeFilters.languages.includes(lang)}
                        onChange={() => toggleFilter("languages", lang)}
                      />
                      <span>{lang}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="bp-sidebar-section">
              <div
                className="section-header"
                onClick={() => toggleSection("distance")}
              >
                <h4>Distance</h4>
                {collapsed.distance ? <FaChevronDown /> : <FaChevronUp />}
              </div>
              {!collapsed.distance && (
                <div className="bp-check-list fade-in">
                  {["Under 5 mi", "Under 20 mi", "Under 50 mi", "100+ mi"].map(
                    (dist) => (
                      <label key={dist} className="bp-check-item">
                        <input
                          type="checkbox"
                          onChange={() => toggleFilter("distance", dist)}
                        />
                        <span>{dist}</span>
                      </label>
                    ),
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* --- PRIEST GRID --- */}
        <main className={`bp-priest-grid ${showFilters ? "grid-3" : "grid-4"}`}>
          {loading ? (
            <div className="bp-full-loader">
              Connecting to Sacred Directory...
            </div>
          ) : (
            filteredPriests.map((priest) => (
              <div key={priest.id} className="bp-priest-card">
                <div className="bp-card-top-info">
                  <div className="bp-pfp-circle">
                    {priest.profilePicture ? (
                      <img
                        src={`${API_BASE}${priest.profilePicture}`}
                        alt="P"
                      />
                    ) : (
                      <FaUserCircle />
                    )}
                  </div>
                  <div className="bp-title-meta">
                    <h3 className="bp-first-name">{priest.firstName}</h3>
                    <h3 className="bp-last-name">{priest.lastName}</h3>
                    <p>
                      <FaMapMarkerAlt /> {priest.city}, {priest.state}
                    </p>
                  </div>
                </div>

                <div className="bp-card-mid-info">
                  <div className="bp-info-row">
                    <label>Languages</label>
                    <div className="bp-pill-row single-line">
                      {priest.languagesSpoken?.map((l, i) => (
                        <span key={i} className="bp-mini-pill">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bp-info-row">
                    <label>Expertise</label>
                    <div className="bp-pill-row double-line">
                      {priest.servicesOffered?.map((s, i) => (
                        <span key={i} className="bp-mini-pill">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bp-card-footer-btns">
                  <button
                    className="bp-btn-quick-book"
                    onClick={() => setSelectedPriest(priest)}
                  >
                    <FaBolt /> Quick Book
                  </button>
                  <button
                    className="bp-btn-view-profile"
                    onClick={() => navigate(`/priests/${priest.id}`)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))
          )}
        </main>
      </div>

      {selectedPriest && (
        <QuickBookModal
          priest={selectedPriest}
          onClose={() => setSelectedPriest(null)}
        />
      )}
    </div>
  );
};

export default BookPriest;
