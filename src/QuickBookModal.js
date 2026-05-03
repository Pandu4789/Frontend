import React from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaBolt } from "react-icons/fa";
import "./QuickBookModal.css";

const QuickBookModal = ({ priest, onClose }) => {
  return (
    <div className="qb-modal-overlay">
      <div className="qb-modal-content">
        <button className="qb-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="qb-header">
          <FaBolt className="qb-bolt" />
          <h3>Quick Booking</h3>
          <p>Book {priest.firstName} for an urgent service</p>
        </div>

        <div className="qb-body">
          <div className="qb-input-group">
            <label>Select Service</label>
            <select>
              {priest.servicesOffered?.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="qb-row">
            <div className="qb-input-group">
              <label>
                <FaCalendarAlt /> Date
              </label>
              <input type="date" />
            </div>
            <div className="qb-input-group">
              <label>
                <FaClock /> Time
              </label>
              <input type="time" />
            </div>
          </div>

          <button className="qb-submit-btn">Confirm Booking</button>
        </div>
      </div>
    </div>
  );
};

export default QuickBookModal;
