import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaListUl,
  FaHome,
  FaArrowLeft,
  FaClock,
  FaTag,
  FaPhone,
  FaEnvelope,
  FaGlobe,
  FaPrint,
} from "react-icons/fa";
import logo from "./image.png";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";
import "./RitualDetails.css";

const RitualDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pooja, setPooja] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(buildApiUrl(API_ENDPOINTS.EVENTS.GET_BY_ID(id)))
      .then((res) => res.json())
      .then((data) => {
        setPooja(data);
        setLoading(false);
      });

    fetch(buildApiUrl(API_ENDPOINTS.POOJA_ITEMS.GET_BY_EVENT(id)))
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []));
  }, [id]);

  const handlePrint = () => window.print();

  if (loading || !pooja)
    return <div className="rd-loader">Loading Sacred Ritual...</div>;

  return (
    <div className="rd-page-wrapper">
      {/* --- HIDDEN PRINT-ONLY SECTION --- */}
      <div className="rd-print-only-container">
        {/* Branded Header Box Moved to Top */}
        <div className="rd-print-header-box">
          <div className="rd-print-header-content">
            <div className="rd-print-brand-main">
              <img src={logo} alt="Priestfy" className="rd-print-box-logo" />
              <h1 className="rd-print-brand-text">
                <span className="p-black">PRIEST</span>
                <span className="p-orange">FY</span>
              </h1>
            </div>

            <p className="rd-print-address">
              302 Seven Springs Way, Brentwood, TN, 37027
            </p>

            <div className="rd-print-contact-row">
              <div className="rd-print-contact-item">
                <FaPhone /> +1 940-279-8585
              </div>
              <div className="rd-print-contact-item">
                <FaEnvelope /> info@priestify.com
              </div>
              <div className="rd-print-contact-item">
                <FaGlobe /> www.priestify.com
              </div>
            </div>
          </div>
        </div>

        <div className="rd-print-content">
          <h2 className="rd-print-title">{pooja.name} - Items Checklist</h2>
          <div className="rd-print-table">
            <div className="rd-print-thead">
              <span>Item Name</span>
              <span>Quantity</span>
            </div>
            {items.map((item, idx) => (
              <div key={idx} className="rd-print-trow">
                <span className="rd-print-item-name">
                  <div className="rd-print-checkbox"></div> {item.itemName}
                </span>
                <span>
                  {item.quantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
          <div className="rd-print-footer">
            <p>© {new Date().getFullYear()} Priestfy. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* --- VISIBLE UI SECTION --- */}
      <nav className="rd-top-nav no-print">
        <button onClick={() => navigate(-1)} className="rd-back-btn">
          <FaArrowLeft /> Back to Rituals
        </button>
      </nav>

      <div className="rd-main-container no-print">
        <aside className="rd-left-col">
          <div className="rd-image-card">
            <img
              src={`https://images.unsplash.com/photo-1602664711586-d99cf3978b87?auto=format&fit=crop&q=80&w=600`}
              alt={pooja.name}
              className="rd-main-img"
            />
          </div>

          <div className="rd-items-box">
            <div className="rd-section-header">
              <FaListUl /> <h3>Required Items</h3>
            </div>
            <div className="rd-items-list">
              {items.length > 0 ? (
                items.map((item, idx) => (
                  <div key={idx} className="rd-item-row">
                    <span>{item.itemName}</span>
                    <span className="rd-qty">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rd-empty">No items listed yet.</p>
              )}
            </div>
            <button onClick={handlePrint} className="rd-btn-print-list">
              <FaPrint /> Print Items Checklist
            </button>
          </div>
        </aside>

        <main className="rd-right-col">
          <section className="rd-header-section">
            <div className="rd-meta">
              <span className="rd-badge">
                <FaTag /> {pooja.category || "Ritual"}
              </span>
              <span className="rd-badge">
                <FaClock /> {pooja.duration || "90 Mins"}
              </span>
            </div>
            <h1>{pooja.name}</h1>
            <p className="rd-full-desc">{pooja.description}</p>
            <button
              className="rd-btn-book"
              onClick={() =>
                navigate("/book-priest", {
                  state: { selectedPooja: pooja.name },
                })
              }
            >
              <FaCalendarCheck /> Book this Pooja
            </button>
          </section>

          <section className="rd-instructions-box">
            <div className="rd-section-header">
              <FaHome /> <h3>How to perform at home</h3>
            </div>
            <div className="rd-step-container">
              <div className="rd-step">
                <div className="rd-step-num">01</div>
                <div className="rd-step-content">
                  <h4>Sankalpam</h4>
                  <p>
                    Set a clear intention and seek blessings for the success of
                    the ritual.
                  </p>
                </div>
              </div>
              <div className="rd-step">
                <div className="rd-step-num">02</div>
                <div className="rd-step-content">
                  <h4>Dhyanam & Avahanam</h4>
                  <p>
                    Meditate upon the deity and invite the divine energy into
                    the sacred space.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default RitualDetails;
