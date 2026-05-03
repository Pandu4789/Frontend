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
  const [availableSlots, setAvailableSlots] = useState([]);
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
      const email = localStorage.getItem("userEmail");
      axios.get(`${API_BASE}/api/auth/profile?email=${email}`).then((res) => {
        setProfileData(res.data);
        if (formData.useProfileAddress) syncAddress(res.data);
      });
    }
  }, [isLoggedIn]);

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
        .then((res) => setAvailableSlots(res.data || []));
    }
  }, [formData.date, priest.id]);

  const handleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        eventId: masterEvents.find((ev) => ev.name === formData.eventId)?.id,
        address: `${formData.addressLine1}, ${formData.addressLine2}, ${formData.city}, ${formData.state} ${formData.zip}`,
        date: formData.date?.toISOString().split("T")[0],
        start: formData.time,
        priestId: priest.id,
        userId: localStorage.getItem("userId"),
        nakshatram: formData.nakshatram,
        note: formData.note,
      };
      await axios.post(`${API_BASE}/api/booking`, payload);
      toast.success("Booking Request Sent!");
      onClose();
    } catch (err) {
      toast.error("Booking failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="qb-overlay">
      <div className="qb-card qb-dark">
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
                    {availableSlots.map((s) => (
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
                <div className="qb-glass-box">
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
                <div className="qb-glass-box qb-birth-accent fade-in">
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
                  rows="2"
                  placeholder="Any specific traditions or requirements..."
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
