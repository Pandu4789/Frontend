import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./PriestProfile.css";
import BookingModal from "./BookingModal";
import AskForMuhurtam from "./AskForMuhurtam";
import LoginPromptModal from "./LoginPromptModal";
import HoroscopeModal from "./HoroscopeModal";
import {
  FaPhoneAlt,
  FaUserCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaStar,
  FaGlobe,
  FaAward,
  FaCalendarCheck,
  FaArrowLeft,
  FaInfoCircle,
} from "react-icons/fa";

const PriestProfile = () => {
  const navigate = useNavigate();
  const { id: priestId } = useParams();
  const [priest, setPriest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showHoroscopeModal, setShowHoroscopeModal] = useState(false);
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [nakshatramList, setNakshatramList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const priestRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/auth/priests/${priestId}`,
        );
        const profileRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/profile?email=${priestRes.data.email}`,
        );

        setPriest({
          ...priestRes.data,
          ...profileRes.data,
          poojas: profileRes.data.services || [],
          languages: profileRes.data.languages || [],
        });

        const nakshatraRes = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/nakshatram`,
        );
        setNakshatramList(nakshatraRes.data);

        const email = localStorage.getItem("userEmail");
        const isGuestUser = email === "guest@example.com";
        if (email && !isGuestUser) {
          try {
            const customerRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/profile?email=${email}`,
            );
            setCustomer({
              name: `${customerRes.data.firstName || ""} ${customerRes.data.lastName || ""}`,
              email: customerRes.data.email || "",
              phone: customerRes.data.phone || "",
              address: customerRes.data.addressLine1 || "",
              note: "",
            });
          } catch (customerErr) {
            console.warn(
              "Customer profile not available for current user.",
              customerErr,
            );
          }
        }
      } catch (err) {
        setError("Profile currently unavailable.");
        toast.error("Connection error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [priestId]);

  const handleActionClick = (action) => {
    const email = localStorage.getItem("userEmail");
    const isGuestUser = email === "guest@example.com";
    if (!email || isGuestUser) {
      setShowLoginPrompt(true);
    } else {
      action();
    }
  };

  if (loading)
    return <div className="pp-loader">Seeking Divine Details...</div>;
  if (error || !priest) return <div className="pp-status-msg">{error}</div>;

  return (
    <div className="pp-page-container">
      <ToastContainer position="bottom-right" />

      <div className="pp-profile-header-bg">
        <div className="pp-header-nav">
          <button onClick={() => navigate(-1)} className="pp-back-btn">
            <FaArrowLeft /> Back to Directory
          </button>
        </div>
      </div>

      <div className="pp-main-content">
        <div className="pp-grid-layout">
          <div className="pp-info-stack">
            <header className="pp-hero-text">
              <span className="pp-category-tag">Verified Priest</span>
              <h1>
                {priest.firstName} {priest.lastName}
              </h1>

              {/* VISIBILITY FIX: Rating & Location Meta */}
              <div className="pp-hero-meta">
                <div className="pp-rating-chip">
                  <FaStar className="pp-star-mini" />
                  <span>4.9 Verified</span>
                </div>
                <div className="pp-location-badge">
                  <FaMapMarkerAlt />{" "}
                  <span>
                    {priest.city}, {priest.state}
                  </span>
                </div>
              </div>
            </header>

            <div className="pp-details-card">
              <section className="pp-section">
                <h3>
                  <FaInfoCircle /> Biography
                </h3>
                <p className="pp-bio-text">
                  {priest.bio ||
                    "Experienced Vedic scholar dedicated to performing authentic rituals and providing spiritual guidance."}
                </p>
              </section>

              <section className="pp-section">
                <h3>Sacred Services Offered</h3>
                <div className="pp-tags-grid">
                  {priest.poojas?.map((p, i) => (
                    <span key={i} className="pp-service-pill">
                      {p}
                    </span>
                  ))}
                </div>
              </section>

              <section className="pp-section">
                <h3>Communication Languages</h3>
                <div className="pp-tags-grid">
                  {priest.languages?.map((l, i) => (
                    <span key={i} className="pp-lang-pill">
                      <FaGlobe className="pp-globe-icon" /> {l}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <aside className="pp-sidebar">
            <div className="pp-sticky-card">
              <div className="pp-avatar-sidebar-container">
                <div className="pp-avatar-circle">
                  {priest.imageUrl ? (
                    <img src={priest.imageUrl} alt="Priest" />
                  ) : (
                    <FaUserCircle className="pp-avatar-icon-placeholder" />
                  )}
                  <div className="pp-status-indicator">Available</div>
                </div>
              </div>

              <div className="pp-action-box">
                <button
                  className="pp-btn-primary"
                  onClick={() =>
                    handleActionClick(() => setShowBookingModal(true))
                  }
                >
                  <FaCalendarCheck /> Book Ritual Now
                </button>

                <button
                  className="pp-btn-outline"
                  onClick={() =>
                    handleActionClick(() => setShowMuhurtamModal(true))
                  }
                >
                  Consult for Muhurtam
                </button>

                {priest.offersHoroscopeReading && (
                  <button
                    className="pp-btn-dark"
                    onClick={() =>
                      handleActionClick(() => setShowHoroscopeModal(true))
                    }
                  >
                    <FaStar /> Horoscope Analysis
                  </button>
                )}
              </div>

              <div className="pp-contact-info">
                <div className="pp-contact-row">
                  <FaPhoneAlt />{" "}
                  <span>{priest.phone || "Contact Verified"}</span>
                </div>
                <div className="pp-contact-row">
                  <FaEnvelope /> <span>{priest.email}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          priest={priest}
          customer={customer}
          setCustomer={setCustomer}
          onClose={() => setShowBookingModal(false)}
        />
      )}
      {showMuhurtamModal && (
        <AskForMuhurtam
          priest={priest}
          customer={customer}
          nakshatramList={nakshatramList}
          onClose={() => setShowMuhurtamModal(false)}
        />
      )}
      {showLoginPrompt && (
        <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
      )}
      {showHoroscopeModal && (
        <HoroscopeModal
          priest={priest}
          onClose={() => setShowHoroscopeModal(false)}
        />
      )}
    </div>
  );
};

export default PriestProfile;
