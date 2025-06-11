// Filename: PriestDashboard.js - FINAL CORRECTED VERSION
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isAfter, startOfDay, parseISO } from 'date-fns';
import CountUp from 'react-countup';
import {
    FaCalendarCheck, FaCalendarAlt, FaBell, FaDownload, FaPlus, FaStickyNote,
    FaChartBar, FaUserClock, FaRegCalendarAlt, FaListAlt, FaChevronRight, FaCalendarDay, FaTimes, FaBullhorn
} from 'react-icons/fa';
import './Dashboard.css';
import AppointmentModal from './AppointmentModal';



  
// --- (Other sub-components) ---
const BookingsListView = ({ title, items, type = 'booking' }) => { if (!items || items.length === 0) { return <div className="pd-no-data">No {type === 'booking' ? 'bookings' : 'requests'} for this view.</div>; } return ( <div> <h3 className="pd-section-title">{title}</h3> <div className="pd-list-container"> {items.map(item => ( <div key={item.id} className="pd-card booking-card"> <div className="pd-card-header"> <h4 className="pd-card-title">{item.poojaType}</h4> {type === 'booking' && <span className={`pd-status-badge status-${item.status.toLowerCase()}`}>{item.status}</span>} </div> <div className="pd-card-body"> <p><strong>Customer:</strong> {item.customerName} {item.contact ? `(${item.contact})` : ''}</p> <p><strong>Date:</strong> {format(parseISO(item.date), 'EEE, MMM d, yyyy')}</p> {item.startTime && <p><strong>Time:</strong> {item.startTime}</p>} </div> {type === 'request' && ( <div className="pd-card-actions"> <button className="pd-action-btn primary" onClick={() => alert(`Accepted request ${item.id}`)}>Accept</button> <button className="pd-action-btn danger" onClick={() => alert(`Declined request ${item.id}`)}>Decline</button> </div> )} </div> ))} </div> </div> ); };
const PoojaStatsView = ({ stats, transactions, onExport }) => ( <div> <h3 className="pd-section-title">Pooja & Financial Statistics</h3> <div className="pd-stats-grid"> <div className="pd-stats-section"><h4 className="pd-subsection-title">Booking Totals</h4><div className="pd-stat-item"><span>This Week</span><span>{stats.week}</span></div><div className="pd-stat-item"><span>This Month</span><span>{stats.month}</span></div><div className="pd-stat-item"><span>This Year</span><span>{stats.year}</span></div></div> <div className="pd-stats-section"><h4 className="pd-subsection-title">Top Booked Poojas</h4>{stats.topPoojas.map((pooja, index) => (<div className="pd-stat-item" key={index}><span>{pooja.name}</span><span>{pooja.count}</span></div>))}</div> <div className="pd-stats-section"><div className="pd-section-header"><h4 className="pd-subsection-title">Financial Summary</h4><button className="pd-action-btn secondary small" onClick={onExport}><FaDownload /> Export</button></div><div className="pd-stat-item"><span>Income (Month)</span><span className="value-green">${transactions.reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span></div><div className="pd-stat-item"><span>Pending</span><span className="value-orange">${transactions.filter(t=>t.status==='Pending').reduce((acc, t) => acc + t.amount, 0).toFixed(2)}</span></div></div> </div> </div> );
const KnowledgeBaseView = () => { const [notes, setNotes] = useState("ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्।"); return ( <div> <h3 className="pd-section-title">Knowledge Base</h3> <div className="pd-notes-section"><h4 className="pd-subsection-title">Personal Mantra/Notes Library</h4><textarea className="pd-notes-textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Type your important mantras, shlokas, or notes here..." /></div> </div> ); };
const ManageTempleEventsView = ({ events, onAddEvent }) => { const [showAddForm, setShowAddForm] = useState(false); const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', description: '' }); const handleFormChange = (e) => { const { name, value } = e.target; setNewEvent(prev => ({ ...prev, [name]: value })); }; const handleFormSubmit = (e) => { e.preventDefault(); onAddEvent(newEvent); alert(`Event "${newEvent.title}" announced!`); setNewEvent({ title: '', date: '', location: '', description: '' }); setShowAddForm(false); }; return ( <div> <div className="pd-section-header"> <h3 className="pd-section-title">Announce Temple Events</h3> <button className="pd-action-btn primary" onClick={() => setShowAddForm(!showAddForm)}> {showAddForm ? 'Cancel' : 'Announce New Event'} </button> </div> {showAddForm && ( <form onSubmit={handleFormSubmit} className="add-event-form"> <input type="text" name="title" placeholder="Event Title (e.g., Ganesh Chaturthi)" value={newEvent.title} onChange={handleFormChange} required /> <input type="date" name="date" value={newEvent.date} onChange={handleFormChange} required /> <input type="text" name="location" placeholder="Location (e.g., Main Prayer Hall)" value={newEvent.location} onChange={handleFormChange} required /> <textarea name="description" placeholder="Brief description of the event..." value={newEvent.description} onChange={handleFormChange} required /> <button type="submit">Announce Event</button> </form> )} <div className="event-manage-list"> {events.map(event => ( <div key={event.id} className="pd-card event-manage-card"> <div className="event-date-box"> <span className="event-month">{format(parseISO(event.date), 'MMM')}</span> <span className="event-day">{format(parseISO(event.date), 'd')}</span> </div> <div className="event-details"> <div className="event-details-header"> <h4 className="pd-card-title">{event.title}</h4> <div className="pd-card-actions"> <button className="pd-action-btn secondary small">Edit</button> <button className="pd-action-btn danger">Cancel</button> </div> </div> <p className="event-location">{event.location}</p> <p className="event-description">{event.description}</p> </div> </div> ))} </div> </div> ); };


// --- Main Dashboard Component ---
const PriestDashboard = () => {
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const [activeView, setActiveView] = useState('today');
    const [userName, setUserName] = useState("Priest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [stats, setStats] = useState({ week: 0, month: 0, year: 0, topPoojas: [] });
    const [transactions, setTransactions] = useState([]);
    const [templeEvents, setTempleEvents] = useState([]);

    useEffect(() => { const storedFirstName = localStorage.getItem('firstName') || 'Priest'; setUserName(storedFirstName); const mockData = getMockData(); setBookings(mockData.bookings); setPendingRequests(mockData.pendingRequests); setStats(mockData.stats); setTransactions(mockData.transactions); setTempleEvents(mockData.templeEvents); }, []);
    
    const todayBookings = useMemo(() => bookings.filter(b => isToday(parseISO(b.date))), [bookings]);
    const upcomingBookings = useMemo(() => bookings.filter(b => isAfter(startOfDay(parseISO(b.date)), startOfDay(new Date()))), [bookings]);
    const downloadFinancialsCSV = () => { /* ... */ };
    const handleActionClick = (viewId) => { setActiveView(viewId); setTimeout(() => { contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100); };
    const handleSaveAppointment = (newAppointmentData) => { console.log('Parent received data:', newAppointmentData); };
    
    const quickActions = [ { id: 'today', name: "Today's Schedule", icon: <FaUserClock />, description: "View all appointments for today." }, { id: 'upcoming', name: 'Upcoming Bookings', icon: <FaRegCalendarAlt />, description: 'See all confirmed future bookings.' }, { id: 'pending', name: 'Pending Requests', icon: <FaListAlt />, description: 'Accept or decline new requests.' }, { id: 'stats', name: 'Pooja Statistics', icon: <FaChartBar />, description: 'Analyze your booking trends.' }, { id: 'events', name: 'Temple Events', icon: <FaBullhorn />, description: 'Announce or manage temple events.'}, { id: 'knowledge', name: 'Knowledge Base', icon: <FaStickyNote />, description: 'Access your personal notes & mantras.' }, ];
    const renderActiveView = () => { switch (activeView) { case 'today': return <BookingsListView title="Today's Appointments" items={todayBookings} />; case 'upcoming': return <BookingsListView title="Upcoming Appointments" items={upcomingBookings} />; case 'pending': return <BookingsListView title="Pending Booking Requests" items={pendingRequests} type="request" />; case 'stats': return <PoojaStatsView stats={stats} transactions={transactions} onExport={downloadFinancialsCSV} />; case 'events': return <ManageTempleEventsView events={templeEvents} onAddEvent={(newEvent) => setTempleEvents(prev => [{...newEvent, id: Date.now(), date: new Date(newEvent.date).toISOString()}, ...prev])}/>; case 'knowledge': return <KnowledgeBaseView />; default: return <BookingsListView title="Today's Appointments" items={todayBookings} />; } };

    return (
        <div className="priest-dashboard-container">
            {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} onSave={handleSaveAppointment} />}
            <section className="pd-dashboard-section user-summary-section"><h2 className="user-greeting">Namaste, {userName}!</h2><div className="stat-card-grid"><div className="stat-item"><FaCalendarCheck className="stat-icon green" /><span><CountUp end={todayBookings.length} /> Today's Bookings</span></div><div className="stat-item"><FaCalendarAlt className="stat-icon blue" /><span><CountUp end={upcomingBookings.length} /> Upcoming Bookings</span></div><div className="stat-item"><FaBell className="stat-icon orange" /><span><CountUp end={pendingRequests.length} /> Pending Requests</span></div></div></section>
            <section className="pd-dashboard-section cta-section">
                <h2 className="pd-section-title">Manage Your Schedule</h2>
                <p>Control your availability to receive new bookings or add appointments manually.</p>
                <div className="cta-buttons">
                    <button className="cta-button primary" onClick={() => navigate('/availability-manager')}><FaCalendarDay /> Manage Availability <FaChevronRight className="cta-button-icon" /></button>
                    {/* THIS IS THE CORRECTED LINE */}
                    <button className="cta-button secondary" onClick={() => setIsModalOpen(true)}>
                        <FaPlus /> Add Manual Booking
                    </button>
                </div>
            </section>
            <section className="pd-dashboard-section quick-actions-section"><h2 className="pd-section-title">Dashboard Actions</h2><div className="quick-actions-grid">{quickActions.map((action) => (<div key={action.id} className="quick-action-card" onClick={() => handleActionClick(action.id)}><div className="quick-action-icon">{action.icon}</div><h3 className="quick-action-title">{action.name}</h3><p className="quick-action-description">{action.description}</p></div>))}</div></section>
            <section ref={contentRef} className="pd-dashboard-section dynamic-content-section">
                 {renderActiveView()}
            </section>
        </div>
    );
};

export default PriestDashboard;

// Mock Data Function
const getMockData = () => { const todayStr = new Date().toISOString(); const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); const tomorrowStr = tomorrow.toISOString(); return { bookings: [ { id: 1, date: todayStr, poojaType: 'Ganesh Pooja', customerName: 'Rohan Sharma', contact: '123-456-7890', startTime: '09:00 AM', status: 'Upcoming' }, { id: 2, date: todayStr, poojaType: 'Satyanarayan Puja', customerName: 'Priya Patel', contact: '234-567-8901', startTime: '05:00 PM', status: 'In Progress' }, { id: 3, date: tomorrowStr, poojaType: 'Griha Pravesh', customerName: 'Amit Singh', contact: '345-678-9012', startTime: '11:00 AM', status: 'Upcoming' }], pendingRequests: [ { id: 201, date: '2025-06-25T10:00:00.000Z', poojaType: 'Vastu Shanti', customerName: 'Neha Desai' }, { id: 202, date: '2025-06-28T10:00:00.000Z', poojaType: 'Birthday Havan', customerName: 'Vikram Mehta' } ], stats: { week: 5, month: 22, year: 150, topPoojas: [{ name: 'Satyanarayan Puja', count: 45 }, { name: 'Ganesh Pooja', count: 30 }, { name: 'Vastu Shanti', count: 20 }] }, transactions: [ { id: 301, date: '2025-06-02T10:00:00.000Z', customerName: 'Rohan Sharma', poojaType: 'Vastu Shanti', amount: 251.00, status: 'Paid' }, { id: 302, date: '2025-06-05T10:00:00.000Z', customerName: 'Priya Patel', poojaType: 'Navagraha Pooja', amount: 201.00, status: 'Paid' }, { id: 303, date: '2025-06-08T10:00:00.000Z', customerName: 'Amit Singh', poojaType: 'Car Pooja', amount: 151.00, status: 'Pending' } ], templeEvents: [ { id: 10, title: 'Ganesh Chaturthi Celebration', date: '2025-08-29T18:00:00.000Z', location: 'Main Prayer Hall', description: 'Join us for special aarti and prasad distribution.' }, { id: 11, title: 'Diwali Mela', date: '2025-10-21T11:00:00.000Z', location: 'Temple Grounds', description: 'A festive fair with stalls, food, and cultural programs.' }, ] }; };