import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheckCircle, 
    FaTimes, FaInfoCircle, FaUserCircle, FaStar 
} from 'react-icons/fa';
import './BookingModal.css';

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
  const [eventId, setEventId] = useState('');
  const [selectedEventName, setSelectedEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/events');
        setEvents(res.data);
      } catch (error) { toast.error('Failed to load rituals.'); }
    };
    fetchEvents();
  }, []);

  // RESTORED: Fetch Availability logic
  useEffect(() => {
    if (appointmentDate && priest?.id) {
      const formattedDate = appointmentDate.toISOString().split('T')[0];
      axios.get(`http://localhost:8080/api/availability/priest/${priest.id}/date/${formattedDate}`)
        .then(res => setAvailableTimeSlots(res.data || []))
        .catch(() => setAvailableTimeSlots([]));
    }
  }, [appointmentDate, priest]);

  const handleBookNow = async () => {
    setIsSubmitting(true);
    try {
      const combinedAddress = `${customer.addressLine1}, ${customer.city}, ${customer.zip}`;
      const payload = {
        eventId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: combinedAddress,
        date: appointmentDate.toISOString().split('T')[0],
        start: selectedStartTime,
        priestId: priest.id,
        userId: localStorage.getItem('userId')
      };
      await axios.post('http://localhost:8080/api/booking', payload);
      setShowConfirmation(true);
    } catch (error) { toast.error('Booking failed.'); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="bm-overlay">
      <div className="bm-card">
        <button className="bm-close" onClick={onClose}><FaTimes /></button>

        {showConfirmation ? (
          <div className="bm-success-view">
             <FaCheckCircle className="bm-icon-circle-success" />
             <h2>Booking Request Sent!</h2>
             <button onClick={onClose} className="bm-btn-finish">Close</button>
          </div>
        ) : (
          <div className="bm-split-container">
            {/* LEFT SIDE: MATCHED TO HOROSCOPE MODAL */}
            <div className="bm-summary-side">
              <div className="bm-priest-mini">
                <div className="bm-priest-img-container">
                  {priest.imageUrl ? (
                    <img src={priest.imageUrl} alt="Priest" />
                  ) : (
                    <FaUserCircle className="bm-user-placeholder" />
                  )}
                </div>
                <div className="bm-mini-meta">
                  <h4>{priest.firstName} {priest.lastName}</h4>
                  <span>Verified Vedic Expert</span>
                </div>
              </div>
              
              <div className="bm-trust-badges">
                <div className="bm-trust-item">
                  <FaCheckCircle className="icon-green" /> Authenticated Professional
                </div>
                <div className="bm-trust-item">
                  <FaStar className="icon-green" /> Sacred Ritual Service
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="bm-form-side">
              <header className="bm-form-header">
                <h3>Schedule Your Pooja</h3>
              </header>

              <div className="bm-field">
                <label><FaInfoCircle /> Select Ritual</label>
                <select className="bm-input" value={eventId} onChange={e => setEventId(e.target.value)}>
                  <option value="">Choose Ritual...</option>
                  {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                </select>
              </div>

              <div className="bm-field">
                <label><FaCalendarAlt /> Preferred Date</label>
                <DatePicker selected={appointmentDate} onChange={d => setAppointmentDate(d)} className="bm-input" placeholderText="Select Date" />
              </div>

              {/* RESTORED: Time Slots Grid */}
              {appointmentDate && (
                <div className="bm-field">
                  <label><FaClock /> Available Slots</label>
                  <div className="bm-time-pills">
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map(slot => (
                        <button 
                          key={slot} 
                          type="button"
                          className={`bm-pill ${selectedStartTime === slot ? 'active' : ''}`}
                          onClick={() => setSelectedStartTime(slot)}
                        >
                          {slot}
                        </button>
                      ))
                    ) : (
                      <p className="bm-no-slots">No slots available for this date.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bm-field">
                <label><FaMapMarkerAlt /> Ritual Location</label>
                <div className="bm-grid-layout">
                    <input className="bm-input" placeholder="Street Address" value={customer.addressLine1 || ''} onChange={e => setCustomer({...customer, addressLine1: e.target.value})} />
                    <div className="bm-sub-grid">
                        <input className="bm-input" placeholder="City" value={customer.city || ''} onChange={e => setCustomer({...customer, city: e.target.value})} />
                        <input className="bm-input" placeholder="Zip" value={customer.zip || ''} onChange={e => setCustomer({...customer, zip: e.target.value})} />
                    </div>
                </div>
              </div>

              <footer className="bm-actions">
                <button className="bm-btn-cancel" onClick={onClose}>Cancel</button>
                <button className="bm-btn-submit" onClick={handleBookNow} disabled={isSubmitting}>Confirm Booking</button>
              </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;