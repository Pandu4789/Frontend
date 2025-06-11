// Filename: PriestDashboard.js - UPDATED with custom empty message
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isAfter, startOfDay, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import CountUp from 'react-countup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
    FaCalendarCheck, FaCalendarAlt, FaBell, FaDownload, FaPlus, FaStickyNote,
    FaChartBar, FaUserClock, FaRegCalendarAlt, FaListAlt, FaChevronRight, FaCalendarDay, FaTimes, FaBullhorn
} from 'react-icons/fa';
import './Dashboard.css';
import AppointmentModal from './AppointmentModal';

const API_BASE = "http://localhost:8080";

// --- Sub-components ---

// MODIFIED: This component now accepts a custom 'emptyMessage' prop
const BookingsListView = ({ title, items, type = 'booking', emptyMessage }) => {
    if (!items || items.length === 0) {
        // Use the custom message if provided, otherwise show the default
        return (
            <div className="pd-no-data">
                {emptyMessage ? (
                    <>
                        <FaCalendarCheck className="no-data-icon" />
                        <p>{emptyMessage}</p>
                    </>
                ) : (
                    <p>No {type === 'booking' ? 'bookings' : 'requests'} for this view.</p>
                )}
            </div>
        );
    }
    return ( <div> <h3 className="pd-section-title">{title}</h3> <div className="pd-list-container"> {items.map(item => ( <div key={item.id} className="pd-card booking-card"> <div className="pd-card-header"> <h4 className="pd-card-title">{item.poojaType}</h4> {item.status && <span className={`pd-status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>} </div> <div className="pd-card-body"> <p><strong>Customer:</strong> {item.customerName} </p> <p><strong>Contact:</strong> {item.contact}</p> <p><strong>Date:</strong> {format(parseISO(item.date), 'EEE, MMM d, yyyy')}</p> {item.startTime && <p><strong>Time:</strong> {item.startTime}</p>} </div> {type === 'request' && ( <div className="pd-card-actions"> <button className="pd-action-btn primary">Accept</button> <button className="pd-action-btn danger">Decline</button> </div> )} </div> ))} </div> </div> );
};
const PoojaStatsView = ({ stats, transactions, onExport }) => { /* ... existing JSX ... */ };
const KnowledgeBaseView = () => { /* ... existing JSX ... */ };
const ManageTempleEventsView = ({ events, onAddEvent }) => { /* ... existing JSX ... */ };

// --- Main Dashboard Component ---
const PriestDashboard = () => {
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [activeView, setActiveView] = useState('today');
    const [userName, setUserName] = useState("Priest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [allAppointments, setAllAppointments] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [stats, setStats] = useState({ week: 0, month: 0, year: 0, topPoojas: [] });
    const [templeEvents, setTempleEvents] = useState([]);

    useEffect(() => {
        const priestId = localStorage.getItem('userId');
        const storedFirstName = localStorage.getItem('firstName') || 'Priest';
        setUserName(storedFirstName);
        if (!priestId) { toast.error("Priest ID not found. Please log in again."); setIsLoading(false); return; }

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [bookingRes, manualAppointmentRes, muhurtamRes, eventsRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/muhurtam/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/events`)
                ]);
                const customerBookings = (bookingRes.data || []).map(b => ({ id: `booking-${b.id}`, poojaType: b.eventName || 'Event Booking', customerName: b.name, contact: b.phone, date: b.date, startTime: b.start, status: b.status }));
                const manualAppointments = (manualAppointmentRes.data || []).map(m => ({ id: `manual-${m.id}`, poojaType: m.eventName || 'Manual Entry', customerName: m.name, contact: m.phone, date: m.start ? format(parseISO(m.start), 'yyyy-MM-dd') : null, startTime: m.start ? format(parseISO(m.start), 'hh:mm a') : null, status: 'Confirmed' }));
                const combinedAppointments = [...customerBookings, ...manualAppointments];
                setAllAppointments(combinedAppointments);
                setMuhurtamRequests(muhurtamRes.data || []);
                setTempleEvents(eventsRes.data || []);
                
                const now = new Date();
                const poojasThisWeek = combinedAppointments.filter(b => b.date && isWithinInterval(parseISO(b.date), { start: startOfWeek(now), end: endOfWeek(now) })).length;
                const poojasThisMonth = combinedAppointments.filter(b => b.date && parseISO(b.date).getMonth() === now.getMonth() && parseISO(b.date).getFullYear() === now.getFullYear()).length;
                const poojasThisYear = combinedAppointments.filter(b => b.date && isWithinInterval(parseISO(b.date), { start: startOfYear(now), end: endOfYear(now) })).length;
                const poojaCounts = combinedAppointments.reduce((acc, booking) => { const poojaName = booking.poojaType || 'Unknown Event'; acc[poojaName] = (acc[poojaName] || 0) + 1; return acc; }, {});
                const topPoojas = Object.entries(poojaCounts).sort(([,a],[,b]) => b-a).slice(0, 3).map(([name, count]) => ({ name, count }));
                setStats({ week: poojasThisWeek, month: poojasThisMonth, year: poojasThisYear, topPoojas });
            } catch (error) {
                toast.error("Failed to load dashboard data.");
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);
    
    const todayBookings = useMemo(() => allAppointments.filter(b => b.date && isToday(parseISO(b.date))), [allAppointments]);
    const upcomingBookings = useMemo(() => allAppointments.filter(b => b.date && isAfter(startOfDay(parseISO(b.date)), startOfDay(new Date()))), [allAppointments]);
    const pendingRequests = useMemo(() => muhurtamRequests.filter(r => !r.viewed), [muhurtamRequests]);
    
    const handleSaveAppointment = (newAppointmentData) => { console.log('Parent received data:', newAppointmentData); };
    const handleActionClick = (viewId) => { setActiveView(viewId); setTimeout(() => { contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); };
    const quickActions = [ { id: 'today', name: "Today's Schedule", icon: <FaUserClock />, description: "View all appointments for today." }, { id: 'upcoming', name: 'Upcoming Bookings', icon: <FaRegCalendarAlt />, description: 'See all confirmed future bookings.' }, { id: 'pending', name: 'Pending Requests', icon: <FaListAlt />, description: 'Accept or decline new requests.' }, { id: 'stats', name: 'Pooja Statistics', icon: <FaChartBar />, description: 'Analyze your booking trends.' }, { id: 'events', name: 'Temple Events', icon: <FaBullhorn />, description: 'Announce or manage temple events.'}, { id: 'knowledge', name: 'Knowledge Base', icon: <FaStickyNote />, description: 'Access your personal notes & mantras.' }, ];
    
    const renderActiveView = () => {
        switch (activeView) {
            case 'today': return <BookingsListView title="Today's Appointments" items={todayBookings} />;
            case 'upcoming': return <BookingsListView title="Upcoming Appointments" items={upcomingBookings} />;
            // MODIFIED: Pass the new 'emptyMessage' prop here
            case 'pending': 
                return <BookingsListView 
                            title="Pending Muhurtam Requests" 
                            items={pendingRequests.map(r => ({id: `muhurtam-${r.id}`, poojaType: r.eventName || 'Muhurtam Inquiry', customerName: r.name, contact: r.phone, date: r.date, startTime: r.time, status: 'Pending'}))} 
                            type="request"
                            emptyMessage="Hooray! You've viewed all requests. There are no pending requests at this time."
                        />;
            case 'stats': return <PoojaStatsView stats={stats} transactions={[]} onExport={() => {}} />;
            case 'events': return <ManageTempleEventsView events={templeEvents} onAddEvent={(newEvent) => setTempleEvents(prev => [{...newEvent, id: Date.now(), date: new Date(newEvent.date).toISOString()}, ...prev])}/>;
            case 'knowledge': return <KnowledgeBaseView />;
            default: return <BookingsListView title="Today's Appointments" items={todayBookings} />;
        }
    };
    
    if (isLoading) { return <div className="loading-container">Loading Dashboard...</div>; }

    return (
        <div className="priest-dashboard-container">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
            {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} onSave={handleSaveAppointment} priest={{ firstName: userName }} />}
            <section className="pd-dashboard-section user-summary-section"><h2 className="user-greeting">Namaste, {userName}!</h2><div className="stat-card-grid"><div className="stat-item"><FaCalendarCheck className="stat-icon green" /><span><CountUp end={todayBookings.length} /> Today's Bookings</span></div><div className="stat-item"><FaCalendarAlt className="stat-icon blue" /><span><CountUp end={upcomingBookings.length} /> Upcoming Bookings</span></div><div className="stat-item"><FaBell className="stat-icon orange" /><span><CountUp end={pendingRequests.length} /> Pending Requests</span></div></div></section>
            <section className="pd-dashboard-section cta-section"><h2 className="pd-section-title">Manage Your Schedule</h2><p>Control your availability to receive new bookings or add appointments manually.</p><div className="cta-buttons"><button className="cta-button primary" onClick={() => navigate('/availability-manager')}><FaCalendarDay /> Manage Availability <FaChevronRight className="cta-button-icon" /></button><button className="cta-button secondary" onClick={() => setIsModalOpen(true)}><FaPlus /> Add Manual Booking</button></div></section>
            <section className="pd-dashboard-section quick-actions-section"><h2 className="pd-section-title">Dashboard Actions</h2><div className="quick-actions-grid">{quickActions.map((action) => (<div key={action.id} className="quick-action-card" onClick={() => handleActionClick(action.id)}><div className="quick-action-icon">{action.icon}</div><h3 className="quick-action-title">{action.name}</h3><p className="quick-action-description">{action.description}</p></div>))}</div></section>
            <section ref={contentRef} className="pd-dashboard-section dynamic-content-section">
                 {renderActiveView()}
            </section>
        </div>
    );
};

export default PriestDashboard;