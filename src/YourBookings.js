// Filename: src/YourBookings.js - FINAL REDESIGNED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import axios from 'axios';
import { format } from 'date-fns';
import { FaCheckCircle, FaExclamationCircle, FaQuestionCircle, FaUser, FaCalendarAlt, FaClock, FaArrowLeft } from 'react-icons/fa';
import './YourBookings.css';

const API_BASE = "http://localhost:8080";

// --- Card Component for Standard Appointment Bookings ---
const BookingCard = ({ booking }) => {
    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('accepted') || statusLower.includes('confirmed')) return <FaCheckCircle className="status-icon confirmed" />;
        if (statusLower.includes('pending')) return <FaExclamationCircle className="status-icon pending" />;
        if (statusLower.includes('viewed')) return <FaCheckCircle className="status-icon viewed" />;
        if (statusLower.includes('rejected') || statusLower.includes('cancelled')) return <FaExclamationCircle className="status-icon rejected" />;
        return <FaQuestionCircle className="status-icon default" />;
    };

    return (
        <div className="booking-card">
            <div className="booking-card-header">
                <h3 className="booking-type">{booking.type}</h3>
                <div className={`booking-status-badge ${booking.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(booking.status)}
                    <span>{booking.status}</span>
                </div>
            </div>
            <div className="booking-card-body">
                <div className="detail-item"> <FaUser className="detail-icon" /> <span>With {booking.priestName}</span> </div>
                <div className="detail-item"> <FaCalendarAlt className="detail-icon" /> <span>{booking.date}</span> </div>
                <div className="detail-item"> <FaClock className="detail-icon" /> <span>{booking.time || 'Time TBD'}</span> </div>
            </div>
        </div>
    );
};

// --- NEW: Compact Card Component for Muhurtam Requests ---
const RequestCard = ({ request }) => {
    const getStatusIcon = (status) => {
        const statusLower = status?.toLowerCase() || '';
        if (statusLower.includes('viewed')) return <FaCheckCircle className="status-icon viewed" />;
        return <FaExclamationCircle className="status-icon pending" />;
    };

    return (
        <div className="request-card-simple">
            <div className="request-info">
                <h3 className="booking-type">{request.type}</h3>
                <p className="booking-priest">
                    <FaUser className="detail-icon" />
                    With {request.priestName}
                </p>
            </div>
            <div className={`booking-status-badge ${request.status.toLowerCase().replace(' ', '-')}`}>
                {getStatusIcon(request.status)}
                <span>{request.status}</span>
            </div>
        </div>
    );
};


const YourBookings = () => {
    const navigate = useNavigate(); // Initialize navigate hook
    const [activeTab, setActiveTab] = useState('bookings');
    const [appointmentBookings, setAppointmentBookings] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserBookings = async () => {
            const customerId = localStorage.getItem('userId');
            if (!customerId) {
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            try {
                const [bookingRes, muhurtamRes, eventsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/booking/customer/${customerId}`),
                    axios.get(`${API_BASE}/api/muhurtam/customer/${customerId}`),
                    axios.get(`${API_BASE}/api/events`)
                ]);

                const eventMap = (eventsRes.data || []).reduce((map, event) => {
                    map[event.id] = event.name;
                    return map;
                }, {});

                const formattedBookings = (bookingRes.data || []).map(b => ({
                    id: `booking-${b.id}`,
                    type: b.eventName || 'Event Booking',
                    priestName: b.priestName || 'N/A',
                    date: b.date ? format(new Date(b.date), 'MMMM dd, yyyy') : 'Date TBD',
                    time: b.start ? format(new Date(`1970-01-01T${b.start}`), 'hh:mm a') : '',
                    status: b.status || 'Pending',
                })).sort((a, b) => new Date(b.date) - new Date(a.date));
                setAppointmentBookings(formattedBookings);

                const formattedMuhurtams = (muhurtamRes.data || []).map(m => ({
                    id: `muhurtam-${m.id}`,
                    type: m.eventName ? `${m.eventName} Muhurtam` : 'Muhurtam Request',
                    priestName: m.priestName || 'N/A',
                    status: m.viewed ? 'Viewed by Priest' : 'Pending',
                }));
                setMuhurtamRequests(formattedMuhurtams);

            } catch (err) {
                console.error("Failed to fetch user's bookings:", err);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchUserBookings();
    }, []);

    const pendingBookingsCount = appointmentBookings.filter(b => b.status?.toLowerCase() === 'pending').length;
    const pendingRequestsCount = muhurtamRequests.filter(r => r.status?.toLowerCase() === 'pending').length;

    return (
        <div className="your-bookings-page">
            <div className="your-bookings-header">
                <h1 className="your-bookings-title">My Bookings & Requests</h1>
                <button className="back-to-dashboard-btn" onClick={() => navigate('/dashboard')}>
                    <FaArrowLeft />
                    Back to Dashboard
                </button>
            </div>

            <div className="bookings-tabs">
                <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>
                    Appointment Bookings
                    {pendingBookingsCount > 0 && <span className="notification-badge">{pendingBookingsCount}</span>}
                </button>
                <button className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
                    Muhurtam Requests
                    {pendingRequestsCount > 0 && <span className="notification-badge">{pendingRequestsCount}</span>}
                </button>
            </div>
            <div className="bookings-list">
                {isLoading ? (
                    <p className="loading-text">Loading...</p>
                ) : activeTab === 'bookings' ? (
                    appointmentBookings.length > 0 ? (
                        appointmentBookings.map(booking => <BookingCard key={booking.id} booking={booking} />)
                    ) : (
                        <div className="no-bookings-card"><p>You have no appointment bookings.</p></div>
                    )
                ) : (
                    muhurtamRequests.length > 0 ? (
                        muhurtamRequests.map(request => <RequestCard key={request.id} request={request} />)
                    ) : (
                        <div className="no-bookings-card"><p>You have no muhurtam requests.</p></div>
                    )
                )}
            </div>
        </div>
    );
};

export default YourBookings;