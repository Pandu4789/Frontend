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
  const [festivals, setFestivals] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // null means no date selected => hide appointments list
  const [formData, setFormData] = useState({
    event: '', name: '', phone: '', date: new Date(), timeFrom: '', timeTo: '', address: ''
  });
  const [errorPopup, setErrorPopup] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/api/events`)
      .then(res => res.json())
      .then(data => {
        const names = data.map(n => n.name);
        setOptions(names);
      })
      .catch(err => console.error("Failed to load events", err));

    fetch(`${API_BASE}/api/festivals`)
      .then(res => res.json())
      .then(setFestivals)
      .catch(err => console.error("Failed to load festivals", err));
  }, []);

  const loadAppointments = async () => {
    const priestId = localStorage.getItem("userId");
    if (!priestId) return;
    try {
      const res = await fetch(`${API_BASE}/api/appointments/priest/${priestId}`);
      const data = await res.json();
      setAppointments(data);
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
    if (!formData.timeFrom || !formData.timeTo) return setErrorPopup('Please select both "From" and "To" times.');

    const start = toISO(formData.date, formData.timeFrom);
    const end = toISO(formData.date, formData.timeTo);
    const now = new Date();

    if (start < now) return setErrorPopup('Cannot create appointments in the past.');
    if (start >= end) return setErrorPopup('Start time must be earlier than end time.');
    if (hasConflict(start, end)) return setErrorPopup('Time conflict with another appointment.');

    const payload = {
      ...formData,
      start,
      end,
      title: formData.name,
      priestId: localStorage.getItem("userId")
    };

    try {
      const url = editId
        ? `${API_BASE}/api/appointments/${editId}`
        : `${API_BASE}/api/appointments/priest/${payload.priestId}`;

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
    await fetch(`${API_BASE}/api/appointments/${editId}`, { method: 'DELETE' });
    await loadAppointments();
    closeModal();
  };

  const customDayPropGetter = date => {
    const hasAppointment = appointments.some(a => isSameDay(new Date(a.start), date));
    const hasFestival = festivals.some(f => isSameDay(new Date(f.date), date));
    const today = new Date();
    const isToday = isSameDay(date, today);

    let style = {};

    if (hasAppointment && hasFestival) {
      style.background = 'linear-gradient(135deg, rgb(212, 239, 212) 50%, rgb(217, 231, 248) 50%)';
    } else if (hasAppointment) {
      style.backgroundColor = 'rgb(217, 231, 248)';
    } else if (hasFestival) {
      style.backgroundColor = 'rgb(212, 239, 212)';
    }

    if (isToday) {
      style.border = '2px solid #ff5722';
      style.borderRadius = '4px';
    }

    return { style };
  };

  // Filter festivals only for the current month/year shown in calendar
  const festivalsInMonth = festivals.filter(f => {
    if (!f.date) return false;
    const festDate = new Date(f.date);
    return festDate.getMonth() === viewDate.getMonth() && festDate.getFullYear() === viewDate.getFullYear();
  });

  const now = new Date();
  const isToday = selectedDate ? isSameDay(selectedDate, now) : false;
  const filteredTimeOptions = useMemo(() => timeOptions.filter(t => {
    if (!isToday) return true;
    return toISO(now, t) > now;
  }), [selectedDate]);

  const fromIndex = filteredTimeOptions.indexOf(formData.timeFrom);
  const toTimeOptions = fromIndex >= 0 ? filteredTimeOptions.slice(fromIndex + 1) : filteredTimeOptions;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Calendar</h2>
        <button
          onClick={openAdd}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          + Add Appointment
        </button>
      </div>

      {errorPopup && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '10px 20px',
            margin: '10px 0',
            borderRadius: 4,
          }}
        >
          {errorPopup}
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 3 }}>
          <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={openEdit}
            views={{ month: true }}  // only allow month view, no other views
            view="month"
            date={viewDate}
            onNavigate={setViewDate}
            // no onView because we fix view to month
            dayPropGetter={customDayPropGetter}
            onSelectSlot={slotInfo => setSelectedDate(slotInfo.start)}
            selectable
            eventPropGetter={() => ({
              style: { display: 'none' }
            })}
            toolbar={true}
            components={{
              toolbar: (props) => {
                // Custom toolbar to hide view selector except month
                return (
                  <div className="rbc-toolbar" style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                    <div className="rbc-btn-group">
                      <button type="button" onClick={() => props.onNavigate('PREV')}>
                        &#8249;
                      </button>
                      <button type="button" onClick={() => props.onNavigate('TODAY')}>
                        Today
                      </button>
                      <button type="button" onClick={() => props.onNavigate('NEXT')}>
                        &#8250;
                      </button>
                    </div>
                    <span className="rbc-toolbar-label" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {format(props.date, 'MMMM yyyy')}
                    </span>
                    {/* Hide view selectors completely */}
                    <div style={{ visibility: 'hidden' }}>
                      {/* Empty placeholder so layout doesn't shift */}
                      <button>Month</button>
                    </div>
                  </div>
                );
              },
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            maxWidth: '250px',
            padding: '1rem',
            height: 600,
            overflowY: 'auto',
          }}
        >
          <h3>Festivals:</h3>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.2rem', margin: 0 }}>
            {festivalsInMonth.map(f => {
              const festDate = new Date(f.date);
              return (
                <li key={f.id}>
                  {festDate.getDate()} - {f.name}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Show appointment list only when a date is selected */}
      {selectedDate && (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
          <h3>Appointments on {format(selectedDate, 'MMMM do, yyyy')}</h3>
          <ul>
            {appointments
              .filter(a => isSameDay(new Date(a.start), selectedDate))
              .map(a => (
                <li key={a.id}>
                  <strong>{a.name}</strong> | {format(new Date(a.start), 'hh:mm a')} - {format(new Date(a.end), 'hh:mm a')} | Event: {a.event}
                </li>
              ))}
          </ul>
        </div>
      )}

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
    </div>
  );
}
