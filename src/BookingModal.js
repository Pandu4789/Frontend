import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PriestProfile.css';

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
    const [eventName, setEventName] = useState('');
    const [appointmentDate, setAppointmentDate] = useState(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    const handleBookNow = async () => {
        if (!customer || !customer.name || !customer.phone || !customer.address) {
            toast.error('Please fill in all customer details.');
            return;
        }

        if (!appointmentDate || !startTime || !endTime) {
            toast.error('Please provide a valid appointment date and time.');
            return;
        }

        try {
            const payload = {
                event: eventName,
                name: customer.name,
                phone: customer.phone,
                address: customer.address,
                note: customer.note,
                date: appointmentDate ? appointmentDate.toISOString().split('T')[0] : null,
                start: startTime,
                end: endTime
            };

            await axios.post('http://localhost:8080/api/booking', payload);
            toast.success('Booking request sent!');
            onClose();
        } catch (error) {
            console.error('Failed to send booking request:', error);
            toast.error('Failed to send booking request.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Choose Your Appointment Date</h2>

                <label>
                    Event Name:
                    <input
                        type="text"
                        placeholder="Event Name"
                        value={eventName}
                        onChange={e => setEventName(e.target.value)}
                    />
                </label>

                <label>
                    Name:
                    <input
                        type="text"
                        placeholder="Name"
                        value={customer.name || ''}
                        onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
                    />
                </label>

                <label>
                    Phone:
                    <input
                        type="tel"
                        placeholder="Phone"
                        value={customer.phone || ''}
                        onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))}
                    />
                </label>

                <label>
                    Address:
                    <input
                        type="text"
                        placeholder="Address"
                        value={customer.address || ''}
                        onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))}
                    />
                </label>

                <label>
                    Appointment Date:
                    <input
                        type="date"
                        value={appointmentDate ? appointmentDate.toISOString().split('T')[0] : ''}
                        onChange={e => {
                            const value = e.target.value;
                            if (value) {
                                setAppointmentDate(new Date(value));
                            } else {
                                setAppointmentDate(null);
                            }
                        }}
                    />
                </label>

                <label>
                    Start Time:
                    <input
                        type="time"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                </label>

                <label>
                    End Time:
                    <input
                        type="time"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                    />
                </label>

                <label>
                    Note:
                    <input
                        type="text"
                        placeholder="Note"
                        value={customer.note || ''}
                        onChange={e => setCustomer(prev => ({ ...prev, note: e.target.value }))}
                    />
                </label>

                <div className="modal-actions">
                    <button onClick={handleBookNow}>Book Now</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
