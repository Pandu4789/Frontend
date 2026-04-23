import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, addHours } from "date-fns";
import "./AppointmentModal.css";
import { FaTimes } from "react-icons/fa";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const AppointmentModal = ({ priest, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
    eventId: "",
    date: null,
  });

  const [selectedTime, setSelectedTime] = useState("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [events, setEvents] = useState([]);
  const [errors, setErrors] = useState([]); // Track which fields should shake
  const modalRef = useRef();

  useEffect(() => {
    if (formData.date && priest?.id) {
      const dateString = format(formData.date, "yyyy-MM-dd");
      const fetchSlots = async () => {
        setAvailableTimeSlots([]);
        setSelectedTime("");
        try {
          const response = await axios.get(
            buildApiUrl(API_ENDPOINTS.AVAILABILITY.GET(priest.id, dateString)),
          );
          setAvailableTimeSlots(response.data || []);
        } catch (error) {
          toast.error("Could not fetch time slots.");
        }
      };
      fetchSlots();
    }
  }, [formData.date, priest]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          buildApiUrl(API_ENDPOINTS.EVENTS.GET_ALL),
        );
        setEvents(response.data);
      } catch (error) {
        toast.error("Failed to load event types.");
      }
    };
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Remove error highlight when user starts typing
    setErrors((prev) => prev.filter((err) => err !== name));
  };

  const validateForm = () => {
    const newErrors = [];
    if (!formData.eventId) newErrors.push("eventId");
    if (!formData.date) newErrors.push("date");
    if (!selectedTime) newErrors.push("time");
    if (!formData.name) newErrors.push("name");
    if (!formData.phone) newErrors.push("phone");
    if (!formData.address) newErrors.push("address");

    setErrors(newErrors);

    if (newErrors.length > 0) {
      // Clear errors after animation plays (0.5s)
      setTimeout(() => setErrors([]), 500);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const priestId = localStorage.getItem("userId");
    const startTimeObject = parse(selectedTime, "HH:mm", new Date());
    const endTimeString = format(addHours(startTimeObject, 1), "HH:mm");

    const payload = {
      ...formData,
      date: format(formData.date, "yyyy-MM-dd"),
      start: selectedTime,
      end: endTimeString,
      priestId: parseInt(priestId),
    };

    try {
      await axios.post(
        buildApiUrl(API_ENDPOINTS.APPOINTMENTS.GET_BY_PRIEST(priestId)),
        payload,
      );
      toast.success("Appointment created successfully!");
      onSave(payload);
      onClose();
    } catch (error) {
      toast.error("Failed to create appointment.");
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>Book Appointment</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="appointment-form">
          <div className="form-section">
            <h3>Select Event</h3>
            <div className="form-group">
              <select
                name="eventId"
                value={formData.eventId}
                onChange={handleChange}
                className={errors.includes("eventId") ? "error-shaking" : ""}
              >
                <option value="">-- Select Event --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-section">
            <h3>Date & Time</h3>
            <div className="form-group">
              <div className={errors.includes("date") ? "error-shaking" : ""}>
                <DatePicker
                  selected={formData.date}
                  onChange={(date) => {
                    setFormData((prev) => ({ ...prev, date }));
                    setErrors((prev) => prev.filter((err) => err !== "date"));
                  }}
                  dateFormat="MMMM d, yyyy"
                  minDate={new Date()}
                  placeholderText="Select date"
                  className="datepicker-input"
                />
              </div>
            </div>

            <div
              className={`time-slot-grid ${errors.includes("time") ? "error-shaking" : ""}`}
            >
              {availableTimeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  className={`time-slot-button ${selectedTime === slot ? "selected" : ""}`}
                  onClick={() => {
                    setSelectedTime(slot);
                    setErrors((prev) => prev.filter((err) => err !== "time"));
                  }}
                >
                  {format(parse(slot, "HH:mm", new Date()), "h:mm a")}
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h3>Customer Details</h3>
            <div className="form-grid">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className={errors.includes("name") ? "error-shaking" : ""}
              />
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className={errors.includes("phone") ? "error-shaking" : ""}
              />
            </div>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Full Address"
              className={errors.includes("address") ? "error-shaking" : ""}
              rows="2"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;
