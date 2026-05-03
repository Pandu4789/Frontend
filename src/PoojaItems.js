import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaChevronDown,
  FaLeaf,
  FaSpinner,
  FaClock,
  FaCalendarCheck,
  FaTag,
} from "react-icons/fa";
import "./PoojaItems.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const PoojaItems = () => {
  const navigate = useNavigate();
  const sortRef = useRef(null);

  const [poojas, setPoojas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Recommended");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.EVENTS.GET_ALL))
      .then((res) => res.json())
      .then((data) => {
        setPoojas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fetch Error:", err);
        setLoading(false);
      });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredPoojas = useMemo(() => {
    let result = poojas.filter((p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortBy === "A - Z") result.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === "Z - A") result.sort((a, b) => b.name.localeCompare(a.name));

    return result;
  }, [poojas, searchTerm, sortBy]);

  if (loading)
    return (
      <div className="pg-loader">
        <FaSpinner className="pg-spin" /> Initializing Directory...
      </div>
    );

  return (
    <div className="pg-page-wrapper">
      <div className="pg-sub-nav">
        <div className="pg-nav-inner">
          <div className="pg-nav-left">
            <h2 className="pg-main-title">
              Available Poojas{" "}
              <span className="pg-count">({filteredPoojas.length})</span>
            </h2>
          </div>

          <div className="pg-nav-center">
            <div className="pg-search-group">
              <FaSearch className="pg-search-icon" />
              <input
                type="text"
                placeholder="Search rituals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="pg-nav-right">
            <div className="pg-sort-container" ref={sortRef}>
              <button
                className="pg-sort-trigger"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                Sort By: <strong>{sortBy}</strong> <FaChevronDown />
              </button>
              {showSortDropdown && (
                <div className="pg-dropdown-menu">
                  {["Recommended", "A - Z", "Z - A"].map((opt) => (
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
          </div>
        </div>
      </div>

      <div className="pg-main-content">
        <div className="pg-ritual-grid">
          {filteredPoojas.map((pooja) => (
            <div key={pooja.id} className="pg-ritual-card">
              <div className="pg-card-image">
                <img
                  src={`https://images.unsplash.com/photo-1602664711586-d99cf3978b87?auto=format&fit=crop&q=80&w=400&h=250`}
                  alt={pooja.name}
                />
              </div>

              <div className="pg-card-body">
                <div className="pg-card-header">
                  <h3>{pooja.name}</h3>
                  <p className="pg-category">
                    <FaLeaf /> {pooja.category || "Sacred Ritual"}
                  </p>
                </div>

                <div className="pg-meta-info">
                  <div className="pg-meta-item">
                    <FaClock /> <span>{pooja.duration || "90 Mins"}</span>
                  </div>
                  <div className="pg-meta-item pg-price-text">
                    <FaTag /> <span>${pooja.estimatedPrice || "51"}</span>
                  </div>
                </div>

                <p className="pg-card-desc">
                  {pooja.description ||
                    "Perform this sacred ritual with our verified Vedic experts to invoke divine blessings and peace."}
                </p>

                <div className="pg-card-footer">
                  <button
                    className="pg-btn-book"
                    onClick={() =>
                      navigate("/book-priest", {
                        state: { selectedPooja: pooja.name },
                      })
                    }
                  >
                    <FaCalendarCheck /> Book Pooja
                  </button>
                  <button
                    className="pg-btn-view"
                    onClick={() => navigate(`/rituals/${pooja.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PoojaItems;
