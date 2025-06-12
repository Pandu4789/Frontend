// Filename: AppointmentModal.js
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, parse, addHours } from 'date-fns';
import './AppointmentModal.css';
import { FaTimes } from 'react-icons/fa';

const API_BASE = "http://localhost:8080";

const AppointmentModal = ({ priest, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        note: '',
        eventId: '', // store the event ID here
        date: null,
    });

    const [selectedTime, setSelectedTime] = useState('');
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
        const [isLoadingSlots, setIsLoadingSlots] = useState(false);

    const [events, setEvents] = useState([]);
    const modalRef = useRef();

   useEffect(() => {
        if (formData.date && priest?.id) {
            const dateString = format(formData.date, 'yyyy-MM-dd');
            const fetchSlots = async () => {
                setIsLoadingSlots(true);
                setAvailableTimeSlots([]);
                setSelectedTime('');
                try {
                    const response = await axios.get(`${API_BASE}/api/availability/priest/${priest.id}/date/${dateString}`);
                    setAvailableTimeSlots(response.data || []);
                } catch (error) {
                    toast.error("Could not fetch time slots for this date.");
                } finally {
                    setIsLoadingSlots(false);
                }
            };
            fetchSlots();
        } else {
            setAvailableTimeSlots([]);
        }
    }, [formData.date, priest]);


    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get(`${API_BASE}/api/events`);
                setEvents(response.data);
            } catch (error) {
                toast.error("Failed to load event types.");
            }
        };
        fetchEvents();
    }, []);


    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
            onClose();
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({ ...prev, date: date }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const priestId = localStorage.getItem('userId');
        if (!priestId) {
            toast.error("Priest ID not found.");
            return;
        }

        if (!formData.date || !selectedTime) {
            toast.error("Please select a date and time for the appointment.");
            return;
        }

        const selectedEvent = events.find(event => event.id === parseInt(formData.eventId));
        const eventName = selectedEvent ? selectedEvent.name : '';

        if (!eventName) {
            toast.error("Please select a valid event.");
            return;
        }
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
       const startDateTime = `${formattedDate}T${selectedTime}`;
        const startTimeObject = parse(selectedTime, 'HH:mm', new Date());
        const endTimeString = format(addHours(startTimeObject, 1), 'HH:mm');
     const endDateTime = `${formattedDate}T${endTimeString}`;


        const payload = {
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            note: formData.note,
            eventId: formData.eventId, // actual string name
            date: format(formData.date, 'yyyy-MM-dd'),
            start: selectedTime,
            end: endTimeString,
            priestId: parseInt(priestId)
        };

        console.log("Sending appointment payload:", payload);

        try {
            await axios.post(`${API_BASE}/api/appointments/priest/${priestId}`, payload);
            toast.success("Appointment created successfully!");
            onSave(payload);
            onClose();
        } catch (error) {
            toast.error("Failed to create appointment.");
            console.error("Create appointment error:", error);
        }
    };

    return (
        <div className="modal-overlay" onMouseDown={handleClickOutside}>
            <div className="modal-content" ref={modalRef}>
                <div className="modal-header">
                    <h2>Book Appointment with {priest?.firstName || 'Priest'}</h2>
                    <button className="close-button" onClick={onClose}><FaTimes /></button>
                </div>

                <form onSubmit={handleSubmit} className="appointment-form">
                    {/* Event Selection */}
                    <div className="form-section">
                        <h3>Select Event</h3>
                        <div className="form-group">
                            <label>Event Name:</label>
                            <select name="eventId" value={formData.eventId} onChange={handleChange} required>
                                <option value="">-- Select Event --</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id}>{event.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date & Time Selection */}
                    <div className="form-section">
                        <h3>Select Date & Time</h3>
                        <div className="form-group">
                            <label>Appointment Date:</label>
                            <DatePicker
                                selected={formData.date}
                                onChange={handleDateChange}
                                dateFormat="MMMM d, yyyy"
                                minDate={new Date()}
                                placeholderText="Select an available date"
                                className="datepicker-input"
                            />
                        </div>

                        {formData.date && (
                            <div className="time-slot-selection">
                                {availableTimeSlots.length > 0 ? (
                                    <>
                                        <label>Available Time Slots:</label>
                                        <div className="time-slot-grid">
                                            {availableTimeSlots.map(slot => (
                                                <button
                                                    type="button"
                                                    key={slot}
                                                    className={`time-slot-button ${selectedTime === slot ? 'selected' : ''}`}
                                                    onClick={() => setSelectedTime(slot)}
                                                >
                                                    {format(parse(slot, 'HH:mm', new Date()), 'h:mm a')}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <p className="no-slots-message">No available slots for this date.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="form-section">
                        <h3>Customer Details</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Customer Full Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" required />
                            </div>
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Phone Number" required />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Full Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter Full Address" required rows="3" />
                        </div>
                        <div className="form-group">
                            <label>Additional Notes (optional)</label>
                            <textarea name="note" value={formData.note} onChange={handleChange} placeholder="Any special requests or details..." rows="3" />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
                        <button type="submit" className="save-button">Save Appointment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AppointmentModal;