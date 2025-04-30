// src/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const generateTimeSlots = () => {
  const slots = [];
  const dt = new Date();
  dt.setHours(0, 0, 0, 0);
  for (let i = 0; i < 48; i++) {
    slots.push(format(new Date(dt.getTime() + i * 30 * 60000), 'hh:mm a'));
  }
  return slots;
};
const timeOptions = generateTimeSlots();

function Calendar() {
  const [events, setEvents] = useState([]);
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    event: '', name: '', phone: '', date: new Date(), timeFrom: '', timeTo: '', address: ''
  });
  const [errorPopup, setErrorPopup] = useState('');

  useEffect(() => {
    fetch("http://localhost:8080/api/events")
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        const names = data.map(n => n.name);
        setOptions(names);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to load events", err);
        setIsLoading(false);
      });
  }, []);

  const loadAppointments = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/appointments");
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setEvents(data.map(a => ({
        ...a,
        start: new Date(a.start),
        end: new Date(a.end),
        title: a.name,
      })));
    } catch (err) {
      console.error('Failed to load appointments:', err);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setFormData({ event: '', name: '', phone: '', date: new Date(), timeFrom: '', timeTo: '', address: '' });
    setShowModal(true);
  };

  const openEdit = appt => {
    setEditId(appt.id);
    setFormData({
      event: appt.event,
      name: appt.name,
      phone: appt.phone,
      date: new Date(appt.start),
      timeFrom: format(new Date(appt.start), 'hh:mm a'),
      timeTo: format(new Date(appt.end), 'hh:mm a'),
      address: appt.address,
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const handleFormChange = e => {
    const { name, value } = e.target;
    if (name === 'phone' && /\D/.test(value)) return;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleDateChange = date => setFormData(fd => ({ ...fd, date }));

  const toISO = (date, time) => {
    if (!time) return null;
    const [timePart, ampm] = time.split(' ');
    const [h, m] = timePart.split(':').map(Number);
    const hour = ampm?.toLowerCase() === 'pm' ? (h % 12) + 12 : h % 12;
    const dt = new Date(date);
    dt.setHours(hour, m, 0, 0);
    return dt;
  };

  const hasConflict = (start, end) => {
    return events.some(event => {
      const existingStart = new Date(event.start);
      const existingEnd = new Date(event.end);
      return (start < existingEnd && end > existingStart && event.id !== editId);
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.timeFrom || !formData.timeTo) {
      alert('Please select both "From" and "To" times.');
      return;
    }

    const start = toISO(formData.date, formData.timeFrom);
    const end = toISO(formData.date, formData.timeTo);
    const now = new Date();

    if (start < now) {
      setErrorPopup('Cannot create appointments in the past. Please select a valid future date and time.');
      return;
    }

    if (hasConflict(start, end)) {
      setErrorPopup('Cannot select this time. Appointment already exists. Please select a different time.');
      return;
    }

    const payload = {
      ...formData,
      start,
      end,
      title: formData.name
    };

    try {
      await fetch(`http://localhost:8080/api/appointments${editId ? `/${editId}` : ''}`, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadAppointments();
      closeModal();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!editId) return;
    try {
      await fetch(`http://localhost:8080/api/appointments/${editId}`, { method: 'DELETE' });
      await loadAppointments();
      closeModal();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const navigateDate = offset => {
    const newDate = new Date(viewDate);
    newDate.setDate(newDate.getDate() + offset);
    setViewDate(newDate);
  };

  const customDayPropGetter = date => {
    const now = new Date();
    if (isSameDay(date, now) && isSameMonth(date, now)) {
      return { style: { backgroundColor: '#eaeaea' } };
    }
    return {};
  };

  const getPeriodLabel = () => {
    if (viewMode === 'day') {
      return format(viewDate, 'EEEE, MMMM d, yyyy');
    } else if (viewMode === 'week') {
      const start = startOfWeek(viewDate, { weekStartsOn: 1 });
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      const sameMonth = start.getMonth() === end.getMonth();
      return `${format(start, 'MMM d')}${sameMonth ? '' : format(start, ' MMM')} - ${format(end, 'MMM d, yyyy')}`;
    } else {
      return format(viewDate, 'MMMM yyyy');
    }
  };

  const now = new Date();
  const isToday = isSameDay(formData.date, now);
  const filteredTimeOptions = timeOptions.filter(t => {
    if (!isToday) return true;
    const timeDate = toISO(now, t);
    return timeDate > now;
  });

  const fromIndex = filteredTimeOptions.indexOf(formData.timeFrom);
  const toTimeOptions = fromIndex >= 0 ? filteredTimeOptions.slice(fromIndex + 1) : filteredTimeOptions;

  return (
    <div style={{ padding: 20 }}>
      <h2>Calendar</h2>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setViewDate(new Date())}>Today</button>
          <button onClick={() => navigateDate(viewMode === 'month' ? -30 : viewMode === 'week' ? -7 : -1)}><FaChevronLeft /></button>
          <span style={{ fontSize: '1.1em', fontWeight: 'bold', minWidth: 180, textAlign: 'center' }}>{getPeriodLabel()}</span>
          <button onClick={() => navigateDate(viewMode === 'month' ? 30 : viewMode === 'week' ? 7 : 1)}><FaChevronRight /></button>
        </div>

        <div style={{ display: 'flex', border: '1px solid #ccc', borderRadius: 6, overflow: 'hidden', backgroundColor: '#f5f5f5' }}>
          {['day', 'week', 'month'].map((mode, index) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === mode ? '#007bff' : 'transparent',
                color: viewMode === mode ? '#fff' : '#333',
                border: 'none',
                borderRight: index < 2 ? '1px solid #ccc' : 'none',
                cursor: 'pointer'
              }}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={openAdd} style={{ marginBottom: 10 }}>Add New Appointment</button>

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={viewDate}
        view={viewMode}
        onNavigate={setViewDate}
        onView={setViewMode}
        toolbar={false}
        style={{ height: '80vh' }}
        onSelectEvent={openEdit}
        dayPropGetter={customDayPropGetter}
      />

      {showModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginBottom: 20 }}>{editId ? 'Edit' : 'Add'} Appointment</h3>
            <form onSubmit={handleSubmit}>
              {['event', 'name', 'phone', 'address'].map(field => (
                <div key={field} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}:
                  </label>
                  {field === 'event' ? (
                    <select name="event" value={formData.event} onChange={handleFormChange} required style={inputStyle}>
                      <option value="">Select event</option>
                      {options.map((name, i) => (
                        <option key={i} value={name}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <input name={field} value={formData[field]} onChange={handleFormChange} required style={inputStyle} />
                  )}
                </div>
              ))}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Date:</label>
                <DatePicker
                  selected={formData.date}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  minDate={new Date()}
                  style={inputStyle}
                />
              </div>
              {['timeFrom', 'timeTo'].map(timeField => (
                <div key={timeField} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                    {timeField === 'timeFrom' ? 'From' : 'To'}:
                  </label>
                  <select
                    name={timeField}
                    value={formData[timeField]}
                    onChange={handleFormChange}
                    required
                    style={inputStyle}
                  >
                    <option value="">{timeField === 'timeFrom' ? 'From' : 'To'}</option>
                    {(timeField === 'timeFrom' ? filteredTimeOptions : toTimeOptions).map((t, i) => (
                      <option key={i} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div style={{ marginTop: 20 }}>
                <button type="submit" style={btnStyle}>Save</button>
                {editId && <button type="button" onClick={handleDelete} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>}
                <button type="button" onClick={closeModal} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {errorPopup && (
        <div style={modalStyle}>
          <div style={{ ...modalContentStyle, maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ marginBottom: 20 }}>{errorPopup}</p>
            <button onClick={() => setErrorPopup('')} style={btnStyle}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#ffffff',
  padding: '24px 30px',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '480px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  fontFamily: 'Arial, sans-serif'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const btnStyle = {
  padding: '8px 16px',
  marginRight: 10,
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

export default Calendar;

