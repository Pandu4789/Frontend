import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import CountUp from 'react-countup';
import './Dashboard.css';
import AppointmentModal from './AppointmentModal';

const Dashboard = () => {
  const priestId = localStorage.getItem('userId');
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedView, setSelectedView] = useState('Today');
  const [upcomingCount, setUpcomingCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    event: '',
    name: '',
    phone: '',
    address: '',
    date: new Date(),
    timeFrom: '',
    timeTo: '',
  });

  // Helper to zero time for date-only comparisons
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const priestId = localStorage.getItem('userId'); // get priestId here

    if (!priestId) {
      console.error('Priest ID is missing!');
      return;
    }

    try {
      await axios.post(`http://localhost:8080/api/appointments/priest/${priestId}`, formData);
      fetchBookings();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to save appointment', error);
    }
  };

  const fetchBookings = async () => {
    if (!priestId) {
      console.warn('priestId is missing');
      return;
    }
    try {
      const [bookingRes, appointmentRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/booking/priest/${priestId}`),
        axios.get(`http://localhost:8080/api/appointments/priest/${priestId}`),
      ]);

      const mapBooking = (b) => {
        const startDateStr = b.start || b.date;
        const endDateStr = b.end || b.date;

        const startDate = startDateStr ? new Date(startDateStr) : null;
        const endDate = endDateStr ? new Date(endDateStr) : null;

        const isValidStart = startDate instanceof Date && !isNaN(startDate);
        const isValidEnd = endDate instanceof Date && !isNaN(endDate);

        return {
          id: b.id,
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

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to fetch events', err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchEvents();
  }, [priestId]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEnd = new Date(today);
  upcomingEnd.setDate(upcomingEnd.getDate() + 7);

  // Correct counts using normalized dates
  const todayCount = bookings.filter((b) => {
    const bookingDate = normalizeDate(b.bookingDate);
    return bookingDate.getTime() === today.getTime();
  }).length;

  const allCount = bookings.length;

  useEffect(() => {
    const calculateUpcomingCount = () => {
      const updatedCount = bookings.filter((b) => {
        const bookingDate = normalizeDate(b.bookingDate);
        return bookingDate > today && bookingDate <= upcomingEnd;
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

  const openAdd = () => {
    setFormData({ event: '', name: '', phone: '', date: new Date(), timeFrom: '', timeTo: '', address: '' });
    setShowModal(true);
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

      <div style={{ margin: '15px 0' }}>
        <button
          onClick={openAdd}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          + Add Appointment
        </button>
      </div>

      <div className="booking-section">
        <h2>{selectedView} Bookings</h2>

        <BookingGrid type={selectedView} bookings={bookings} events={events} />

        {showModal && (
          <AppointmentModal
            showModal={showModal}
            closeModal={() => setShowModal(false)}
            formData={formData}
            handleFormChange={handleFormChange}
            handleDateChange={handleDateChange}
            handleSubmit={handleSubmit}
            options={events.map(e => e.title || e.name || 'Unnamed Event')}
            filteredTimeOptions={bookings.map(b => b.startTime)}
            toTimeOptions={bookings.map(b => b.endTime)}
            onSaveSuccess={() => {
              fetchBookings();
              setShowModal(false);
            }}
          />
        )}
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

const BookingGrid = ({ type, bookings, events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Use the same normalizeDate helper here too
  const normalizeDate = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEnd = new Date(today);
  upcomingEnd.setDate(upcomingEnd.getDate() + 7);

  const filtered = bookings.filter((b) => {
    const bookingDate = normalizeDate(b.bookingDate);

    const matchesSearch =
      !searchTerm ||
      b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.phone?.includes(searchTerm);

    const matchesEvent =
      !selectedEventId ||
      (b.event && b.event.id && String(b.event.id) === String(selectedEventId));

    const matchesDate = !dateFilter || b.bookingDate === dateFilter;

    if (type === 'Today') {
      return bookingDate.getTime() === today.getTime() && matchesEvent && matchesDate && matchesSearch;
    }
    if (type === 'Upcoming') {
      return bookingDate > today && bookingDate <= upcomingEnd && matchesEvent && matchesDate && matchesSearch;
    }
    return matchesEvent && matchesDate && matchesSearch;
  });

  const visible = filtered.slice(0, 1000);

  const resetFilters = () => {
    setSelectedEventId('');
    setDateFilter('');
    setSearchTerm('');
  };

  return (
    <div className="booking-grid">
      {(type === 'Upcoming' || type === 'All') && (
        <div className="filter-row">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="filter-input"
          >
            <option value="">All Events</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title || event.name || 'Unnamed Event'}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="filter-input"
          />
          <input
            type="text"
            placeholder="Search by name or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />

          <button className="filter-button" onClick={resetFilters}>
            Reset
          </button>
        </div>
      )}

      <div className="grid-container">
        {visible.length ? (
          visible.map((b) => (
            <div key={b.id} className="booking-card">
              <div className="booking-title" style={{ textAlign: 'center' }}>
                {b.eventTitle}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <strong>Name:</strong> {b.name}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Phone:</strong> {b.phone}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Date:</strong> {b.bookingDate}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Time:</strong> {b.startTime} - {b.endTime}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Address:</strong> {b.address}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>Notes:</strong> {b.note || 'N/A'}
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">No bookings found.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
