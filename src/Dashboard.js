import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isAfter, startOfDay, parseISO } from 'date-fns';
import CountUp from 'react-countup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
    FaCalendarCheck, FaCalendarAlt, FaBell, FaPlus, FaStickyNote,
    FaChartBar, FaUserClock, FaRegCalendarAlt, FaListAlt, FaChevronRight, 
    FaCalendarDay, FaBullhorn, FaCopy, FaEye, FaStar, FaOm, FaClock, FaDharmachakra, FaEdit
} from 'react-icons/fa';

import './Dashboard.css';

import AppointmentModal from './AppointmentModal';
import KnowledgeBase from './KnowledgeBase';
import PoojaStatsPage from './PoojaStatsPage';
import ManageEventsPage from './ManageEventsPage';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== 'string') return null;
  const [hours, minutes] = timeString.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

const DashboardCard = ({ item, type, onNavigate }) => {
    const isRequest = type === 'request';
    return (
        <div className={`db-ritual-card ${isRequest ? 'request-link' : ''}`} onClick={isRequest ? onNavigate : null}>
            <div className="db-card-main">
                <div className="db-card-header">
                    <h4>{item.poojaType}</h4>
                    {item.status && <span className={`status-pill status-${item.status.toLowerCase()}`}>{item.status}</span>}
                </div>
                <div className="db-card-body-grid">
                    <div className="db-info-item"><label>CLIENT</label><p>{item.customerName}</p></div>
                    <div className="db-info-item"><label>SCHEDULE</label><p>{item.date ? format(parseISO(item.date), 'MMM dd, yyyy') : 'TBD'}</p></div>
                    <div className="db-info-item"><label>TIME</label><p>{item.startTime || 'Standard'}</p></div>
                    <div className="db-info-item"><label>CONTACT</label><p>{item.contact}</p></div>
                </div>
            </div>
            {isRequest && <div className="db-card-footer"><span>View Request</span> <FaChevronRight /></div>}
        </div>
    );
};

const PriestDashboard = () => {
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const priestId = localStorage.getItem('userId');
    const profileUrl = `${window.location.origin}/priests/${priestId}`;
    
    const [activeView, setActiveView] = useState('today');
    const [userName, setUserName] = useState(localStorage.getItem('firstName') || "Priest");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [todayTimings, setTodayTimings] = useState(null);
    const [copySuccess, setCopySuccess] = useState('');

    const [allAppointments, setAllAppointments] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [stats, setStats] = useState({ week: 0, month: 0, year: 0 });
    const [templeEvents, setTempleEvents] = useState([]);
    const [knowledgeBaseContent, setKnowledgeBaseContent] = useState('');

    useEffect(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [bookingRes, manualRes, muhurtamRes, eventsRes, kbRes, sunRes, dailyRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/muhurtam/priest/${priestId}`),
                    axios.get(`${API_BASE}/api/events`),
                    axios.get(`${API_BASE}/api/knowledgebase/${priestId}`),
                    fetch(`${API_BASE}/api/sun?date=${todayStr}`).then(r => r.json()),
                    fetch(`${API_BASE}/api/daily-times/by-date=${todayStr}`).then(r => r.json())
                ]);

                const bookings = (bookingRes.data || []).map(b => ({ ...b, id: `b-${b.id}`, poojaType: b.eventName, customerName: b.name, contact: b.phone, date: b.date, startTime: b.start }));
                const manual = (manualRes.data || []).map(m => ({ ...m, id: `m-${m.id}`, poojaType: m.eventName || m.events, customerName: m.name, contact: m.phone, date: m.start ? m.start.split('T')[0] : null, startTime: m.start ? format(parseISO(m.start), 'hh:mm a') : null, status: 'Confirmed' }));
                
                setAllAppointments([...bookings, ...manual]);
                setMuhurtamRequests((muhurtamRes.data || []).map(r => ({ ...r, id: `muh-${r.id}`, poojaType: 'Muhurtam Request', customerName: r.name, contact: r.phone })));
                setTempleEvents(eventsRes.data || []);
                setKnowledgeBaseContent(kbRes.data || '');
                setTodayTimings({ ...sunRes, ...dailyRes });
            } catch (err) {
                toast.error("Dashboard synchronization error.");
            } finally {
                setIsLoading(false);
            }
        };
        if(priestId) fetchData();
    }, [priestId]);

    const todayBookings = useMemo(() => allAppointments.filter(b => b.date && isToday(parseISO(b.date)) && b.status?.toUpperCase() !== 'REJECTED'), [allAppointments]);
    const upcomingBookings = useMemo(() => allAppointments.filter(b => b.date && isAfter(parseISO(b.date), startOfDay(new Date())) && (b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED')), [allAppointments]);
    
    // FIX: Unified name for the ESLINT error
    const pendingRequests = useMemo(() => {
        const pBookings = allAppointments.filter(b => b.status?.toUpperCase() === 'PENDING');
        return [...pBookings, ...muhurtamRequests];
    }, [allAppointments, muhurtamRequests]);

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopySuccess('Copied!');
        setTimeout(() => setCopySuccess(''), 2000);
    };

    const handleTabChange = (view) => {
        setActiveView(view);
        if (contentRef.current) {
            const yOffset = -100; 
            const element = contentRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    if (isLoading) return <div className="priest-loader">Synchronizing Divine Workspace...</div>;

    return (
        <div className="db-page-wrapper">
            <ToastContainer position="bottom-right" theme="colored"/>
            
            <section className="db-hero">
                <div className="db-hero-content">
                    <h1>Namaste, {userName}</h1>
                    <p>Professional Administrative Suite & Vedic Insights</p>
                </div>
            </section>

            <div className="db-main-container">
                <div className="db-grid-layout">
                    
                    {/* LEFT COLUMN: STICKY */}
                    <aside className="db-column db-sticky-sidebar">
                        <div className="db-content-card">
                            <div className="db-card-head"><FaChartBar /> <h2>Performance</h2></div>
                            <div className="priest-mini-stats">
                                <div className={`m-stat ${activeView === 'today' ? 'm-active' : ''}`} onClick={() => handleTabChange('today')}>
                                    <label>Today</label>
                                    <strong>{todayBookings.length}</strong>
                                </div>
                                <div className={`m-stat ${activeView === 'pending' ? 'm-active' : ''}`} onClick={() => handleTabChange('pending')}>
                                    <label>Requests</label>
                                    <strong className="txt-orange">{pendingRequests.length}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="db-content-card profile-card">
                            <h3>Public Profile Link</h3>
                            <p className="side-p">Share with customers for direct bookings.</p>
                            <div className="mini-link-box">
                                <input readOnly value={profileUrl} />
                                <button onClick={handleCopy}><FaCopy /></button>
                            </div>
                            {copySuccess && <span className="copy-notif">{copySuccess}</span>}
                        </div>
                    </aside>

                    {/* CENTER COLUMN: SCROLLABLE */}
                    <main className="db-column center-col">
                        <div className="db-tile-row">
                            <div className="db-tile db-saffron" onClick={() => navigate('/availability-manager')}>
                                <FaCalendarDay className="db-tile-icon" />
                                <h3>Availability</h3>
                                <p>Manage your schedule.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                            <div className="db-tile db-gold" onClick={() => setIsModalOpen(true)}>
                                <FaPlus className="db-tile-icon" />
                                <h3>Manual Booking</h3>
                                <p>Record an appointment.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                            <div className={`db-tile db-charcoal ${activeView === 'stats' ? 'tile-active' : ''}`} onClick={() => handleTabChange('stats')}>
                                <FaChartBar className="db-tile-icon" />
                                <h3>Earnings</h3>
                                <p>Insights & Trends.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                        </div>

                        <div className="priest-view-container" ref={contentRef}>
                            <div className="priest-view-header">
                                <h2>{activeView.replace('-', ' ').toUpperCase()} VIEW</h2>
                            </div>
                            
                            <div className={`view-content-wrapper ${['stats', 'events', 'knowledge'].includes(activeView) ? 'full-page-mode' : 'grid-mode'}`}>
                                {activeView === 'today' && (
                                    todayBookings.length > 0 ? 
                                    todayBookings.map(item => <DashboardCard key={item.id} item={item} />) : 
                                    <div className="empty-state">No ritual tasks for today.</div>
                                )}
                                {activeView === 'upcoming' && (
                                    upcomingBookings.length > 0 ? 
                                    upcomingBookings.map(item => <DashboardCard key={item.id} item={item} />) : 
                                    <div className="empty-state">No future bookings confirmed.</div>
                                )}
                                {activeView === 'pending' && (
                                    pendingRequests.length > 0 ? 
                                    pendingRequests.map(item => <DashboardCard key={item.id} item={item} type="request" onNavigate={() => navigate('/requests')} />) : 
                                    <div className="empty-state">Action center is clear.</div>
                                )}
                                
                                {activeView === 'stats' && <PoojaStatsPage stats={stats} />}
                                {activeView === 'events' && <ManageEventsPage events={templeEvents} />}
                                {activeView === 'knowledge' && (
                                    <div className="rich-editor-container">
                                        <div className="editor-header-hint"><FaEdit /> Digital Mantra Bank</div>
                                        <KnowledgeBase content={knowledgeBaseContent} onSave={(val) => setKnowledgeBaseContent(val)} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </main>

                    {/* RIGHT COLUMN: STICKY PANCHANG */}
                    <aside className="db-column db-sticky-sidebar">
                        <div className="db-panchang-card">
                            <div className="db-p-header">
                                <h3>Panchang Today</h3>
                                <span>{format(new Date(), 'EEEE, MMM do')}</span>
                            </div>
                            <div className="db-p-body">
                                <div className="db-sun-row">
                                    <div className="db-p-unit"><label>SUNRISE</label><strong>{formatTime12Hour(todayTimings?.sunrise) || '07:09 AM'}</strong></div>
                                    <div className="db-p-unit"><label>SUNSET</label><strong>{formatTime12Hour(todayTimings?.sunset) || '07:50 PM'}</strong></div>
                                </div>
                                <div className="db-astro-row">
                                    <div className="db-astro-item"><label><FaStar /> NAKSHATRAM</label><p>{todayTimings?.nakshatram || "---"}</p></div>
                                    <div className="db-astro-item"><label><FaOm /> TITHI</label><p>{todayTimings?.tithi || "---"}</p></div>
                                </div>
                                <div className="db-kalam-box">
                                    <div className="db-k-row"><label>RAHU KALAM</label><p>{todayTimings?.rahukalamStart ? `${formatTime12Hour(todayTimings.rahukalamStart)} - ${formatTime12Hour(todayTimings.rahukalamEnd)}` : "--- : ---"}</p></div>
                                    <div className="db-k-row"><label>YAMAGANDAM</label><p>{todayTimings?.yamagandamStart ? `${formatTime12Hour(todayTimings.yamagandamStart)} - ${formatTime12Hour(todayTimings.yamagandamEnd)}` : "--- : ---"}</p></div>
                                </div>
                            </div>
                        </div>

                        <div className="db-content-card action-list">
                            <div className="db-card-head"><FaDharmachakra /> <h2>Tools</h2></div>
                            <button className={`s-link ${activeView === 'upcoming' ? 's-active' : ''}`} onClick={() => handleTabChange('upcoming')}><FaRegCalendarAlt /> Full Calendar</button>
                            <button className={`s-link ${activeView === 'events' ? 's-active' : ''}`} onClick={() => handleTabChange('events')}><FaBullhorn /> Manage Events</button>
                            <button className={`s-link ${activeView === 'knowledge' ? 's-active' : ''}`} onClick={() => handleTabChange('knowledge')}><FaStickyNote /> Mantra Notes</button>
                        </div>
                    </aside>
                </div>
            </div>

            {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} onSave={() => window.location.reload()} priest={{ id: priestId, firstName: userName }} />}
        </div>
    );
};

export default PriestDashboard;