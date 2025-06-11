import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './BookingModal.css';

const BookingModal = ({ priest, customer, setCustomer, onClose }) => {
  const [eventId, setEventId] = useState('');
  const [selectedEventName, setSelectedEventName] = useState('');
  const [events, setEvents] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState(null);
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();
   const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Current date is June 9, 2025. Available dates are in the future.
  const dummyPriestAvailability = {
    '2025-06-10': ['10:00', '11:00', '16:00'],
    '2025-06-11': ['09:00', '12:00', '13:00', '17:00'],
    '2025-06-14': ['10:00', '11:00'],
    '2025-06-15': ['12:00', '13:00', '14:00'],
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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

  useEffect(() => {
    if (appointmentDate) {
      const dateString = appointmentDate.toISOString().split('T')[0];
      const slots = dummyPriestAvailability[dateString] || [];
      setAvailableTimeSlots(slots);
      setSelectedStartTime('');
    } else {
      setAvailableTimeSlots([]);
      setSelectedStartTime('');
    }
  }, [appointmentDate]);

  const handleBookNow = async () => {
    if (!customer.name || !customer.phone || !customer.addressLine1 || !customer.city || !customer.state || !customer.zip) {
      toast.error('Please fill in your Name, Phone, and complete Address details.');
      return;
    }
    if (!eventId) {
      toast.error('Please select an event.');
      return;
    }
    if (!appointmentDate || !selectedStartTime) {
      toast.error('Please select a valid appointment date and time slot.');
      return;
    }
    if (!priest || !priest.id) {
      toast.error('Priest information is missing.');
      return;
    }
     const customerId = localStorage.getItem('userId');
            if (!customerId) {
                toast.error("Could not find customer ID. Please log in again.");
                return;
            }

    try {
      const addressParts = [
        customer.addressLine1,
        customer.addressLine2, 
        customer.city,
        customer.state,
        customer.zip,
      ];

      // This filters out any empty/null parts (like addressLine2) and joins the rest with ", "
      const combinedAddress = addressParts.filter(part => part).join(', ');

      const payload = {
        eventId: eventId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        note: customer.note || '',
        address: combinedAddress,
        date: appointmentDate.toISOString().split('T')[0],
        start: selectedStartTime,
        end: "TBD",
        priestId: priest.id,
        userId: customerId|| null // Assuming customer has an id field
      };
      console.log('Booking payload:', payload);
      await axios.post('http://localhost:8080/api/booking', payload);
      toast.success('Booking request sent successfully!');
      setShowConfirmation(true);
    } catch (error)
    {
      console.error('Failed to send booking request:', error);
      toast.error('Failed to send booking request.');
    }
  };

  const isDateAvailable = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return dummyPriestAvailability[dateString] && dummyPriestAvailability[dateString].length > 0;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {showConfirmation ? (
          <div className="confirmation-box">
  <h3>
    Thank you for booking <strong>{priest?.firstName} {priest?.lastName || 'the priest'}</strong> for the event{' '}
    <strong>{selectedEventName || 'this event'}</strong>.
  </h3>
  <p>
    You will be notified once <strong>{priest?.firstName || 'the priest'}</strong> accepts your request.
  </p>
  <p>
    A confirmation will be sent to your Email at{' '}
    <strong>{customer.email}</strong>.
  </p>
  <p>
    Meanwhile, you can know all about your pooja from the{' '}
    <a href="/pooja-items" className="pooja-link">Pooja Items</a> page.
  </p>
  <button onClick={onClose} className="ok-button">OK</button>
</div>

        ) : (
          <>
            <h2>Book Appointment with {priest?.firstName || 'Priest'}</h2>

            {/* Step 1: Event Selection */}
            <div className="form-section">
              <h3>Select Event</h3>
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
            </div>

            {/* Step 2: Date and Time Selection */}
            <div className="form-section">
    <h3>Select Date & Time</h3>
    <label>
        <span>
            Appointment Date:
        </span>
        <DatePicker
            selected={appointmentDate}
            // MODIFIED: onChange now calls a new function
            onChange={(date) => {
                setAppointmentDate(date);
                setIsDatePickerOpen(false); // This manually closes the calendar
            }}
            filterDate={isDateAvailable}
            dateFormat="yyyy/MM/dd"
            placeholderText="Select an available date"
            minDate={new Date()}
            className="react-datepicker-input"
            // --- NEW PROPS FOR MANUAL CONTROL ---
            open={isDatePickerOpen}
            onSelect={() => setIsDatePickerOpen(false)} 
            onFocus={() => setIsDatePickerOpen(true)}
            onClick={() => setIsDatePickerOpen(true)}
            onClickOutside={() => setIsDatePickerOpen(false)}
        />
    </label>
                {appointmentDate && availableTimeSlots.length > 0 && (
                    <div className="time-slot-selection">
                        <label>Available Time Slots:</label>
                        <div className="time-slot-grid">
                            {availableTimeSlots.map(slot => (
                                <button
                                    key={slot}
                                    className={`time-slot-button ${selectedStartTime === slot ? 'selected' : ''}`}
                                    onClick={() => setSelectedStartTime(slot)}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {appointmentDate && availableTimeSlots.length === 0 && (
                    <p className="no-slots-message">No available slots for the selected date.</p>
                )}
            </div>
            
            {/* Step 3: Address Information Block (Moved Here) */}
            <div className="form-section">
                <h3>Your Address</h3>
                <div className="address-grid">
                    <label>
                        Address Line 1:
                        <input
                            type="text"
                            placeholder="Street Address"
                            value={customer.addressLine1 || ''}
                            onChange={e => setCustomer(prev => ({ ...prev, addressLine1: e.target.value }))}
                        />
                    </label>
                    <label>
                        Address Line 2 (Optional):
                        <input
                            type="text"
                            placeholder="Apartment, suite, etc."
                            value={customer.addressLine2 || ''}
                            onChange={e => setCustomer(prev => ({ ...prev, addressLine2: e.target.value }))}
                        />
                    </label>
                    <label>
                        City:
                        <input
                            type="text"
                            placeholder="e.g., Irving"
                            value={customer.city || ''}
                            onChange={e => setCustomer(prev => ({ ...prev, city: e.target.value }))}
                        />
                    </label>
                    <label>
                        State:
                        <input
                            type="text"
                            placeholder="e.g., Texas"
                            value={customer.state || ''}
                            onChange={e => setCustomer(prev => ({ ...prev, state: e.target.value }))}
                        />
                    </label>
                    <label>
                        Zip Code:
                        <input
                            type="text"
                            placeholder="e.g., 75038"
                            value={customer.zip || ''}
                            onChange={e => setCustomer(prev => ({ ...prev, zip: e.target.value }))}
                        />
                    </label>
                </div>
            </div>

            {/* Step 4: Note Field */}
            <div className="form-section">
              <h3>Additional Information</h3>
              <label>
                Note:
                <textarea
                  placeholder="Optional note for the priest"
                  value={customer.note || ''}
                  onChange={e => setCustomer(prev => ({ ...prev, note: e.target.value }))}
                  rows="3"
                />
              </label>
            </div>

            <div className="modal-actions">
              <button onClick={handleBookNow}>Book Now</button>
              <button onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BookingModal;