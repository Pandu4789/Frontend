import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import isSameDay from 'date-fns/isSameDay';
import isSameMonth from 'date-fns/isSameMonth';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import AppointmentModal from './AppointmentModal';

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
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [options, setOptions] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    event: '', name: '', phone: '', date: new Date(), timeFrom: '', timeTo: '', address: ''
  });
  const [errorPopup, setErrorPopup] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        const names = data.map(n => n.name);
        setOptions(names);
      })
      .catch(err => console.error("Failed to load events", err));
  }, []);

  const loadAppointments = async () => {
    const priestId = localStorage.getItem("userId");
    if (!priestId) {
      console.error("Priest ID not found in local storage.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/appointments/priest/${priestId}`);
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

  const closeModal = () => {
    setShowModal(false);
    setErrorPopup('');
  };

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
      setErrorPopup('Please select both "From" and "To" times.');
      return;
    }

    const start = toISO(formData.date, formData.timeFrom);
    const end = toISO(formData.date, formData.timeTo);
    const now = new Date();

    if (start < now) {
      setErrorPopup('Cannot create appointments in the past.');
      return;
    }

    if (start >= end) {
      setErrorPopup('Start time must be earlier than end time.');
      return;
    }

    if (hasConflict(start, end)) {
      setErrorPopup('Cannot select this time. Appointment already exists.');
      return;
    }

    const payload = {
      ...formData,
      start,
      end,
      title: formData.name,
      priestId: localStorage.getItem("userId")
    };

    try {
      const priestId = localStorage.getItem("userId");
      if (!priestId) {
        setErrorPopup("Priest ID not found. Please log in again.");
        return;
      }

      const url = editId
        ? `${API_BASE}/api/appointments/${editId}`
        : `${API_BASE}/api/appointments/priest/${priestId}`;

      await fetch(url, {
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
      await fetch(`${API_BASE}/api/appointments/${editId}`, { method: 'DELETE' });
      await loadAppointments();
      closeModal();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const customDayPropGetter = date => {
    const now = new Date();
    if (isSameDay(date, now) && isSameMonth(date, now)) {
      return { style: { backgroundColor: '#eaeaea' } };
    }
    return {};
  };

  const now = new Date();
  const isToday = isSameDay(formData.date, now);
  const filteredTimeOptions = useMemo(() => timeOptions.filter(t => {
    if (!isToday) return true;
    const timeDate = toISO(now, t);
    return timeDate > now;
  }), [formData.date]);

  const fromIndex = filteredTimeOptions.indexOf(formData.timeFrom);
  const toTimeOptions = fromIndex >= 0 ? filteredTimeOptions.slice(fromIndex + 1) : filteredTimeOptions;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20 }}>
        <h2>Calendar</h2>
        <button
          onClick={openAdd}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          + Add Appointment
        </button>
      </div>

      {errorPopup && (
        <div style={{
          backgroundColor: '#f8d7da',
          color: '#721c24',
          padding: '10px 20px',
          margin: '10px 20px',
          borderRadius: 4,
          border: '1px solid #f5c6cb'
        }}>
          {errorPopup}
        </div>
      )}

      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600, margin: '0 20px' }}
        onSelectEvent={openEdit}
        views={['month', 'week', 'day']}
        date={viewDate}
        onNavigate={setViewDate}
        onView={setViewMode}
        dayPropGetter={customDayPropGetter}
      />

      <AppointmentModal
        showModal={showModal}
        editId={editId}
        formData={formData}
        handleFormChange={handleFormChange}
        handleDateChange={handleDateChange}
        handleSubmit={handleSubmit}
        handleDelete={handleDelete}
        closeModal={closeModal}
        options={options}
        filteredTimeOptions={filteredTimeOptions}
        toTimeOptions={toTimeOptions}
      />
    </>
  );
}
