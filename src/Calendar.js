import React, { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, format, getMonth, getYear, startOfMonth ,parseISO} from 'date-fns';
import { 
    FaRegCalendarAlt, FaRegClock, FaSun, FaMoon, 
    FaRegListAlt, FaRegCalendarCheck, FaHandsHelping, FaArrowRight 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const formatTime12Hour = (timeString) => {
  if (!timeString) return 'N/A';
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

export default function TeluguCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeStartDate, setActiveStartDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [monthlyPanchangam, setMonthlyPanchangam] = useState({});
  const [dailyTimes, setDailyTimes] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  const priestId = localStorage.getItem('userId');

  const handleJumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setActiveStartDate(startOfMonth(today));
  };

  // Memoized lookups
  const appointmentsByDate = useMemo(() => {
    const map = new Map();
    appointments.forEach(app => {
      const dateStr = format(new Date(app.date), 'yyyy-MM-dd');
      if (!map.has(dateStr)) map.set(dateStr, []);
      map.get(dateStr).push(app);
    });
    return map;
  }, [appointments]);

  const festivalsByDate = useMemo(() => {
    const map = new Map();
    festivals.forEach(f => {
        const dateStr = format(new Date(f.date + 'T00:00:00'), 'yyyy-MM-dd');
        if (!map.has(dateStr)) map.set(dateStr, []);
        map.get(dateStr).push(f);
    });
    return map;
  }, [festivals]);

  const monthlyFestivals = useMemo(() => {
      return festivals
        .filter(f => {
            const festivalDate = new Date(f.date + 'T00:00:00');
            return getMonth(festivalDate) === getMonth(activeStartDate) && getYear(festivalDate) === getYear(activeStartDate);
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [festivals, activeStartDate]);

  // Initial Fetch
  useEffect(() => {
    if (priestId) {
      const bookingsUrl = `${API_BASE}/api/booking/priest/${priestId}`;
      const appointmentsUrl = `${API_BASE}/api/appointments/priest/${priestId}`;
      Promise.all([
        fetch(bookingsUrl).then(res => res.ok ? res.json() : []),
        fetch(appointmentsUrl).then(res => res.ok ? res.json() : [])
      ]).then(([bookings, appts]) => {
          const normBookings = bookings.map(b => ({ id: `b-${b.id}`, date: b.date, title: b.eventName, detail: `for ${b.name}` }));
          const normAppts = appts.map(a => ({ id: `a-${a.id}`, date: a.start, title: a.eventName, detail: `with ${a.name}` }));
          setAppointments([...normBookings, ...normAppts]);
      });
    }
  }, [priestId]);

  // Monthly Fetch
  useEffect(() => {
    const year = getYear(activeStartDate);
    const month = getMonth(activeStartDate) + 1;
    Promise.all([
        fetch(`${API_BASE}/api/panchangam/month?year=${year}&month=${month}`).then(r => r.ok ? r.json() : []),
        fetch(`${API_BASE}/api/festivals/month?year=${year}&month=${month}`).then(r => r.ok ? r.json() : [])
    ]).then(([panch, fest]) => {
        const pMap = panch.reduce((acc, d) => ({ ...acc, [d.date]: d }), {});
        setMonthlyPanchangam(pMap);
        setFestivals(fest);
    });
  }, [activeStartDate]);

  // Daily Details Fetch
  useEffect(() => {
    setIsLoadingDetails(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    Promise.all([
        fetch(`${API_BASE}/api/daily-times/by-date/${dateStr}`).then(r => r.ok ? r.json() : null),
        fetch(`${API_BASE}/api/sun?date=${dateStr}`).then(r => r.ok ? r.json() : null)
    ]).then(([daily, sun]) => {
        setDailyTimes(daily);
        setSunTimes(sun);
        setIsLoadingDetails(false);
    });
  }, [selectedDate]);

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    const panch = monthlyPanchangam[dateStr];
    const fests = festivalsByDate.get(dateStr) || [];
    const hasAppt = appointmentsByDate.has(dateStr);
    
    let moonSymbol = panch?.tithi === 'Pournami' ? '🌕' : panch?.tithi === 'Amavasya' ? '🌑' : null;

    return (
      <div className="custom-tile-inner">
        <div className="tile-top-row">
            {hasAppt && <span className="appt-dot" title="Ritual Scheduled" />}
            {moonSymbol && <span className="moon-icon">{moonSymbol}</span>}
        </div>
        {fests.length > 0 && <div className="fest-label">{fests[0].name}</div>}
      </div>
    );
  };

  return (
    <div className="high-end-calendar-wrapper">
      <ToastContainer position="bottom-right" theme="colored" />
      
      <div className="calendar-main-header">
          <div>
            <h1>Panchangam Calendar</h1>
            <p>Vedic Insights & Ritual Schedule</p>
          </div>
          <button className="jump-today-btn" onClick={handleJumpToToday}>Go to Today</button>
      </div>

      <div className="calendar-grid-layout">
        {/* SIDEBAR */}
        <aside className="calendar-sidebar">
          <div className="sidebar-card fest-card">
              <h3><FaRegCalendarCheck /> {format(activeStartDate, 'MMMM')} Festivals</h3>
              <div className="sidebar-scroll">
                  {monthlyFestivals.length > 0 ? monthlyFestivals.map((f, i) => (
                      <div key={i} className="sidebar-item">
                          <div className="item-date">{format(parseISO(f.date), 'dd')}</div>
                          <div className="item-info"><strong>{f.name}</strong></div>
                      </div>
                  )) : <p className="empty-txt">No festivals this month.</p>}
              </div>
          </div>

          <div className="sidebar-card appt-card">
            <h3><FaRegListAlt /> Rituals: {format(selectedDate, 'MMM d')}</h3>
            <div className="sidebar-scroll">
              {(appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd')) || []).length > 0 ? (
                appointmentsByDate.get(format(selectedDate, 'yyyy-MM-dd')).map(app => (
                  <div key={app.id} className="sidebar-item appt-item">
                    <strong>{app.title}</strong>
                    <span>{app.detail}</span>
                  </div>
                ))
              ) : <p className="empty-txt">No rituals scheduled.</p>}
            </div>
          </div>
        </aside>

        {/* MAIN CALENDAR */}
        <main className="calendar-center">
            <div className="calendar-container-premium">
                <Calendar
                    value={selectedDate}
                    onClickDay={setSelectedDate}
                    onActiveStartDateChange={({ activeStartDate }) => setActiveStartDate(activeStartDate)}
                    tileContent={tileContent}
                    tileClassName={({ date, view }) => {
                        if (view !== 'month') return '';
                        let classes = [];
                        if (isSameDay(date, new Date())) classes.push('is-today');
                        if (festivalsByDate.has(format(date, 'yyyy-MM-dd'))) classes.push('is-festival');
                        return classes.join(' ');
                    }}
                    navigationLabel={({ date }) => format(date, 'MMMM yyyy')}
                    formatDay={(locale, date) => format(date, 'd')}
                    calendarType="gregory"
                    next2Label={null}
                    prev2Label={null}
                />
            </div>

            {/* DETAILS PANEL */}
            <section className="day-details-premium">
                <div className="details-header">
                    <FaRegCalendarAlt /> 
                    <h2>Daily Panchangam: {format(selectedDate, 'PPPP')}</h2>
                </div>
                
                {isLoadingDetails ? <div className="loader-ring">Processing...</div> : (
                    <div className="timings-grid-modern">
                        <div className="t-card sunrise">
                            <label><FaSun /> Sunrise</label>
                            <strong>{formatTime12Hour(sunTimes?.sunrise)}</strong>
                        </div>
                        <div className="t-card sunset">
                            <label><FaMoon /> Sunset</label>
                            <strong>{formatTime12Hour(sunTimes?.sunset)}</strong>
                        </div>
                        <div className="t-card rahu">
                            <label><FaRegClock /> Rahu Kalam</label>
                            <p>{dailyTimes ? `${formatTime12Hour(dailyTimes.rahukalamStart)} - ${formatTime12Hour(dailyTimes.rahukalamEnd)}` : 'N/A'}</p>
                        </div>
                        <div className="t-card yama">
                            <label><FaRegClock /> Yamagandam</label>
                            <p>{dailyTimes ? `${formatTime12Hour(dailyTimes.yamagandamStart)} - ${formatTime12Hour(dailyTimes.yamagandamEnd)}` : 'N/A'}</p>
                        </div>
                    </div>
                )}
            </section>
        </main>
      </div>
    </div>
  );
}