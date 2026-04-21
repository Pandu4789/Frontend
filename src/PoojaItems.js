import React, { useState, useEffect, useMemo } from "react";
import {
  FaPrint,
  FaClock,
  FaTag,
  FaCheckCircle,
  FaInfoCircle,
  FaSearch,
  FaLeaf,
  FaSpinner,
  FaChevronRight,
} from "react-icons/fa";
import "./PoojaItems.css";
import logo from "./image.png";

const PoojaItems = () => {
  const [poojas, setPoojas] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedPoojaId, setSelectedPoojaId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8080/api/events")
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

  useEffect(() => {
    if (selectedPoojaId) {
      fetch(`http://localhost:8080/api/pooja-items/event/${selectedPoojaId}`)
        .then((res) => res.json())
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .catch((err) => console.error("Items Error:", err));
    }
  }, [selectedPoojaId]);

  const filteredPoojas = useMemo(() => {
    return poojas.filter((p) => {
      const name = p?.name || "";
      return name.toLowerCase().includes((searchTerm || "").toLowerCase());
    });
  }, [poojas, searchTerm]);

  const selectedPooja = useMemo(
    () => poojas.find((p) => p.id === parseInt(selectedPoojaId)),
    [poojas, selectedPoojaId],
  );

  const handlePrint = () => {
    window.print();
  };

  if (loading)
    return (
      <div className="pg-loader">
        <FaSpinner className="pg-spin" /> Initializing Guide...
      </div>
    );

  return (
    <div className="pg-page-wrapper">
      {/* --- ORIGINAL PRINT HEADER --- */}
      <div className="pg-print-brand-header">
        <div className="print-header-center">
          <div className="print-header-top">
            <img src={logo} alt="Logo" className="print-logo-img" />
            <h1 className="print-brand-text">
              <span className="p-black">PRIEST</span>
              <span className="p-orange">IFY</span>
            </h1>
          </div>
          <p className="print-tagline">Your Sacred Ritual Partner</p>
        </div>

        {selectedPooja && (
          <div className="print-ritual-summary-box">
            <div className="print-ritual-header-row">
              <h2>{selectedPooja.name}</h2>
              <div className="print-stats-inline">
                <span>
                  <strong>Duration:</strong>{" "}
                  {selectedPooja.duration || "15-20 Min"}
                </span>
                <span>
                  <strong> Price:</strong>{" "}
                  {selectedPooja.estimatedPrice || "$51"}
                </span>
              </div>
            </div>
            <div className="print-ritual-description">
              <p>{selectedPooja.description}</p>
            </div>
          </div>
        )}
      </div>

      <header className="pg-hero">
        <div className="pg-hero-content">
          <h1>Sacred Pooja Guide</h1>
          <p>
            Prepare for your rituals with our comprehensive list of required
            items.
          </p>
        </div>
      </header>

      <div className="pg-container">
        <aside className="pg-sidebar">
          <div className="pg-search-container">
            <FaSearch className="pg-search-icon" />
            <input
              type="text"
              placeholder="Search Poojas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="pg-list">
            {filteredPoojas.length > 0 ? (
              filteredPoojas.map((p) => (
                <button
                  key={p.id}
                  className={`pg-list-item ${selectedPoojaId == p.id ? "active" : ""}`}
                  onClick={() => setSelectedPoojaId(p.id)}
                >
                  <span className="pg-item-label">{p.name}</span>
                  <FaChevronRight className="pg-arrow-icon" />
                </button>
              ))
            ) : (
              <p className="pg-no-results">No rituals found.</p>
            )}
          </div>
        </aside>

        <main className="pg-main-content">
          {selectedPooja ? (
            <div className="pg-card">
              <div className="pg-card-header">
                <div className="pg-title-box">
                  <FaLeaf className="pg-leaf-icon" />
                  <h2>{selectedPooja.name}</h2>
                </div>
                <div className="pg-meta-tags">
                  <span className="pg-tag">
                    <FaTag /> {selectedPooja.category || "General"}
                  </span>
                  <span className="pg-tag">
                    <FaClock /> {selectedPooja.duration || "Flexible"}
                  </span>
                </div>
              </div>

              <div className="pg-description-box">
                <p>
                  {selectedPooja.description ||
                    "No description available for this ritual."}
                </p>
              </div>

              <div className="pg-items-section">
                <div className="pg-section-title">
                  <FaCheckCircle /> <h3>Required Pooja Samagri</h3>
                </div>

                <div className="pg-items-grid">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <div key={item.id} className="pg-item-row">
                        <span className="pg-item-name">{item.itemName}</span>
                        <span className="pg-item-qty">
                          {item.quantity} {item.unit || ""}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="pg-empty-state">
                      <FaInfoCircle />{" "}
                      <p>Select a ritual or check back later.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pg-card-footer">
                <div className="pg-price-info">
                  <span className="label">Estimated Price:</span>
                  <span className="value">
                    {selectedPooja.estimatedPrice || "Contact Priest"}
                  </span>
                </div>
                <button onClick={handlePrint} className="pg-print-btn">
                  <FaPrint /> Print Checklist
                </button>
              </div>
            </div>
          ) : (
            <div className="pg-welcome-state">
              <div className="pg-welcome-icon">
                <FaLeaf />
              </div>
              <h2>Ready to Begin?</h2>
              <p>
                Choose a pooja ritual from the sidebar to view the checklist.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PoojaItems;
