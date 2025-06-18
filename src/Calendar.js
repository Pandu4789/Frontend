import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, format, getMonth, getYear } from 'date-fns';
import { FaRegCalendarAlt, FaRegClock, FaSun, FaMoon, FaRegListAlt, FaRegCalendarCheck } from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const formatTime12Hour = (timeString) => {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return 'N/A';
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function TeluguCalendar() {
  // --- STATE MANAGEMENT ---
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [festivals, setFestivals] = useState([]); // ✅ State for separate festival data
  const [monthlyPanchangam, setMonthlyPanchangam] = useState({}); // For Tithi/moon symbols
  const [dailyTimes, setDailyTimes] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // --- DATA MAPPING & MEMOIZATION ---
  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    appointments.forEach(app => {
      const dateStr = format(new Date(app.date), 'yyyy-MM-dd');
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr).push(app);
    });
    return map;
  }, [appointments]);
  
  // ✅ NEW: Creates a lookup map specifically for festivals
  const festivalsByDate = useMemo(() => {
    const map = new Map();
    festivals.forEach(festival => {
        // Assuming festival.date is "YYYY-MM-DD"
        const dateStr = format(new Date(festival.date + 'T00:00:00'), 'yyyy-MM-dd');
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr).push(festival);
    });
    return map;
  }, [festivals]);


  // ✅ CORRECTED: This now correctly reads from the separate 'festivals' state
  const monthlyFestivals = useMemo(() => {
      return festivals
        .filter(f => {
            const festivalDate = new Date(f.date + 'T00:00:00');
            return getMonth(festivalDate) === getMonth(activeStartDate) && getYear(festivalDate) === getYear(activeStartDate);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [festivals, activeStartDate]);


  // --- DATA FETCHING HOOKS ---

  // 1. Fetches appointments/bookings once on mount
  useEffect(() => {
    const priestId = localStorage.getItem('userId');
    if (priestId) {
      const bookingsUrl = `${API_BASE}/api/booking/priest/${priestId}`;
      const appointmentsUrl = `${API_BASE}/api/appointments/priest/${priestId}`;
      const fetchBookings = fetch(bookingsUrl).then(res => res.ok ? res.json() : []);
      const fetchAppointments = fetch(appointmentsUrl).then(res => res.ok ? res.json() : []);

      Promise.all([fetchBookings, fetchAppointments])
        .then(([bookingsData, appointmentsData]) => {
          const normalizedBookings = bookingsData.map(b => ({ id: `booking-${b.id}`, date: b.date, title: b.eventName || 'Booking', detail: `for ${b.name || 'a devotee'}` }));
          const normalizedAppointments = appointmentsData.map(a => ({ id: `appt-${a.id}`, date: a.start, title: a.eventName || 'Appointment', detail: `with ${a.name}` }));
          setAppointments([...normalizedBookings, ...normalizedAppointments]);
        })
        .catch(() => setAppointments([]));
    }
  }, []);

  // ✅ UPDATED: Fetches BOTH Panchangam and Festival data when the month changes
  useEffect(() => {
    const year = getYear(activeStartDate);
    const month = getMonth(activeStartDate) + 1;
    
    const fetchPanchangam = fetch(`${API_BASE}/api/panchangam/month?year=${year}&month=${month}`).then(res => res.ok ? res.json() : []);
    const fetchFestivals = fetch(`${API_BASE}/api/festivals/month?year=${year}&month=${month}`).then(res => res.ok ? res.json() : []);

    Promise.all([fetchPanchangam, fetchFestivals])
        .then(([panchangamData, festivalData]) => {
            // Process and set Panchangam data for Tithi/moon symbols
            const panchangamMap = panchangamData.reduce((acc, day) => {
                acc[day.date] = day;
                return acc;
            }, {});
            setMonthlyPanchangam(panchangamMap);

            // Set the separate festival data
            setFestivals(festivalData);
        })
        .catch(() => {
            setMonthlyPanchangam({});
            setFestivals([]);
        });
  }, [activeStartDate]);

  // 3. Fetches specific timings for the selected day (for details panel)
  useEffect(() => {
    setIsLoadingDetails(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const fetchDailyTimes = fetch(`${API_BASE}/api/daily-times/by-date/${dateStr}`).then(res => res.ok ? res.json() : null);
    const fetchSunTimes = fetch(`${API_BASE}/api/sun?date=${dateStr}`).then(res => res.ok ? res.json() : null);

    Promise.all([fetchDailyTimes, fetchSunTimes])
      .then(([dailyData, sunData]) => {
        setDailyTimes(dailyData);
        setSunTimes(sunData);
      })
      .finally(() => setIsLoadingDetails(false));
  }, [selectedDate]);


  // --- CALENDAR TILE RENDERING LOGIC ---
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    // Read from separate data sources
    const dayPanchangam = monthlyPanchangam[dateStr];
    const dayFestivals = festivalsByDate.get(dateStr) || [];
    const hasAppointment = appointmentsByDate.has(dateStr);
    
    let moonSymbol = null;
    if (dayPanchangam?.tithi === 'Pournami') moonSymbol = '🌕';
    else if (dayPanchangam?.tithi === 'Amavasya') moonSymbol = '🌑';

    return (
      <div className="tile-content-wrapper">
        <div className="tile-dots-container">
            {hasAppointment && <div className="appointment-dot"></div>}
            {moonSymbol && <span className="moon-symbol">{moonSymbol}</span>}
        </div>
        {dayFestivals.length > 0 && (
            <div className="festival-name-tile">{dayFestivals[0].name}</div>
        )}
      </div>
    );
  };
  
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const classes = [];
    if (isSameDay(date, new Date())) classes.push('today');
    // Read from the separate festival data source
    if (festivalsByDate.has(format(date, 'yyyy-MM-dd'))) {
      classes.push('festival-day');
    }
    return classes.join(' ');
  };
  return (
    <div className="telugu-calendar-page">
      <h1 className="telugu-calendar-title">Panchangam Calendar</h1>
      <div className="page-layout-container">
        <div className="left-sidebar">
          <div className="info-box">
              <h3><FaRegCalendarCheck /> Festivals in {format(activeStartDate, 'MMMM')}</h3>
              <div className="info-box-content">
                  {monthlyFestivals.length > 0 ? (
                      <div className="sidebar-list">
                          {monthlyFestivals.map((f, index) => (
                              <div key={`festival-${index}`} className="sidebar-item">
                                  <div className="sidebar-item-date">
                                    <span>{format(f.date, 'd')}</span>
                                  </div>
                                  <p className="sidebar-item-name">{f.name}</p>
                              </div>
                          ))}
                      </div>
                  ) : <p className="no-events-message">No festivals this month.</p>}
              </div>
          </div>
          <div className="info-box">
            <h3><FaRegListAlt /> Appointments for {format(selectedDate, 'MMM d')}</h3>
            <div className="info-box-content">
              {(appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []).length > 0 ? (
                <div className="sidebar-list">
                  {(appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd'))).map(app => (
                    <div key={app.id} className="sidebar-item appointment-item">
                      <p className="sidebar-item-name">{app.title}</p>
                      <span className="sidebar-item-detail">{app.detail}</span>
                    </div>
                  ))}
                </div>
              ) : <p className="no-events-message">No appointments scheduled.</p>}
            </div>
          </div>
        </div>

        <div className="main-content-area">
          <div className="calendar-wrapper">
            <Calendar
              value={selectedDate}
              onClickDay={setSelectedDate}
              onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
              tileContent={tileContent}
              tileClassName={tileClassName}
              navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
              formatDay={(locale, date) => format(date, 'd')}
              calendarType="gregory"
              locale="en-US"
              next2Label={null}
              prev2Label={null}
            />
          </div>

          <div className="bottom-details-panel">
            <h2 className="panel-title">Details for {format(selectedDate, 'MMMM d, yyyy')}</h2>
            <div className="details-content">
              {isLoadingDetails ? (
                <p className="loading-message">Loading timings...</p>
              ) : (
                <div className="details-timing-grid">
                  <div className="timing-card">
                    <h4 className="timing-card-title"><FaSun /> Sunrise</h4>
                    <p className="timing-card-value">{formatTime12Hour(sunTimes?.sunrise)}</p>
                  </div>
                  <div className="timing-card">
                    <h4 className="timing-card-title"><FaMoon /> Sunset</h4>
                    <p className="timing-card-value">{formatTime12Hour(sunTimes?.sunset)}</p>
                  </div>
                  <div className="timing-card inauspicious">
                    <h4 className="timing-card-title"><FaRegClock /> Rahu Kalam</h4>
                    <p className="timing-card-value">
                      {dailyTimes ? `${formatTime12Hour(dailyTimes.rahukalamStart)} - ${formatTime12Hour(dailyTimes.rahukalamEnd)}` : 'N/A'}
                    </p>
                  </div>
                  <div className="timing-card inauspicious">
                    <h4 className="timing-card-title"><FaRegClock /> Yamagandam</h4>
                    <p className="timing-card-value">
                      {dailyTimes ? `${formatTime12Hour(dailyTimes.yamagandamStart)} - ${formatTime12Hour(dailyTimes.yamagandamEnd)}` : 'N/A'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}