import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isAfter, startOfDay, parseISO, isWithinInterval, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns';
import CountUp from 'react-countup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
    FaCalendarCheck, FaCalendarAlt, FaBell, FaDownload, FaPlus, FaStickyNote,
    FaChartBar, FaUserClock, FaRegCalendarAlt, FaListAlt, FaChevronRight, FaCalendarDay, FaBullhorn
} from 'react-icons/fa';

import './Dashboard.css';

// Import all required components from their separate files
import AppointmentModal from './AppointmentModal';
import KnowledgeBase from './KnowledgeBase';
import PoojaStatsPage from './PoojaStatsPage';
import ManageEventsPage from './ManageEventsPage';

const API_BASE = "http://localhost:8080";

// --- Helper function to parse price strings ---
const parsePrice = (priceString) => {
    if (!priceString || typeof priceString !== 'string') return 0;
    const cleanedString = priceString.replace(/\$/g, '').trim();
    if (cleanedString.includes('-')) {
        const parts = cleanedString.split('-').map(part => parseFloat(part.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return (parts[0] + parts[1]) / 2;
        }
    } else {
        const price = parseFloat(cleanedString);
        return isNaN(price) ? 0 : price;
    }
    return 0;
};

// --- A local sub-component, as it's used for multiple views ---
const BookingsListView = ({ title, items, type, emptyMessage }) => {
    if (!items || items.length === 0) {
        if (emptyMessage) {
            return ( <div className="pd-no-data"> <FaCalendarCheck className="no-data-icon" /> <p>{emptyMessage}</p> </div> );
        }
        return <div className="pd-no-data"><p>No {type} found for this view.</p></div>;
    }
    return (
        <div>
            <h3 className="pd-section-title">{title}</h3>
            <div className="pd-list-container">
                {items.map(item => (
                    <div key={item.id} className="pd-card booking-card">
                        <div className="pd-card-header">
                            <h4 className="pd-card-title">{item.poojaType}</h4>
                            {item.status && <span className={`pd-status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>}
                        </div>
                        <div className="pd-card-body">
                            <p><strong>Customer:</strong> {item.customerName}</p>
                            <p><strong>Contact:</strong> {item.contact}</p>
                            <p><strong>Date:</strong> {item.date ? format(parseISO(item.date), 'EEE, MMM d, yyyy') : 'N/A'}</p>
                            {item.startTime && <p><strong>Time:</strong> {item.startTime}</p>}
                        </div>
                        {type === 'request' && (
                            <div className="pd-card-actions">
                                <button className="pd-action-btn primary">Accept</button>
                                <button className="pd-action-btn danger">Decline</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const PriestDashboard = () => {
    const navigate = useNavigate();
    const contentRef = useRef(null);
    
    // UI State
    const [activeView, setActiveView] = useState('today');
    const [userName, setUserName] = useState("Priest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Data State
    const [allAppointments, setAllAppointments] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [stats, setStats] = useState({ week: 0, month: 0, year: 0, topPoojas: [], weekEarnings: 0, monthEarnings: 0, yearEarnings: 0 });
    const [templeEvents, setTempleEvents] = useState([]);
    const [knowledgeBaseContent, setKnowledgeBaseContent] = useState(`<h2>My Personal Notes</h2><p>Start writing here...</p>`);

    useEffect(() => {
        const priestId = localStorage.getItem('userId');
        const storedFirstName = localStorage.getItem('firstName') || 'Priest';
        setUserName(storedFirstName);
        if (!priestId) {
            toast.error("Priest ID not found. Please log in again.");
            setIsLoading(false);
            return;
        }

        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [bookingRes, manualAppointmentRes, muhurtamRes, eventsRes, kbRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/muhurtam/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/events`),
                    axios.get(`${API_BASE}/api/knowledgebase/${priestId}`)
                ]);

                const priceMap = (eventsRes.data || []).reduce((map, event) => { map[event.name] = event.estimatedPrice; return map; }, {});
                
                const customerBookings = (bookingRes.data || []).map(b => ({ id: `booking-${b.id}`, poojaType: b.eventName || 'Event Booking', customerName: b.name, contact: b.phone, date: b.date, startTime: b.start, status: b.status, price: parsePrice(priceMap[b.eventName]) }));
                const manualAppointments = (manualAppointmentRes.data || []).map(m => ({ id: `manual-${m.id}`, poojaType: m.eventName || m.events || 'Manual Entry', customerName: m.name, contact: m.phone, date: m.start ? format(parseISO(m.start), 'yyyy-MM-dd') : null, startTime: m.start ? format(parseISO(m.start), 'hh:mm a') : null, status: 'Confirmed', price: parsePrice(priceMap[m.eventName || m.events]) }));
                
                const combinedAppointments = [...customerBookings, ...manualAppointments];
                setAllAppointments(combinedAppointments);
                setMuhurtamRequests(muhurtamRes.data || []);
                setTempleEvents(eventsRes.data || []);
                setKnowledgeBaseContent(kbRes.data || `<h2>My Personal Notes</h2><p>Click 'Edit' to start.</p>`);

                const allConfirmed = combinedAppointments.filter(b => b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED');
                const now = new Date();
                const poojasThisWeek = allConfirmed.filter(b => b.date && isWithinInterval(parseISO(b.date), { start: startOfWeek(now), end: endOfWeek(now) }));
                const poojasThisMonth = allConfirmed.filter(b => b.date && parseISO(b.date).getMonth() === now.getMonth() && parseISO(b.date).getFullYear() === now.getFullYear());
                const poojasThisYear = allConfirmed.filter(b => b.date && parseISO(b.date).getFullYear() === now.getFullYear());
                const weekEarnings = poojasThisWeek.reduce((sum, b) => sum + (b.price || 0), 0);
                const monthEarnings = poojasThisMonth.reduce((sum, b) => sum + (b.price || 0), 0);
                const yearEarnings = poojasThisYear.reduce((sum, b) => sum + (b.price || 0), 0);
                const poojaCounts = allConfirmed.reduce((acc, b) => { const name = b.poojaType || 'Unknown'; acc[name] = (acc[name] || 0) + 1; return acc; }, {});
                const topPoojas = Object.entries(poojaCounts).sort(([,a],[,b]) => b-a).slice(0, 3).map(([name, count]) => ({ name, count }));

                setStats({ week: poojasThisWeek.length, month: poojasThisMonth.length, year: poojasThisYear.length, topPoojas, weekEarnings, monthEarnings, yearEarnings });
            } catch (error) {
                toast.error("Failed to load dashboard data.");
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);
    
    const todayBookings = useMemo(() => allAppointments.filter(b => b.date && isToday(parseISO(b.date)) && (b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED')), [allAppointments]);
    const upcomingBookings = useMemo(() => allAppointments.filter(b => b.date && isAfter(startOfDay(parseISO(b.date)), startOfDay(new Date())) && (b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED')), [allAppointments]);
    const pendingRequests = useMemo(() => muhurtamRequests.filter(r => !r.viewed), [muhurtamRequests]);
    
    const handleSaveAppointment = () => { /* Logic to refresh data would go here */ };
    const handleActionClick = (viewId) => { setActiveView(viewId); setTimeout(() => { contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); };
    const handleDownloadReport = () => { /* ... CSV download logic ... */ };

    const quickActions = [
        { id: 'today', name: "Today's Schedule", icon: <FaUserClock />, description: "View all appointments for today." },
        { id: 'upcoming', name: 'Upcoming Bookings', icon: <FaRegCalendarAlt />, description: 'See all confirmed future bookings.' },
        { id: 'pending', name: 'Pending Requests', icon: <FaListAlt />, description: 'Accept or decline new requests.' },
        { id: 'stats', name: 'Pooja Statistics', icon: <FaChartBar />, description: 'Analyze your booking trends.' },
        { id: 'events', name: 'Temple Events', icon: <FaBullhorn />, description: 'Announce or manage temple events.'},
        { id: 'knowledge', name: 'Knowledge Base', icon: <FaStickyNote />, description: 'Access your personal notes & mantras.' },
    ];
    
    const renderActiveView = () => {
        switch (activeView) {
            case 'today': return <BookingsListView title="Today's Appointments" items={todayBookings} type="booking"/>;
            case 'upcoming': return <BookingsListView title="Upcoming Appointments" items={upcomingBookings} type="booking"/>;
            case 'pending': return <BookingsListView title="Pending Muhurtam Requests" items={pendingRequests.map(r => ({id: `muhurtam-${r.id}`, poojaType: r.eventName || 'Muhurtam Inquiry', customerName: r.name, contact: r.phone, date: r.date, startTime: r.time, status: 'Pending'}))} type="request" emptyMessage="Hooray! You've viewed all requests." />;
            case 'stats': return <PoojaStatsPage stats={stats} onExport={handleDownloadReport} />;
            case 'events': return <ManageEventsPage events={templeEvents} onAddEvent={(newEvent) => setTempleEvents(prev => [{...newEvent, id: Date.now(), date: new Date(newEvent.date).toISOString()}, ...prev])}/>;
            case 'knowledge': return <KnowledgeBase content={knowledgeBaseContent} onSave={setKnowledgeBaseContent} />;
            default: return <BookingsListView title="Today's Appointments" items={todayBookings} type="booking"/>;
        }
    };
    
    if (isLoading) { return <div className="loading-container">Loading Dashboard...</div>; }

    return (
        <div className="priest-dashboard-container">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
            {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} onSave={handleSaveAppointment} priest={{ firstName: userName }} />}
            
            <section className="pd-dashboard-section user-summary-section">
                <h2 className="user-greeting">Namaste, {userName}!</h2>
                <div className="stat-card-grid">
                    <div className="stat-item"><FaCalendarCheck className="stat-icon green" /><span><CountUp end={todayBookings.length} /> Today's Bookings</span></div>
                    <div className="stat-item"><FaCalendarAlt className="stat-icon blue" /><span><CountUp end={upcomingBookings.length} /> Upcoming Bookings</span></div>
                    <div className="stat-item"><FaBell className="stat-icon orange" /><span><CountUp end={pendingRequests.length} /> Pending Requests</span></div>
                </div>
            </section>
            
            <section className="pd-dashboard-section cta-section">
                <h2 className="pd-section-title">Manage Your Schedule</h2>
                <p>Control your availability to receive new bookings or add appointments manually.</p>
                <div className="cta-buttons">
                    <button className="cta-button primary" onClick={() => navigate('/availability-manager')}><FaCalendarDay /> Manage Availability <FaChevronRight className="cta-button-icon" /></button>
                    <button className="cta-button secondary" onClick={() => setIsModalOpen(true)}><FaPlus /> Add Manual Booking</button>
                </div>
            </section>
            
            <section className="pd-dashboard-section quick-actions-section">
                <h2 className="pd-section-title">Dashboard Actions</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action) => (
                        <div key={action.id} className="quick-action-card" onClick={() => handleActionClick(action.id)}>
                            <div className="quick-action-icon">{action.icon}</div>
                            <h3 className="quick-action-title">{action.name}</h3>
                            <p className="quick-action-description">{action.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            
            <section ref={contentRef} className="pd-dashboard-section dynamic-content-section">
                 {renderActiveView()}
            </section>
        </div>
    );
};

export default PriestDashboard;