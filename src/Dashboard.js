import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import CountUp from 'react-countup';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, TextField, Collapse } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: { main: '#673ab7' },
    secondary: { main: '#f50057' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: { fontWeight: 500, marginBottom: 16 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500, marginBottom: 8, color: '#777' },
  },
  components: {
    MuiCard: { styleOverrides: { root: { boxShadow: '0px 3px 5px rgba(0,0,0,0.1)', borderRadius: 8 } } },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#673ab7',
          color: 'white',
          '&:hover': { backgroundColor: '#512da8' },
        },
        outlined: {
          borderColor: '#673ab7',
          color: '#673ab7',
          '&:hover': { borderColor: '#512da8', color: '#512da8' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 4 },
        colorPrimary: { backgroundColor: '#673ab7', color: 'white' },
      },
    },
  },
});

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedView, setSelectedView] = useState('Today');
  const [key, setKey] = useState(0);
  const [upcomingCount, setUpcomingCount] = useState(0);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/appointments");
      const mapped = res.data.map(b => ({
        id: b.id,
        eventTitle: b.event || 'N/A',
        bookingDate: format(new Date(b.start), 'yyyy-MM-dd'),
        name: b.name,
        phone: b.phone,
        address: b.address,
        startTime: format(new Date(b.start), 'hh:mm a'),
        endTime: format(new Date(b.end), 'hh:mm a'),
        notes: b.notes || '',
        customerId: b.customerId || '',
      }));
      setBookings(mapped);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  useEffect(() => { fetchBookings(); }, [key]);

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

  const handleCardClick = (view) => { setSelectedView(view); setKey(k => k + 1); };

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
    <ThemeProvider theme={customTheme}>
      <Box p={3}>
        <Grid container spacing={10} justifyContent="center">
          {['Today', 'Upcoming', 'All'].map((view) => (
            <Grid item xs={12} sm={4} md={3} lg={2} key={view}>
              <StatCard
                title={`${view} Bookings`}
                count={view === 'Today' ? todayCount : view === 'Upcoming' ? upcomingCount : allCount}
                onClick={() => handleCardClick(view)}
                color={getCardColor(
                  view === 'Today' ? todayCount : view === 'Upcoming' ? upcomingCount : allCount,
                  view
                )}
              />
            </Grid>
          ))}
        </Grid>

        <Box mt={5}>
          <Typography variant="h5" gutterBottom>{selectedView} Bookings</Typography>
          <BookingGrid key={key} type={selectedView} bookings={bookings} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

const StatCard = ({ title, count, onClick, color }) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      textAlign: 'left',
      boxShadow: 3,
      backgroundColor: color,
      color: 'white',
      borderRadius: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 2,
      py: 2,
      height: '90px',
      width: '100%',
      transition: 'background-color 0.3s, box-shadow 0.3s',
      '&:hover': { backgroundColor: `${color}CC`, boxShadow: 5 },
    }}
  >
    <Typography variant="h6" fontWeight="bold" noWrap>{title}</Typography>
    <Box
      sx={{
        backgroundColor: 'white',
        color: 'black',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        width: 50,
        borderRadius: '30px',
        fontWeight: 'bold',
        fontSize: '1.2rem',
      }}
    >
      <CountUp end={count} duration={1.5} />
    </Box>
  </Card>
);

const BookingGrid = ({ type, bookings }) => {
  const [eventFilter, setEventFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  const filtered = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);
    const matchesEvent = b.eventTitle.toLowerCase().includes(eventFilter.toLowerCase());
    const matchesDate = !dateFilter || b.bookingDate === dateFilter;

    if (type === 'Today') return b.bookingDate === format(new Date(), 'yyyy-MM-dd');

    if (type === 'Upcoming') {
      const now = new Date();
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(now.getDate() + 7);
      return bookingDate > now && bookingDate <= sevenDaysLater && matchesEvent && matchesDate;
    }

    return matchesEvent && matchesDate;
  });

  const visible = filtered.slice(0, 10);

  const resetFilters = () => { setEventFilter(''); setDateFilter(''); };
  const toggleExpand = (id) => { setExpandedBookingId(prev => (prev === id ? null : id)); };

  const hasMoreData = (b) => b.address.length > 50 || b.notes || b.customerId;

  return (
    <Box mt={3}>
      {(type === 'Upcoming' || type === 'All') && (
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <TextField label="Filter by Event" variant="outlined" value={eventFilter} onChange={e => setEventFilter(e.target.value)} size="small" />
          <TextField type="date" label="Filter by Date" variant="outlined" InputLabelProps={{ shrink: true }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} size="small" />
          <Button variant="outlined" onClick={resetFilters}>Reset</Button>
          {['All', 'Birthday', 'Wedding', 'Corporate'].map(tag => (
            <Chip key={tag} label={tag} onClick={() => setEventFilter(tag.toLowerCase() === 'all' ? '' : tag.toLowerCase())} color={tag === 'All' ? 'primary' : 'default'} />
          ))}
        </Box>
      )}
      <Grid container spacing={3}>
        {visible.length ? visible.map(b => {
          const isExpanded = expandedBookingId === b.id;
          const showExpand = hasMoreData(b);
          const isAddressLong = b.address.length > 50;

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={b.id}>
              <Card
                onClick={showExpand ? () => toggleExpand(b.id) : undefined}
                sx={{
                  p: 2,
                  boxShadow: 2,
                  cursor: showExpand ? 'pointer' : 'default',
                  transition: 'box-shadow 0.3s',
                  height: 'auto',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': { boxShadow: 8 },
                }}
              >
                <Typography variant="h6" fontWeight="bold" noWrap>{b.eventTitle}</Typography>
                <Typography><strong>Date:</strong> {b.bookingDate}</Typography>
                <Typography noWrap><strong>Name:</strong> {b.name}</Typography>
                <Typography><strong>Phone:</strong> {b.phone}</Typography>
                <Typography>
                  <strong>Address:</strong> {isExpanded ? b.address : `${b.address.slice(0, 50)}${isAddressLong ? '...' : ''}`}
                </Typography>
                <Typography sx={{ mt: 1 }}><strong>Time:</strong> {b.startTime} - {b.endTime}</Typography>
                {showExpand && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mt: 1 }}>
                    {b.notes && <Typography><strong>Notes:</strong> {b.notes}</Typography>}
                    {b.customerId && <Typography><strong>Customer ID:</strong> {b.customerId}</Typography>}
                  </Collapse>
                )}
              </Card>
            </Grid>
          );
        }) : (
          <Grid item xs={12}>
            <Typography>No bookings found for the selected filter.</Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
