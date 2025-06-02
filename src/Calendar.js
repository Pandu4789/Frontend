import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';
import { isSameDay, format } from 'date-fns';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";
const formatTime = (timeStr, selectedDate) => {
  if (!timeStr) return '—';
  try {
    const dateStr = selectedDate.toISOString().split('T')[0]; // "2025-06-02"
    const fullDateTime = new Date(`${dateStr}T${timeStr}`);
    return format(fullDateTime, 'hh:mm a');
  } catch {
    return timeStr;
  }
};


const moonPhases = [
  { date: '2025-01-29', type: 'Pournami' },
  { date: '2025-02-13', type: 'Amavasya' },
  { date: '2025-02-27', type: 'Pournami' },
  { date: '2025-03-14', type: 'Amavasya' },
  { date: '2025-03-29', type: 'Pournami' },
  { date: '2025-04-12', type: 'Amavasya' },
  { date: '2025-04-27', type: 'Pournami' },
  { date: '2025-05-11', type: 'Amavasya' },
  { date: '2025-05-26', type: 'Pournami' },
  { date: '2025-06-10', type: 'Amavasya' },
  { date: '2025-06-24', type: 'Pournami' },
  { date: '2025-07-10', type: 'Amavasya' },
  { date: '2025-07-24', type: 'Pournami' },
  { date: '2025-08-08', type: 'Amavasya' },
  { date: '2025-08-22', type: 'Pournami' },
  { date: '2025-09-06', type: 'Amavasya' },
  { date: '2025-09-20', type: 'Pournami' },
  { date: '2025-10-05', type: 'Amavasya' },
  { date: '2025-10-19', type: 'Pournami' },
  { date: '2025-11-03', type: 'Amavasya' },
  { date: '2025-11-17', type: 'Pournami' },
  { date: '2025-12-02', type: 'Amavasya' },
  { date: '2025-12-16', type: 'Pournami' },
];

export default function TeluguCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [dailyTimes, setDailyTimes] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/appointments/priest/${localStorage.getItem('userId')}`)
      .then(res => res.json())
      .then(setAppointments)
      .catch(console.error);

    fetch(`${API_BASE}/api/festivals`)
      .then(res => res.json())
      .then(setFestivals)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedDate) return setDailyTimes([]);
    const dateStr = selectedDate.toISOString().slice(0, 10);
    fetch(`${API_BASE}/api/daily-times/by-date/${dateStr}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => setDailyTimes(data ? [data] : []))
      .catch(() => setDailyTimes([]));
  }, [selectedDate]);

  const getMoonPhaseSymbol = (date) => {
    const entry = moonPhases.find(mp => isSameDay(new Date(mp.date), date));
    return entry?.type === 'Amavasya' ? '🌑' : entry?.type === 'Pournami' ? '🌕' : '';
  };

  const getAppointments = (date) => appointments.filter(a => isSameDay(new Date(a.start), date));

  // Filter festivals by activeStartDate's month & year (visible calendar month)
  const filteredFestivals = festivals.filter(festival => {
    const festDate = new Date(festival.date);
    return (
      festDate.getMonth() === activeStartDate.getMonth() &&
      festDate.getFullYear() === activeStartDate.getFullYear()
    );
  });

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const moon = getMoonPhaseSymbol(date);

    return (
      <div className="tile-content">
        <div className="date-number">{date.getDate()}</div>
        <div className="moon-symbol">{moon}</div>
      </div>
    );
  };

  // Highlight today and selected date with custom classes
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';

    const today = new Date();
    if (isSameDay(date, selectedDate)) return 'selected-date';
    if (isSameDay(date, today)) return 'today-date';

    return '';
  };

  return (
    <div className="telugu-calendar">
      <h2 className="calendar-title">Calendar</h2>
      <div className="calendar-layout">

        {/* LEFT: Festivals */}
        <div className="festival-list">
          <h3>Festivals</h3>
          {filteredFestivals.length === 0 ? (
            <p>No Festivals</p>
          ) : (
            <ul>
              {filteredFestivals
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .map(f => (
                  <li key={f.id}>
                    <b>{format(new Date(f.date), 'd')}</b> - {f.name}
                  </li>
                ))}
            </ul>
          )}
        </div>

        {/* CENTER: Calendar */}
        <Calendar
          onClickDay={setSelectedDate}
          value={selectedDate}
          tileContent={tileContent}
          tileClassName={tileClassName}
          calendarType="gregory"
          locale="en-US"
          onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
        />

        {/* RIGHT: Appointments + Daily Times */}
        <div className="right-panel">
          <div className="appointment-box">
  <h3>Appointments</h3>
  {selectedDate ? (
    getAppointments(selectedDate).length > 0 ? (
      <ul>
        {getAppointments(selectedDate).map(a => (
         <li key={a.id} style={{ marginBottom: '12px' }}>
  <strong>{a.event}</strong><br />
  <b>Name:</b> {a.name}<br />
  <b>Phone:</b> {a.phone}<br />
  <b>Time:</b> {format(new Date(a.start), 'hh:mm a')} - {format(new Date(a.end), 'hh:mm a')}
</li>


        ))}
      </ul>
    ) : (
      <p>No Appointments</p> // ✅ Outside <ul> logic but same style
    )
  ) : (
    <ul><li>Select Date</li></ul> // ✅ Consistent structure
  )}
</div>


          <div className="daily-times-box">
            <h3>Daily Times</h3>
            {selectedDate && dailyTimes.length > 0 ? (
              dailyTimes.map((dt, idx) => (
                <ul key={idx}>
                  <li><b>Yamagandam:</b> {formatTime(dt.yamagandamStart, selectedDate)} - {formatTime(dt.yamagandamEnd, selectedDate)}</li>

                  <li><b>Rahukalam:</b> {formatTime(dt.rahukalamStart, selectedDate)} - {formatTime(dt.rahukalamEnd, selectedDate)}</li>
<li><b>Varjam:</b> {formatTime(dt.varjamStart, selectedDate)} - {formatTime(dt.varjamEnd, selectedDate)}</li>
<li><b>Durmohurtam:</b> {formatTime(dt.durmohurtamStart, selectedDate)} - {formatTime(dt.durmohurtamEnd, selectedDate)}</li>

                </ul>
              ))
            ) : (
              <p>{selectedDate ? 'No Data' : 'Select Date'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
