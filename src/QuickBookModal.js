import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaBolt,
  FaHistory,
  FaLock,
  FaUser,
  FaEraser,
} from "react-icons/fa";
import "./QuickBookModal.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const QuickBookModal = ({ priest, onClose }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("event");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("userId"),
  );
  const [showBirthDetails, setShowBirthDetails] = useState(false);

  const [formData, setFormData] = useState({
    eventId: "",
    date: null,
    time: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zip: "",
    useProfileAddress: true,
    nakshatram: "",
    note: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
  });

  const [profileData, setProfileData] = useState(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [masterEvents, setMasterEvents] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const nakshatramList = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
  ];

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/events`)
      .then((res) => setMasterEvents(res.data));
    if (isLoggedIn) {
      fetchProfile();
    }
  }, [isLoggedIn]);

  const fetchProfile = async () => {
    const email = localStorage.getItem("userEmail");
    try {
      const res = await axios.get(
        `${API_BASE}/api/auth/profile?email=${email}`,
      );
      setProfileData(res.data);
      if (formData.useProfileAddress) syncAddress(res.data);
    } catch (err) {
      console.error("Profile fetch error", err);
    }
  };

  const syncAddress = (data) => {
    setFormData((prev) => ({
      ...prev,
      addressLine1: data.addressLine1 || "",
      addressLine2: data.addressLine2 || "",
      city: data.city || "",
      state: data.state || "",
      zip: data.zipCode || "",
    }));
  };

  const handleCheckboxChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({ ...prev, useProfileAddress: checked }));
    if (checked && profileData) syncAddress(profileData);
    else
      setFormData((p) => ({
        ...p,
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        zip: "",
      }));
  };

  useEffect(() => {
    if (formData.date && priest?.id) {
      const formattedDate = formData.date.toISOString().split("T")[0];
      axios
        .get(
          `${API_BASE}/api/availability/priest/${priest.id}/date/${formattedDate}`,
        )
        .then((res) => setAvailableTimeSlots(res.data || []))
        .catch(() => setAvailableTimeSlots([]));
    }
  }, [formData.date, priest.id]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, loginData);
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("userEmail", res.data.email);
      setIsLoggedIn(true);
      toast.success("Logged in successfully!");
    } catch (err) {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!profileData) {
      toast.error("User data not loaded. Please try again.");
      return;
    }

    setLoading(true);
    try {
      const fullName =
        `${profileData.firstName} ${profileData.lastName || ""}`.trim();
      const userPhone = profileData.phoneNumber || profileData.phone || "";
      const userId = localStorage.getItem("userId");

      // Find the event object to get the ID
      const selectedEvent = masterEvents.find(
        (ev) => ev.name === formData.eventId,
      );

      let payload = {};
      let endpoint = "";

      if (activeTab === "event") {
        endpoint = "/api/booking";
        payload = {
          eventId: selectedEvent?.id,
          name: fullName,
          phone: userPhone,
          email: profileData.email,
          address: `${formData.addressLine1}, ${formData.addressLine2 ? formData.addressLine2 + ", " : ""}${formData.city}, ${formData.state} ${formData.zip}`,
          date: formData.date?.toISOString().split("T")[0],
          start: formData.time,
          priestId: priest.id,
          userId: userId,
          nakshatram: formData.nakshatram || null,
          note: formData.note,
        };
      } else {
        // MUHURTHAM TAB - Matching MuhurtamRequestDto exactly
        endpoint = "/api/muhurtam/request";
        payload = {
          event: selectedEvent?.id, // MUST be the ID for your EventRepository search in Controller
          name: fullName,
          email: profileData.email,
          phone: userPhone,
          nakshatram: formData.nakshatram || null,
          date: formData.birthDate || null,
          time: formData.birthTime || null,
          place: formData.birthPlace || null,
          note: formData.note || "",
          priestId: priest.id,
          userId: userId,
        };
      }

      const response = await axios.post(`${API_BASE}${endpoint}`, payload);
      toast.success(
        activeTab === "event"
          ? "Booking Request Sent!"
          : "Muhurtham Requested!",
      );
      onClose();
    } catch (err) {
      console.error("Submission error:", err.response?.data);
      const errorMessage = err.response?.data?.error || "Request failed.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="qb-overlay">
        <div className="qb-card fade-in">
          <button className="qb-close" onClick={onClose}>
            <FaTimes />
          </button>
          <div className="qb-auth-view">
            <FaLock
              style={{
                fontSize: "3rem",
                color: "#e65100",
                marginBottom: "15px",
              }}
            />
            <h3>Please login to book an appointment</h3>
            <p>
              If you do not have an account,{" "}
              <span className="qb-link" onClick={() => navigate("/signup")}>
                create one here
              </span>{" "}
              to continue.
            </p>
            <form onSubmit={handleLogin} className="qb-login-form">
              <div className="qb-field">
                <label>
                  <FaUser /> Email Address
                </label>
                <input
                  className="qb-input"
                  type="email"
                  required
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                />
              </div>
              <div className="qb-field">
                <label>
                  <FaLock /> Password
                </label>
                <input
                  className="qb-input"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="qb-submit-btn"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Login & Continue"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="qb-overlay">
      <div className="qb-card">
        <button className="qb-close" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="qb-tabs">
          <button
            className={activeTab === "event" ? "active" : ""}
            onClick={() => setActiveTab("event")}
          >
            <FaBolt /> Event
          </button>
          <button
            className={activeTab === "muhurtam" ? "active" : ""}
            onClick={() => setActiveTab("muhurtam")}
          >
            <FaHistory /> Muhurtham
          </button>
        </div>
        <form className="qb-main-form" onSubmit={handleBooking}>
          {activeTab === "event" ? (
            <div className="fade-in">
              <div className="qb-field">
                <label>Sacred Service</label>
                <select
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                >
                  <option value="">Choose ritual offered by priest...</option>
                  {priest.servicesOffered?.map((s, i) => (
                    <option key={i} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="qb-row">
                <div className="qb-field">
                  <label>
                    <FaCalendarAlt /> Date
                  </label>
                  <DatePicker
                    selected={formData.date}
                    onChange={(d) => setFormData({ ...formData, date: d })}
                    minDate={new Date()}
                    placeholderText="MM/DD/YYYY"
                    className="qb-input"
                  />
                </div>
                <div className="qb-field">
                  <label>
                    <FaClock /> Slot
                  </label>
                  <select
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                  >
                    <option value="">Time</option>
                    {availableTimeSlots.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="qb-field">
                <div className="qb-loc-header">
                  <label>
                    <FaMapMarkerAlt /> Ritual Location
                  </label>
                  <label className="qb-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.useProfileAddress}
                      onChange={handleCheckboxChange}
                    />{" "}
                    Profile Address
                  </label>
                </div>
                <div className="qb-location-box">
                  <input
                    className="qb-input"
                    placeholder="Address Line 1"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine1: e.target.value })
                    }
                  />
                  <input
                    className="qb-input mt-10"
                    placeholder="Address Line 2 (Optional)"
                    value={formData.addressLine2}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine2: e.target.value })
                    }
                  />
                  <div className="qb-row-triple mt-10">
                    <input
                      className="qb-input"
                      placeholder="City"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                    <input
                      className="qb-input"
                      placeholder="State"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                    <input
                      className="qb-input"
                      placeholder="Zip"
                      value={formData.zip}
                      onChange={(e) =>
                        setFormData({ ...formData, zip: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="fade-in">
              <div className="qb-field">
                <label>Occasion</label>
                <select
                  value={formData.eventId}
                  onChange={(e) =>
                    setFormData({ ...formData, eventId: e.target.value })
                  }
                >
                  <option value="">Choose Ritual...</option>
                  {masterEvents.map((ev) => (
                    <option key={ev.id} value={ev.name}>
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="qb-field">
                <label>Nakshatram</label>
                <div className="qb-clearable-input">
                  <select
                    value={formData.nakshatram}
                    onChange={(e) =>
                      setFormData({ ...formData, nakshatram: e.target.value })
                    }
                  >
                    <option value="">Select Nakshatram...</option>
                    {nakshatramList.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  {formData.nakshatram && (
                    <button
                      type="button"
                      className="qb-input-clear-btn"
                      onClick={() =>
                        setFormData({ ...formData, nakshatram: "" })
                      }
                    >
                      <FaEraser />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="qb-helper-link"
                  onClick={() => setShowBirthDetails(!showBirthDetails)}
                >
                  {showBirthDetails
                    ? "Hide Birth Details"
                    : "Don't know? Enter Birth Details"}
                </button>
              </div>
              {showBirthDetails && (
                <div className="qb-birth-box fade-in">
                  <div className="qb-row">
                    <input
                      className="qb-input"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                    />
                    <input
                      className="qb-input"
                      type="time"
                      value={formData.birthTime}
                      onChange={(e) =>
                        setFormData({ ...formData, birthTime: e.target.value })
                      }
                    />
                  </div>
                  <input
                    className="qb-input mt-10"
                    placeholder="Place of Birth"
                    value={formData.birthPlace}
                    onChange={(e) =>
                      setFormData({ ...formData, birthPlace: e.target.value })
                    }
                  />
                </div>
              )}
              <div className="qb-field">
                <label>Notes</label>
                <textarea
                  className="qb-input"
                  rows="2"
                  placeholder="Any specific traditions..."
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <div className="qb-footer-actions">
            <button
              type="button"
              className="qb-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="qb-submit-btn" disabled={loading}>
              {loading
                ? "Processing..."
                : activeTab === "event"
                  ? "Confirm Booking"
                  : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickBookModal;
