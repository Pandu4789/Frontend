import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheckCircle, 
    FaTimes, FaInfoCircle, FaHandsHelping, FaHistory 
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
      } catch (error) {
        toast.error('Failed to load rituals.');
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (appointmentDate && priest?.id) {
      const formattedDate = appointmentDate.toISOString().split('T')[0];
      axios.get(`http://localhost:8080/api/availability/priest/${priest.id}/date/${formattedDate}`)
        .then(res => setAvailableTimeSlots(res.data || []))
        .catch(() => setAvailableTimeSlots([]));
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
      toast.error('Please fill in all highlighted fields.');
      return;
    }
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
    } catch (error) {
      toast.error('Booking request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bm-overlay">
      <div className={`bm-card ${Object.keys(errors).length > 0 ? 'animate-shake' : ''}`}>
        <button className="bm-close" onClick={onClose} aria-label="Close"><FaTimes /></button>

        {showConfirmation ? (
          <div className="bm-success-view">
            <FaCheckCircle className="bm-icon-circle-success" />
            <h2>Request Sent!</h2>
            <div className="bm-receipt-card">
                <div className="bm-receipt-row"><span>Ritual</span><strong>{selectedEventName}</strong></div>
                <div className="bm-receipt-row"><span>Priest</span><strong>{priest.firstName} {priest.lastName}</strong></div>
            </div>
            <button onClick={onClose} className="bm-btn-finish">Close</button>
          </div>
        ) : (
          <div className="bm-split-container">
            <aside className="bm-sidebar-branding">
                <div className="bm-priest-box">
                    <div className="bm-priest-img-container">
                        <img src={priest.imageUrl || '/placeholder.png'} alt="Priest" className="bm-priest-img" />
                    </div>
                    <div className="bm-priest-text">
                        <h4>{priest.firstName} {priest.lastName}</h4>
                        <p><FaMapMarkerAlt /> {priest.city}, {priest.state}</p>
                    </div>
                </div>
                <div className="bm-trust-badges">
                    <div className="bm-trust-item"><FaHandsHelping /> Verified Expert</div>
                    <div className="bm-trust-item"><FaCheckCircle /> Secure Booking</div>
                </div>
            </aside>

            <main className="bm-form-area">
                <header className="bm-form-header">
                    <h3>Schedule Your Pooja</h3>
                    <p>Complete the details for your sacred ritual.</p>
                </header>
                
                <div className="bm-field">
                    <label className={errors.eventId ? 'error-label' : ''}>Sacred Ritual</label>
                    <select 
                        className={`bm-input ${errors.eventId ? 'error-border' : ''}`} 
                        value={eventId} 
                        onChange={e => {
                            setEventId(e.target.value);
                            setSelectedEventName(events.find(ev => ev.id === parseInt(e.target.value))?.name || '');
                            setErrors(prev => ({...prev, eventId: false}));
                        }}
                    >
                        <option value="">Select a Pooja Ritual...</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                </div>

                <div className="bm-field">
                    <label className={errors.date ? 'error-label' : ''}>Preferred Date</label>
                    <div className={errors.date ? 'error-border' : ''}>
                        <DatePicker 
                            selected={appointmentDate} 
                            onChange={d => { setAppointmentDate(d); setErrors(prev => ({...prev, date: false})); }} 
                            minDate={new Date()} 
                            placeholderText="Select Date"
                            className="bm-input"
                        />
                    </div>
                </div>

                {appointmentDate && (
                    <div className="bm-field">
                        <label className={errors.time ? 'error-label' : ''}>Available Start Times</label>
                        <div className="bm-time-pills">
                            {availableTimeSlots.map(slot => (
                                <button 
                                    key={slot} 
                                    type="button"
                                    className={`bm-pill ${selectedStartTime === slot ? 'active' : ''} ${errors.time ? 'error-pill' : ''}`} 
                                    onClick={() => { setSelectedStartTime(slot); setErrors(prev => ({...prev, time: false})); }}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bm-field">
                    <label className={errors.address || errors.city || errors.zip ? 'error-label' : ''}>Ritual Location</label>
                    <div className="bm-grid-layout">
                        <input 
                            className={`bm-input ${errors.address ? 'error-border' : ''}`} 
                            placeholder="Street Address" 
                            value={customer.addressLine1 || ''}
                            onChange={e => { setCustomer(prev => ({...prev, addressLine1: e.target.value})); setErrors(prev => ({...prev, address: false})); }} 
                        />
                        <div className="bm-sub-grid">
                            <input 
                                className={`bm-input ${errors.city ? 'error-border' : ''}`} 
                                placeholder="City" 
                                value={customer.city || ''}
                                onChange={e => { setCustomer(prev => ({...prev, city: e.target.value})); setErrors(prev => ({...prev, city: false})); }} 
                            />
                            <input 
                                className={`bm-input ${errors.zip ? 'error-border' : ''}`} 
                                placeholder="Zip" 
                                value={customer.zip || ''}
                                onChange={e => { setCustomer(prev => ({...prev, zip: e.target.value})); setErrors(prev => ({...prev, zip: false})); }} 
                            />
                        </div>
                    </div>
                </div>

                <footer className="bm-actions">
                    <button type="button" className="bm-btn-cancel" onClick={onClose}>Cancel</button>
                    <button type="button" className="bm-btn-submit" onClick={handleBookNow} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Confirm Request'}
                    </button>
                </footer>
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;