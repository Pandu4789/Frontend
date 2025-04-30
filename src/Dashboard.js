import React, { useState, useEffect } from 'react';
import axios from 'axios';
import format from 'date-fns/format';
import CountUp from 'react-countup';
import { Grid, Card, CardContent, Typography, Box, Chip, Button, TextField, Collapse } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const customTheme = createTheme({
  palette: {
    primary: {
      main: '#673ab7', // Deep purple
    },
    secondary: {
      main: '#f50057', // Vibrant pink
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h5: {
      fontWeight: 500,
      marginBottom: 16,
    },
    subtitle1: { 
      fontWeight: 500,
    },
    subtitle2: {
      fontWeight: 500,
      marginBottom: 8,
      color: '#777',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 3px 5px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: '#673ab7',
          color: 'white',
          '&:hover': {
            backgroundColor: '#512da8',
          },
        },
        outlined: {
          borderColor: '#673ab7',
          color: '#673ab7',
          '&:hover': {
            borderColor: '#512da8',
            color: '#512da8',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
        colorPrimary: {
          backgroundColor: '#673ab7',
          color: 'white',
        },
      },
    },
  },
});

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedView, setSelectedView] = useState('Today');
  const [key, setKey] = useState(0);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/appointments");
      const mapped = res.data.map(b => ({
        id: b.id,
        eventTitle: b.event,
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

  useEffect(() => {
    fetchBookings();
  }, [key]);

  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');
  const twoDaysLater = new Date(now);
  twoDaysLater.setDate(now.getDate() + 2);
  const twoDaysLaterStr = format(twoDaysLater, 'yyyy-MM-dd');

  const todayCount = bookings.filter(b => b.bookingDate === todayStr).length;
  const upcomingCount = bookings.filter(
    b => b.bookingDate > todayStr && b.bookingDate <= twoDaysLaterStr
  ).length;
  const allCount = bookings.length;

  const handleCardClick = view => {
    setSelectedView(view);
    setKey(k => k + 1);
  };

  const getCardColor = (count, type) => {
    if (type === 'Today') {
      return customTheme.palette.primary.main;
    }
    if (type === 'All') {
      return '#2196F3';
    }
    return count < 2 ? 'red' : 'green';
  };

  return (
    <ThemeProvider theme={customTheme}>
      <Box p={3}>
        <Grid container spacing={5} justifyContent="center"> {/* Spacing adjusted */}
          <Grid item xs={12} sm={4} md={3} lg={2}>
            <StatCard
              title="Today's Bookings"
              count={todayCount}
              onClick={() => handleCardClick('Today')}
              color={getCardColor(todayCount, 'Today')}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3} lg={2}>
            <StatCard
              title="Upcoming Bookings"
              count={upcomingCount}
              onClick={() => handleCardClick('Upcoming')}
              color={getCardColor(upcomingCount, 'Upcoming')}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3} lg={2}>
            <StatCard
              title="All Bookings"
              count={allCount}
              onClick={() => handleCardClick('All')}
              color={getCardColor(allCount, 'All')}
            />
          </Grid>
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
      margin: 'auto',
      cursor: 'pointer',
      textAlign: 'left',
      boxShadow: 3,
      backgroundColor: color,
      color: 'white',
      borderRadius: '50px',
      display: 'flex',
      flexDirection: 'row-end',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 0,
      paddingLeft: '20px',
      paddingTop: '20px',
      paddingBottom: '20px',
      Height: '90px', // Ensures cards have enough space
      width: '100%',
      transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        backgroundColor: `${color}CC`,
        boxShadow: 5,
      },
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{title}</Typography>
    <Box
      sx={{
        backgroundColor: 'white',
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'black',
        height: '40px',
        width: '40px',
        padding: '8px 12px',
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

  const visible = filtered.slice(0, 10);

  const resetFilters = () => {
    setEventFilter('');
    setDateFilter('');
  };

  const handleCardClick = (id) => {
    setExpandedBookingId(prevId => (prevId === id ? null : id));
  };

  const hasMoreData = (booking) => {
    return booking.address.length > 50 || booking.notes || booking.customerId;
  };

  return (
    <Box mt={3}>
      {(type === 'Upcoming' || type === 'All') && (
        <Box display="flex" flexWrap="wrap" gap={2} mb={3}>
          <TextField
            label="Filter by Event"
            variant="outlined"
            value={eventFilter}
            onChange={e => setEventFilter(e.target.value)}
            size="small"
          />
          <TextField
            type="date"
            label="Filter by Date"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            size="small"
          />
          <Button variant="outlined" onClick={resetFilters}>Reset</Button>

          <Chip label="All" onClick={() => { setEventFilter(''); setDateFilter(''); }} color="primary" />
          <Chip label="Birthday" onClick={() => setEventFilter('birthday')} />
          <Chip label="Wedding" onClick={() => setEventFilter('wedding')} />
          <Chip label="Corporate" onClick={() => setEventFilter('corporate')} />
        </Box>
      )}

      <Grid container spacing={3}>
        {visible.length ? (
          visible.map(b => {
            const isExpanded = expandedBookingId === b.id;
            const shouldExpand = hasMoreData(b);
            const isAddressLong = b.address.length > 50;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={b.id}> {/* Responsive grid */}
                <Card
                  onClick={shouldExpand ? () => handleCardClick(b.id) : undefined}
                  sx={{
                    p: 2,
                    boxShadow: 2,
                    cursor: shouldExpand ? 'pointer' : 'default',
                    transition: 'height 0.3s ease, max-height 0.3s ease, box-shadow 0.3s ease',
                    height: 'auto', // Flexible height
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    '&:hover': {
                      boxShadow: 8,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.eventTitle}</Typography>
                  <Typography><strong>Date:</strong> {b.bookingDate}</Typography>
                  <Typography sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><strong>Name:</strong> {b.name}</Typography>
                  <Typography><strong>Phone:</strong> {b.phone}</Typography>
                  <Typography sx={{ overflow: 'hidden' }}>
                    <strong>Address:</strong> {b.address.slice(0, 50)}
                    {isAddressLong && !isExpanded && <span style={{ color: '#673ab7', cursor: 'pointer' }}>... See More</span>}
                    {isExpanded && b.address}
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Time:</strong> {b.startTime} - {b.endTime}</Typography>

                  {shouldExpand && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mt: 1 }}>
                      {b.notes && <Typography><strong>Notes:</strong> {b.notes}</Typography>}
                      {b.customerId && <Typography><strong>Customer ID:</strong> {b.customerId}</Typography>}
                    </Collapse>
                  )}
                </Card>
              </Grid>
            );
          })
        ) : (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" fontStyle="italic">
              No bookings found.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
