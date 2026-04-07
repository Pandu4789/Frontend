import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimes, FaInfoCircle } from 'react-icons/fa';
import './BookingModal.css';

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
  const [eventId, setEventId] = useState('');
  const [selectedEventName, setSelectedEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    try {
      const combinedAddress = [customer.addressLine1, customer.city, customer.state, customer.zip].filter(Boolean).join(', ');
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
      toast.error('Booking failed. Please try again.');
    }
  };

  return (
    <div className="bm-overlay">
      <div className={`bm-card ${showConfirmation ? 'bm-confirm-mode' : ''} ${Object.keys(errors).length > 0 ? 'animate-shake' : ''}`}>
        <button className="bm-close" onClick={onClose}><FaTimes /></button>

        {showConfirmation ? (
          <div className="bm-success-view">
            <div className="bm-success-header">
                <div className="bm-icon-circle animate-pop">
                    <FaCheckCircle />
                </div>
                <h2 className="animate-fade-in">Request Sent!</h2>
                <p className="bm-success-tagline">Your ritual is now in the priest's queue.</p>
            </div>

            <div className="bm-receipt-card animate-slide-up">
                <div className="bm-receipt-row">
                    <span>Ritual</span>
                    <strong>{selectedEventName}</strong>
                </div>
                <div className="bm-receipt-row">
                    <span>Priest</span>
                    <strong>{priest.firstName} {priest.lastName}</strong>
                </div>
                <div className="bm-receipt-row">
                    <span>Proposed Time</span>
                    <strong>{appointmentDate?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {selectedStartTime}</strong>
                </div>
            </div>

            <div className="bm-next-steps animate-fade-in">
                <h4>What happens next?</h4>
                <div className="bm-step">
                    <div className="bm-step-number">1</div>
                    <p><strong>{priest.firstName}</strong> will review your address and timing.</p>
                </div>
                <div className="bm-step">
                    <div className="bm-step-number">2</div>
                    <p>You will receive an <strong>Email & SMS</strong> once the booking is confirmed.</p>
                </div>
            </div>

            <div className="bm-success-actions">
                <button onClick={onClose} className="bm-btn-finish">Return to Profile</button>
                <p className="bm-support-text">Need to change something? Contact the priest directly.</p>
            </div>
          </div>
        ) : (
          <div className="bm-split-container">
            <div className="bm-summary-side">
                <div className="bm-priest-mini">
                    <img src={priest.imageUrl || '/placeholder.png'} alt="Priest" />
                    <div className="bm-mini-meta">
                        <h4>{priest.firstName} {priest.lastName}</h4>
                        <span>{priest.city}, {priest.state}</span>
                    </div>
                </div>
                <div className="bm-trust-badges">
                    <div className="bm-trust-item"><FaCheckCircle className="icon-green" /> Verified Professional</div>
                    <div className="bm-trust-item"><FaInfoCircle className="icon-green" /> Secure Booking</div>
                </div>
            </div>

            <div className="bm-form-side">
                <div className="bm-form-header">
                    <h3>Schedule Your Pooja</h3>
                </div>
                
                <div className="bm-field">
                    <label className={errors.eventId ? 'error-label' : ''}><FaInfoCircle /> Choose Ritual</label>
                    <select 
                        className={`bm-input ${errors.eventId ? 'error-border' : ''}`} 
                        value={eventId} 
                        onChange={e => {
                            const val = e.target.value;
                            setEventId(val);
                            setSelectedEventName(events.find(ev => ev.id === parseInt(val))?.name || '');
                            setErrors(prev => ({...prev, eventId: false}));
                        }}
                    >
                        <option value="">Select a Pooja Ritual...</option>
                        {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                    </select>
                </div>

                <div className="bm-field">
                    <label className={errors.date ? 'error-label' : ''}><FaCalendarAlt /> Preferred Date</label>
                    <div className={errors.date ? 'error-border-picker' : ''}>
                        <DatePicker 
                            selected={appointmentDate} 
                            onChange={d => {
                              setAppointmentDate(d); 
                              setErrors(prev => ({...prev, date: false}));
                            }} 
                            minDate={new Date()} 
                            placeholderText="Select Date"
                            className="bm-input"
                        />
                    </div>
                </div>

                {appointmentDate && (
                    <div className="bm-field">
                        <label className={errors.time ? 'error-label' : ''}><FaClock /> Available Slots</label>
                        <div className="bm-time-pills">
                            {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map(slot => (
                                    <button 
                                        key={slot} 
                                        type="button"
                                        className={`bm-pill ${selectedStartTime === slot ? 'active' : ''} ${errors.time ? 'error-pill' : ''}`} 
                                        onClick={() => {
                                          setSelectedStartTime(slot); 
                                          setErrors(prev => ({...prev, time: false}));
                                        }}
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
                    <label className={errors.address || errors.city || errors.zip ? 'error-label' : ''}><FaMapMarkerAlt /> Ritual Location</label>
                    <div className="bm-grid-layout">
                        <input 
                            className={`bm-input ${errors.address ? 'error-border' : ''}`} 
                            placeholder="Street Address" 
                            value={customer.addressLine1 || ''}
                            onChange={e => {
                              setCustomer(prev => ({...prev, addressLine1: e.target.value})); 
                              setErrors(prev => ({...prev, address: false}));
                            }} 
                        />
                        <div className="bm-sub-grid">
                            <input 
                                className={`bm-input ${errors.city ? 'error-border' : ''}`} 
                                placeholder="City" 
                                value={customer.city || ''}
                                onChange={e => {
                                  setCustomer(prev => ({...prev, city: e.target.value})); 
                                  setErrors(prev => ({...prev, city: false}));
                                }} 
                            />
                            <input 
                                className={`bm-input ${errors.zip ? 'error-border' : ''}`} 
                                placeholder="Zip" 
                                value={customer.zip || ''}
                                onChange={e => {
                                  setCustomer(prev => ({...prev, zip: e.target.value})); 
                                  setErrors(prev => ({...prev, zip: false}));
                                }} 
                            />
                        </div>
                    </div>
                </div>

                <footer className="bm-actions">
                    <button className="bm-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="bm-btn-submit" onClick={handleBookNow}>Confirm Booking</button>
                </footer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;