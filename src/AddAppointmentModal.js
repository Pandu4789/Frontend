import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const inputStyle = {
  width: '100%',
  padding: 8,
  fontSize: 16,
  marginTop: 4,
  marginBottom: 10,
  borderRadius: 4,
  border: '1px solid #ccc',
  boxSizing: 'border-box',
};

const btnStyle = {
  padding: '8px 16px',
  fontSize: 16,
  borderRadius: 4,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#007bff',
  color: '#fff',
};

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1400,
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: 20,
  borderRadius: 8,
  maxWidth: 450,
  width: '100%',
  boxSizing: 'border-box',
  maxHeight: '90vh',
  overflowY: 'auto',
};

export default function AddAppointmentModal({
  show,
  onClose,
  onSave,
  onDelete,
  options = [],
  initialData = null,
  error,
  setError,
}) {
  const [formData, setFormData] = useState({
    event: '',
    name: '',
    phone: '',
    date: new Date(),
    timeFrom: '',
    timeTo: '',
    address: '',
  });

  useEffect(() => {
    if (initialData) {
      // Convert date string to Date object if needed
      setFormData({
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : new Date(),
      });
    } else {
      setFormData({
        event: '',
        name: '',
        phone: '',
        date: new Date(),
        timeFrom: '',
        timeTo: '',
        address: '',
      });
    }
  }, [initialData, show]);

  if (!show) return null;

  const timeOptions = [
    '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM', '08:30 AM',
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
    '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM',
    '09:00 PM', '09:30 PM', '10:00 PM', '10:30 PM', '11:00 PM',
  ];

  // Filter time options if date is today to exclude past times
  const now = new Date();
  const isToday = formData.date.toDateString() === now.toDateString();
  const filteredTimeOptions = timeOptions.filter(t => {
    if (!isToday) return true;
    const [h, m, ampm] = t.match(/(\d{2}):(\d{2}) (\w{2})/).slice(1);
    let hour = parseInt(h, 10);
    if (ampm.toLowerCase() === 'pm' && hour !== 12) hour += 12;
    if (ampm.toLowerCase() === 'am' && hour === 12) hour = 0;
    return hour > now.getHours() || (hour === now.getHours() && parseInt(m, 10) > now.getMinutes());
  });

  function handleChange(e) {
    const { name, value } = e.target;

    // Allow only digits for phone input
    if (name === 'phone') {
      if (/^\d{0,10}$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleDateChange(date) {
    setFormData(prev => ({ ...prev, date }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    // Basic validation
    if (!formData.event) {
      setError('Please select an event');
      return;
    }
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (formData.phone.length !== 10) {
      setError('Phone must be 10 digits');
      return;
    }
    if (!formData.timeFrom || !formData.timeTo) {
      setError('Please select time from and time to');
      return;
    }
    if (formData.timeFrom === formData.timeTo) {
      setError('Time From and Time To cannot be the same');
      return;
    }
    if (formData.date < new Date().setHours(0, 0, 0, 0)) {
      setError('Date cannot be in the past');
      return;
    }

    setError('');
    onSave(formData);
  }

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        <h2>{initialData ? 'Edit Appointment' : 'Add Appointment'}</h2>
        {error && (
          <div style={{ color: 'red', marginBottom: 10 }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <label>
            Event
            <select
              name="event"
              value={formData.event}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select event</option>
              {options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          </label>

          <label>
            Name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={inputStyle}
              type="text"
              placeholder="Enter your name"
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              required
              style={inputStyle}
              type="tel"
              placeholder="Enter 10-digit phone"
            />
          </label>

          <label>
            Date
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
              required
              style={{ width: '100%' }}
            />
          </label>

          <label>
            Time From
            <select
              name="timeFrom"
              value={formData.timeFrom}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select time</option>
              {filteredTimeOptions.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Time To
            <select
              name="timeTo"
              value={formData.timeTo}
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Select time</option>
              {filteredTimeOptions.map((t, i) => (
                <option key={i} value={t}>{t}</option>
              ))}
            </select>
          </label>

          <label>
            Address
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              style={{ ...inputStyle, resize: 'vertical' }}
              placeholder="Enter address"
            />
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
            {initialData && (
              <button
                type="button"
                onClick={() => onDelete && onDelete()}
                style={{ ...btnStyle, backgroundColor: '#dc3545', marginRight: 10 }}
              >
                Delete
              </button>
            )}
            <button type="submit" style={btnStyle}>
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ ...btnStyle, backgroundColor: '#6c757d', marginLeft: 10 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
