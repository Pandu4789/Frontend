import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import CountUp from 'react-countup';
import './Dashboard.css';

const Dashboard = () => {
  const priestId = localStorage.getItem('userId');
  const [bookings, setBookings] = useState([]);
  const [selectedView, setSelectedView] = useState('Today');
  const [upcomingCount, setUpcomingCount] = useState(0);

  // Fetch bookings for given priestId
  const fetchBookings = async () => {
    if (!priestId) {
      console.warn('priestId is missing');
      return;
    }
    try {
  console.log('Fetching bookings and appointments for priestId:', priestId);

  const [bookingRes, appointmentRes] = await Promise.all([
    axios.get(`http://localhost:8080/api/booking/priest/${priestId}`),
    axios.get(`http://localhost:8080/api/appointments/priest/${priestId}`),
  ]);
      console.log('Raw bookings data:', bookingRes.data);
      console.log('Raw appointments data:', appointmentRes.data);

      const mapBooking = (b) => {
        const startDateStr = b.start || b.date;
        const endDateStr = b.end || b.date;

        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        const isValidStart = startDate instanceof Date && !isNaN(startDate);
        const isValidEnd = endDate instanceof Date && !isNaN(endDate);

        return {
          id: b.id,
          // Make sure event is an object and you use event.title or event.name, fallback to string if needed
          event: b.event || null,
          eventTitle:
            b.event && typeof b.event === 'object'
              ? b.event.title || b.event.name || 'N/A'
              : b.event || b.eventTitle || 'N/A',
          bookingDate: isValidStart ? format(startDate, 'yyyy-MM-dd') : 'Invalid Date',
          name: b.name,
          phone: b.phone,
          address: b.address,
          startTime: isValidStart ? format(startDate, 'hh:mm a') : 'N/A',
          endTime: isValidEnd ? format(endDate, 'hh:mm a') : 'N/A',
          note: b.note || '',
          customerId: b.customerId || '',
        };
      };
 const combined = [
      ...bookingRes.data.map(mapBooking),
      ...appointmentRes.data.map(mapBooking),
    ];

    setBookings(combined);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [priestId]);

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  const todayCount = bookings.filter(b => b.bookingDate === todayStr).length;
  const allCount = bookings.length;

  useEffect(() => {
    const calculateUpcomingCount = () => {
      const now = new Date();
      const sevenDaysLater = new Date(now);
      sevenDaysLater.setDate(now.getDate() + 7);
      const updatedCount = bookings.filter(b => {
        const bookingDate = new Date(b.bookingDate);
        return bookingDate > now && bookingDate <= sevenDaysLater;
      }).length;
      setUpcomingCount(updatedCount);
    };

    calculateUpcomingCount();
    const interval = setInterval(calculateUpcomingCount, 60000);
    return () => clearInterval(interval);
  }, [bookings]);

  const handleCardClick = (view) => {
    setSelectedView(view);
  };

  const getCardColor = (count, type) => {
    if (type === 'Today') {
      if (count < 2) return '#81C784';
      if (count < 4) return '#FFB74D';
      return '#E57373';
    }
    if (type === 'Upcoming') {
      if (count <= 10) return '#81C784';
      if (count <= 20) return '#FFB74D';
      return '#E57373';
    }
    if (type === 'All') {
      return '#64B5F6';
    }
  };

  return (
    <div className="dashboard-container">
      <div className="stat-cards-row">
        {['Today', 'Upcoming', 'All'].map((view) => (
          <StatCard
            key={view}
            title={`${view} Bookings`}
            count={view === 'Today' ? todayCount : view === 'Upcoming' ? upcomingCount : allCount}
            onClick={() => handleCardClick(view)}
            color={getCardColor(
              view === 'Today' ? todayCount : view === 'Upcoming' ? upcomingCount : allCount,
              view
            )}
          />
        ))}
      </div>

      <div className="booking-section">
        <h2>{selectedView} Bookings</h2>
    

        <BookingGrid type={selectedView} bookings={bookings} />
      </div>
    </div>
  );
};

const StatCard = ({ title, count, onClick, color }) => (
  <div
    className="stat-card"
    onClick={onClick}
    style={{ backgroundColor: color, cursor: 'pointer' }}
  >
    <div className="stat-title">{title}</div>
    <div className="stat-count">
      <CountUp end={count} duration={1.5} preserveValue={true} />
    </div>
  </div>
);

const BookingGrid = ({ type, bookings }) => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Fetch events for dropdown on mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/events');
        setEvents(res.data); // assuming res.data is array of events with id and title or name
      } catch (err) {
        console.error('Failed to fetch events', err);
      }
    };
    fetchEvents();
  }, []);

  // Filter bookings based on selected view, event filter and date filter
  const filtered = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);

     const matchesSearch =
    !searchTerm ||
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.phone?.includes(searchTerm);
    // Check event match: either no filter or booking event id matches selectedEventId
   const matchesEvent =
  !selectedEventId ||
  (b.event && b.event.id && String(b.event.id) === String(selectedEventId));


    // Check date match
    const matchesDate = !dateFilter || b.bookingDate === dateFilter;

    if (type === 'Today') {
      return b.bookingDate === format(new Date(), 'yyyy-MM-dd') && matchesEvent && matchesDate && matchesSearch;
    }

    if (type === 'Upcoming') {
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(now.getDate() + 7);
      return bookingDate > now && bookingDate <= sevenDaysLater && matchesEvent && matchesDate && matchesSearch;
    }

    return matchesEvent && matchesDate && matchesSearch;
  });

  const visible = filtered.slice(0, 1000);

  const resetFilters = () => {
    setSelectedEventId('');
    setDateFilter('');
    setSearchTerm('');
  };

  const toggleExpand = (id) => {
    setExpandedBookingId(prev => (prev === id ? null : id));
  };

  const hasMoreData = (b) => b.address.length > 50 || b.note || b.customerId;

  return (
    <div className="booking-grid">
      {(type === 'Upcoming' || type === 'All') && (
        <div className="filter-row">
          <select
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
            className="filter-input"
          >
            <option value="">All Events</option>
            {events.map(event => (
              <option key={event.id} value={event.id}>
                {event.title || event.name || 'Unnamed Event'}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="filter-input"
          />

          <button className="filter-button" onClick={resetFilters}>Reset</button>
        </div>
      )}

      <div className="grid-container">
        {visible.length ? visible.map(b => {
          const isExpanded = expandedBookingId === b.id;
          const showExpand = hasMoreData(b);
          const isAddressLong = b.address.length > 50;

          return (
            <div
              key={b.id}
              className={`booking-card ${showExpand ? 'clickable' : ''}`}
              style={{
                maxHeight: isExpanded ? 'auto' : isAddressLong ? '150px' : 'auto',
                overflow: 'hidden',
              }}
              onClick={() => showExpand && toggleExpand(b.id)}
            >
              <div className="booking-title" style={{ textAlign: "center" }}>{b.eventTitle}</div>

              <div style={{ marginBottom: "10px" }}><strong>Name:</strong> {b.name}</div>
<div style={{ marginBottom: "10px" }}><strong>Phone:</strong> {b.phone}</div>
<div style={{ marginBottom: "10px" }}><strong>Date:</strong> {b.bookingDate}</div>
<div style={{ marginBottom: "10px" }}><strong>Time:</strong> {b.startTime} - {b.endTime}</div>
<div style={{ marginBottom: "10px" }}><strong>Address:</strong> {
  isAddressLong ? `${b.address.slice(0, 50)}...` : b.address
}</div>
              <div style={{ marginBottom: "10px" }}><strong>Notes:</strong> {b.note || 'N/A'}</div>

             
             
            </div>
          );
        }) : (
          <div className="no-bookings">No bookings found.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
