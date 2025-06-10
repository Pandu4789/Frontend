// Filename: TeluguCalendar.js - REBUILT with the Correct Final Layout
import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, format } from 'date-fns';
import { panchangamData } from './panchang';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// --- Main Calendar Page Component ---
export default function TeluguCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);

  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    if (Array.isArray(appointments)) {
      appointments.forEach(app => {
        if (app.date) {
          const dateStr = format(new Date(app.date), 'yyyy-MM-dd');
          if (!map.has(dateStr)) map.set(dateStr, []);
          map.get(dateStr).push(app);
        }
      });
    }
    return map;
  }, [appointments]);

  useEffect(() => {
    const priestId = localStorage.getItem('userId');
    if (priestId) {
        fetch(`${API_BASE}/api/booking/priest/${priestId}`)
          .then(res => res.json())
          .then(data => Array.isArray(data) ? setAppointments(data) : setAppointments([]))
          .catch(() => setAppointments([]));
    }
  }, []);

  const monthlyFestivals = useMemo(() => {
    const festivals = [];
    Object.entries(panchangamData).forEach(([dateStr, data]) => {
      const date = new Date(dateStr + 'T00:00:00');
      if (data.festivals.length > 0 && date.getMonth() === activeStartDate.getMonth() && date.getFullYear() === activeStartDate.getFullYear()) {
        data.festivals.forEach(f => {
          festivals.push({ date: date, name: f });
        });
      }
    });
    return festivals.sort((a, b) => a.date - b.date);
  }, [activeStartDate]);

  // --- Tile Content & ClassName (Unchanged) ---
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPanchangam = panchangamData[dateStr];
    const hasAppointment = appointmentsByDate.has(dateStr);
    let moonSymbol = null;
    if (dayPanchangam?.tithi === 'Pournami') moonSymbol = '🌕';
    else if (dayPanchangam?.tithi === 'Amavasya') moonSymbol = '🌑';
    return ( <> <span className="date-number">{date.getDate()}</span> {moonSymbol && <span className="moon-symbol">{moonSymbol}</span>} {hasAppointment && <div className="appointment-dot"></div>} </> );
  };
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayPanchangam = panchangamData[dateStr];
    const classes = [];
    if (dayPanchangam?.festivals?.length > 0) classes.push('festival-day');
    if (isSameDay(date, new Date())) classes.push('today');
    if (date.getMonth() !== activeStartDate.getMonth()) classes.push('other-month');
    return classes.join(' ');
  };

  return (
    <div className="telugu-calendar-page">
      <h1 className="telugu-calendar-title">Panchangam Calendar</h1>
      <div className="page-layout-container">

        {/* --- Left Sidebar --- */}
        <div className="left-sidebar">
            <div className="info-box">
                <h3>Festivals in {format(activeStartDate, 'MMMM')}</h3>
                <div className="info-box-content">
                    {monthlyFestivals.length > 0 ? (
                        <ul> {monthlyFestivals.map(f => ( <li key={f.name + f.date}> <strong>{format(f.date, 'd')}:</strong> {f.name} </li> ))} </ul>
                    ) : <p>No festivals this month.</p>}
                </div>
            </div>
            <div className="info-box">
                <h3>Appointments for {format(selectedDate, 'MMM d')}</h3>
                 <div className="info-box-content">
                    {(appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []).length > 0 ? (
                        <ul> {(appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd'))).map(app => ( <li key={app.id}><strong>{app.poojaType}</strong> for {app.customerName}</li> ))} </ul>
                    ) : <p>No appointments scheduled.</p>}
                </div>
            </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="main-content-area">
            <div className="calendar-wrapper">
                <Calendar
                    value={selectedDate}
                    onClickDay={setSelectedDate}
                    onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                    tileContent={tileContent}
                    tileClassName={tileClassName}
                    calendarType="gregory"
                    locale="en-US"
                />
            </div>
            <div className="bottom-details-panel">
                <h2 className="panel-title">Details for {format(selectedDate, 'MMMM d, yyyy')}</h2>
                <div className="details-grid">
                    {(panchangamData[format(selectedDate, 'yyyy-MM-dd')]) ? (
                        <>
                            <div className="details-column">
                                <h4>Panchangam</h4>
                                <p><strong>Tithi:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].tithi}</p>
                                <p><strong>Nakshatram:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].nakshatram}</p>
                                <p><strong>Masam:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].masam}</p>
                                <p><strong>Paksham:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].paksham}</p>
                            </div>
                            <div className="details-column">
                                <h4>Timings</h4>
                                <p><strong>Sunrise:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].sunrise}</p>
                                <p><strong>Sunset:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].sunset}</p>
                                <p><strong>Rahukalam:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].rahukalam}</p>
                                <p><strong>Yamagandam:</strong> {panchangamData[format(selectedDate, 'yyyy-MM-dd')].yamagandam}</p>
                            </div>
                        </>
                    ) : <p className="no-data-message">No Panchangam data for this day.</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}