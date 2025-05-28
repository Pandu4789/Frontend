import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PriestProfile.css';

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
  const [eventId, setEventId] = useState('');
  const [selectedEventName, setSelectedEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events list.');
      }
    };
    fetchEvents();
  }, []);

  const handleBookNow = async () => {
    if (!customer || !customer.name || !customer.phone || !customer.address) {
      toast.error('Please fill in all customer details.');
      return;
    }

    if (!appointmentDate || !startTime || !endTime) {
      toast.error('Please provide a valid appointment date and time.');
      return;
    }

    if (!priest || !priest.id) {
      toast.error('Priest information is missing.');
      return;
    }

    if (!eventId) {
      toast.error('Please select an event.');
      return;
    }

    try {
      const payload = {
        eventId: eventId,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        note: customer.note || '',
        date: appointmentDate.toISOString().split('T')[0],
        start: startTime,
        end: endTime,
        priestId: priest.id
      };
      console.log('Booking payload:', payload);
      await axios.post('http://localhost:8080/api/booking', payload);
      toast.success('Booking request sent successfully!');
      setShowConfirmation(true);
    } catch (error) {
      console.error('Failed to send booking request:', error);
      toast.error('Failed to send booking request.');
    }
  };

  return (
  <div className="modal-overlay">
    <div className="modal-content">
      {showConfirmation ? (
        // ✅ Confirmation Message
        <div className="confirmation-box">
          <h3>
            Thank you for booking <strong>{priest?.firstName} {priest?.lastName || 'the priest'} </strong>for the event{' '}
            <strong>{selectedEventName || 'this event'}</strong>.
          </h3>
          <p>
            You will be notified once <strong>{priest?.firstName || 'the priest'}</strong> accepts your
            request.
          </p>
          <p>
            Meanwhile, you can check the list of required{' '}
            <span
              className="pooja-link"
              onClick={() => {
                navigate(`/pooja-items`);
                onClose(); // close modal after navigation
              }}
              style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            >
              pooja items for {selectedEventName}
            </span>.
          </p>
          <button onClick={onClose} className="ok-button">OK</button>
        </div>
      ) : (
        // ✅ Booking Form
        <>
          <h2>Book Appointment with {priest?.username || 'Priest'}</h2>

          <label>
            Event Name:
            <select
              value={eventId}
              onChange={e => {
                const selectedId = e.target.value;
                setEventId(selectedId);
                const selectedEvent = events.find(event => event.id === parseInt(selectedId));
                setSelectedEventName(selectedEvent ? selectedEvent.name : '');
              }}
            >
              <option value="">-- Select Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Name:
            <input
              type="text"
              placeholder="Your Name"
              value={customer.name || ''}
              onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))}
            />
          </label>

          <label>
            Phone:
            <input
              type="tel"
              placeholder="Phone Number"
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
              onChange={e => setAppointmentDate(e.target.value ? new Date(e.target.value) : null)}
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
              placeholder="Optional Note"
              value={customer.note || ''}
              onChange={e => setCustomer(prev => ({ ...prev, note: e.target.value }))}
            />
          </label>

          <div className="modal-actions">
            <button onClick={handleBookNow}>Book Now</button>
            <button onClick={onClose} className="cancel-button">Cancel</button>
          </div>
        </>
      )}
    </div>
  </div>
);
}

export default BookingModal;
