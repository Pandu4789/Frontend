import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimes,
  FaInfoCircle,
  FaUserCircle,
  FaStar,
} from "react-icons/fa";
import "./BookingModal.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
  const [eventId, setEventId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [masterEvents, setMasterEvents] = useState([]);

  const offeredServices = priest.services || [];

  useEffect(() => {
    axios
      .get(`${API_BASE}/api/events`)
      .then((res) => setMasterEvents(res.data))
      .catch((err) => console.error("Could not fetch events list", err));
  }, []);

  useEffect(() => {
    if (appointmentDate && priest?.id) {
      setSelectedStartTime("");
      setAvailableTimeSlots([]);

      const formattedDate = appointmentDate.toISOString().split("T")[0];
      axios
        .get(
          `${API_BASE}/api/availability/priest/${priest.id}/date/${formattedDate}`,
        )
        .then((res) => setAvailableTimeSlots(res.data || []))
        .catch(() => setAvailableTimeSlots([]));
    } else {
      setAvailableTimeSlots([]);
      setSelectedStartTime("");
    }
  }, [appointmentDate, priest]);

  const validateForm = () => {
    const newErrors = {};
    if (!eventId) newErrors.eventId = true;
    if (!appointmentDate) newErrors.date = true;
    if (!selectedStartTime) newErrors.time = true;
    if (!customer.addressLine1) newErrors.address = true;
    if (!customer.city) newErrors.city = true;
    if (!customer.zip) newErrors.zip = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBookNow = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const selectedEventObj = masterEvents.find((e) => e.name === eventId);

    if (!selectedEventObj) {
      toast.error("Invalid ritual selected. Please try again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const combinedAddress = `${customer.addressLine1}, ${customer.city}, ${customer.zip}`;
      const payload = {
        eventId: selectedEventObj.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: combinedAddress,
        date: appointmentDate.toISOString().split("T")[0],
        start: selectedStartTime,
        priestId: priest.id,
        userId: localStorage.getItem("userId"),
      };
      await axios.post(`${API_BASE}/api/booking`, payload);
      setShowConfirmation(true);
    } catch (error) {
      toast.error("Booking failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bm-overlay">
      <div
        className={`bm-card ${Object.keys(errors).length > 0 ? "animate-shake" : ""}`}
      >
        <button className="bm-close" onClick={onClose}>
          <FaTimes />
        </button>

        {showConfirmation ? (
          <div className="bm-success-view">
            <FaCheckCircle className="bm-icon-circle-success" />
            <h2>Booking Request Sent!</h2>
            <p>
              Your request has been forwarded to {priest.firstName} for
              confirmation.
            </p>
            <button onClick={onClose} className="bm-btn-finish">
              Close
            </button>
          </div>
        ) : (
          <div className="bm-split-container">
            <div className="bm-summary-side">
              <div className="bm-priest-mini">
                <div className="bm-priest-img-container">
                  {priest.imageUrl || priest.profilePicture ? (
                    <img
                      src={priest.imageUrl || priest.profilePicture}
                      alt="Priest"
                    />
                  ) : (
                    <FaUserCircle className="bm-user-placeholder" />
                  )}
                </div>
                <div className="bm-mini-meta">
                  <h4>
                    {priest.firstName} {priest.lastName}
                  </h4>
                  <span>Verified Vedic Expert</span>
                </div>
              </div>
              <div className="bm-trust-badges">
                <div className="bm-trust-item">
                  <FaCheckCircle className="icon-green" /> Authenticated
                  Professional
                </div>
                <div className="bm-trust-item">
                  <FaStar className="icon-green" /> {offeredServices.length}{" "}
                  Rituals Offered
                </div>
              </div>
            </div>

            <div className="bm-form-side">
              <header className="bm-form-header">
                <h3>Schedule Your Pooja</h3>
              </header>
              <div className="bm-field">
                <label className={errors.eventId ? "error-label" : ""}>
                  <FaInfoCircle /> Select Ritual
                </label>
                <select
                  className={`bm-input ${errors.eventId ? "error-border" : ""}`}
                  value={eventId}
                  onChange={(e) => {
                    setEventId(e.target.value);
                    setErrors({ ...errors, eventId: false });
                  }}
                >
                  <option value="">Choose Ritual...</option>
                  {offeredServices.map((service, index) => (
                    <option key={index} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bm-field">
                <label className={errors.date ? "error-label" : ""}>
                  <FaCalendarAlt /> Preferred Date
                </label>
                <div className={errors.date ? "error-border" : ""}>
                  <DatePicker
                    selected={appointmentDate}
                    onChange={(d) => {
                      setAppointmentDate(d);
                      setErrors({ ...errors, date: false });
                    }}
                    className="bm-input"
                    placeholderText="Select Date"
                    minDate={new Date()} // 👈 This line restricts past dates
                  />
                </div>
              </div>

              {appointmentDate && (
                <div className="bm-field">
                  <label className={errors.time ? "error-label" : ""}>
                    <FaClock /> Available Slots
                  </label>
                  <div className="bm-time-pills">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          className={`bm-pill ${selectedStartTime === slot ? "active" : ""} ${errors.time ? "error-pill" : ""}`}
                          onClick={() => {
                            setSelectedStartTime(slot);
                            setErrors({ ...errors, time: false });
                          }}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="bm-no-slots">
                        No slots available for this date.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="bm-field">
                <label
                  className={
                    errors.address || errors.city || errors.zip
                      ? "error-label"
                      : ""
                  }
                >
                  <FaMapMarkerAlt /> Ritual Location
                </label>
                <div className="bm-grid-layout">
                  <input
                    className={`bm-input ${errors.address ? "error-border" : ""}`}
                    placeholder="Street Address"
                    value={customer.addressLine1 || ""}
                    onChange={(e) => {
                      setCustomer({
                        ...customer,
                        addressLine1: e.target.value,
                      });
                      setErrors({ ...errors, address: false });
                    }}
                  />
                  <div className="bm-sub-grid">
                    <input
                      className={`bm-input ${errors.city ? "error-border" : ""}`}
                      placeholder="City"
                      value={customer.city || ""}
                      onChange={(e) => {
                        setCustomer({ ...customer, city: e.target.value });
                        setErrors({ ...errors, city: false });
                      }}
                    />
                    <input
                      className={`bm-input ${errors.zip ? "error-border" : ""}`}
                      placeholder="Zip"
                      value={customer.zip || ""}
                      onChange={(e) => {
                        setCustomer({ ...customer, zip: e.target.value });
                        setErrors({ ...errors, zip: false });
                      }}
                    />
                  </div>
                </div>
              </div>

              <footer className="bm-actions">
                <button className="bm-btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="bm-btn-submit"
                  onClick={handleBookNow}
                  disabled={isSubmitting}
                >
                  Confirm Booking
                </button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
