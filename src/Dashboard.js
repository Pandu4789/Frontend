import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedView, setSelectedView] = useState('Today');
  const [key, setKey] = useState(0); // to force remount/filter reset

  // Fetch bookings from backend
  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/appointments");

      // Map your backend shape to the UI shape:
      const mapped = res.data.map(b => ({
        id: b.id,
        eventTitle: b.event,
        bookingDate: format(new Date(b.start), 'yyyy-MM-dd'),
        name: b.name,
        phone: b.phone,
        address: b.address,
        startTime: format(new Date(b.start), 'hh:mm a'),
        endTime: format(new Date(b.end), 'hh:mm a'),
      }));
      setBookings(mapped);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [key]); // refetch whenever `key` changes

  // Date helpers
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(now.getDate() + 2);
  const twoDaysLaterStr = format(twoDaysLater, 'yyyy-MM-dd');

  // Counts
  const todayCount = bookings.filter(b => b.bookingDate === todayStr).length;
  const upcomingCount = bookings.filter(
    b => b.bookingDate > todayStr && b.bookingDate <= twoDaysLaterStr
  ).length;
  const allCount = bookings.length;

  // Handlers
  const handleCardClick = view => {
    setSelectedView(view);
    setKey(k => k + 1); // trigger refetch & remount of grid
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <div style={styles.cardContainer}>
        <Card title="Today's Bookings" count={todayCount} onClick={() => handleCardClick('Today')} />
        <Card title="Upcoming Bookings" count={upcomingCount} onClick={() => handleCardClick('Upcoming')} />
        <Card title="All Bookings" count={allCount} onClick={() => handleCardClick('All')} />
      </div>

      <div style={{ marginTop: 30 }}>
        <h2>{selectedView} Bookings</h2>
        <BookingGrid key={key} type={selectedView} bookings={bookings} />
      </div>
    </div>
  );
};

const Card = ({ title, count, onClick }) => (
  <div style={styles.card} onClick={onClick}>
    <h3>{title}</h3>
    <p style={{ fontSize: 20, fontWeight: 'bold' }}>{count}</p>
  </div>
);

const BookingGrid = ({ type, bookings }) => {
  const [eventFilter, setEventFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAll, setShowAll] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const filtered = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);
    const inThisMonth =
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear;

      const matchesEvent = (b.eventTitle || "").toLowerCase().includes(eventFilter.toLowerCase());
    const matchesDate = !dateFilter || b.bookingDate === dateFilter;

    if (type === 'Today') {
      return b.bookingDate === format(now, 'yyyy-MM-dd');
    }
    if (type === 'Upcoming') {
      const diffDays = (bookingDate - now) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 2 && matchesEvent && matchesDate && inThisMonth;
    }
    // All
    return matchesEvent && matchesDate && inThisMonth;
  });

  const visible = showAll ? filtered : filtered.slice(0, 10);
  const resetFilters = () => {
    setEventFilter('');
    setDateFilter('');
    setShowAll(false);
  };

  return (
    <div>
      {(type === 'Upcoming' || type === 'All') && (
        <div style={styles.filters}>
          <input
            style={styles.input}
            type="text"
            placeholder="Filter by Event"
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
          />
          <input
            style={styles.input}
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
          />
          <button style={styles.resetButton} onClick={resetFilters}>
            Reset
          </button>
        </div>
      )}

      <div style={styles.grid}>
        {visible.length ? (
          visible.map(b => (
            <div key={b.id} style={styles.bookingCard}>
              <h4>{b.eventTitle}</h4>
              <p><strong>Date:</strong> {b.bookingDate}</p>
              <p><strong>Name:</strong> {b.name}</p>
              <p><strong>Phone:</strong> {b.phone}</p>
              <p><strong>Address:</strong> {b.address}</p>
              <p><strong>Time:</strong> {b.startTime} - {b.endTime}</p>
            </div>
          ))
        ) : (
          <div style={styles.noData}>No bookings found.</div>
        )}
      </div>

      {!showAll && filtered.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button style={styles.seeMore} onClick={() => setShowAll(true)}>
            See More
          </button>
        </div>
      )}
    </div>
  );
};

const styles = {
  cardContainer: { display: 'flex', gap: 20, justifyContent: 'center' },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    textAlign: 'center',
    cursor: 'pointer',
    width: 200,
    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
  },
  filters: { marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' },
  input: { padding: 8, border: '1px solid #ccc', borderRadius: 4, fontSize: 14 },
  resetButton: {
    padding: '8px 14px',
    border: '1px solid #ccc',
    backgroundColor: '#eee',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 20,
  },
  bookingCard: {
    border: '1px solid #ccc',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  noData: { textAlign: 'center', color: '#888', fontStyle: 'italic' },
  seeMore: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
  },
};

export default Dashboard;
