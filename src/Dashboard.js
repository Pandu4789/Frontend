import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, isToday, isAfter, startOfDay, parseISO } from 'date-fns';
import CountUp from 'react-countup';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import {
    FaCalendarCheck, FaCalendarAlt, FaBell, FaPlus, FaStickyNote,
    FaChartBar, FaUserClock, FaRegCalendarAlt, FaListAlt, FaChevronRight, 
    FaCalendarDay, FaBullhorn, FaCopy, FaEye, FaStar, FaOm, FaClock, 
    FaDharmachakra, FaEdit, FaCheck, FaTimes, FaInfoCircle, FaMapMarkerAlt,
    FaUserTie, FaPhoneAlt, FaEnvelope
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

// --- Standard Ritual Card for Today/Upcoming ---
const DashboardCard = ({ item }) => (
    <div className="db-ritual-card">
        <div className="db-card-main">
            <div className="db-card-header">
                <h4>{item.poojaType}</h4>
                <span className={`status-pill status-${item.status?.toLowerCase()}`}>{item.status}</span>
            </div>
            <div className="db-card-body-grid">
                <div className="db-info-item"><label>CLIENT</label><p>{item.customerName}</p></div>
                <div className="db-info-item"><label>SCHEDULE</label><p>{item.date ? format(parseISO(item.date), 'MMM dd, yyyy') : 'TBD'}</p></div>
                <div className="db-info-item"><label>TIME</label><p>{item.startTime || 'Standard'}</p></div>
                <div className="db-info-item"><label>CONTACT</label><p>{item.contact}</p></div>
            </div>
        </div>
    </div>
);

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
    const [copySuccess, setCopySuccess] = useState(false);

    const [allAppointments, setAllAppointments] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [stats, setStats] = useState({ week: 0, month: 0, year: 0 });
    const [templeEvents, setTempleEvents] = useState([]);
    const [knowledgeBaseContent, setKnowledgeBaseContent] = useState('');

    // Overlay State
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchData = async () => {
        const todayStr = new Date().toISOString().split('T')[0];
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

            const bookings = (bookingRes.data || []).map(b => ({ ...b, id: b.id, type: 'BOOKING', poojaType: b.eventName, customerName: b.name, contact: b.phone, date: b.date, startTime: b.start }));
            const manual = (manualRes.data || []).map(m => ({ ...m, id: m.id, type: 'MANUAL', poojaType: m.eventName || m.events, customerName: m.name, contact: m.phone, date: m.start ? m.start.split('T')[0] : null, startTime: m.start ? format(parseISO(m.start), 'hh:mm a') : null, status: 'Confirmed' }));
            
            setAllAppointments([...bookings, ...manual]);
            setMuhurtamRequests((muhurtamRes.data || []).map(r => ({ ...r, id: r.id, type: 'MUHURTAM', poojaType: r.eventName || 'Muhurtam Request', customerName: r.name, contact: r.phone })));
            setTempleEvents(eventsRes.data || []);
            setKnowledgeBaseContent(kbRes.data || '');
            setTodayTimings({ ...sunRes, ...dailyRes });
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if(priestId) fetchData();
    }, [priestId]);

    const todayBookings = useMemo(() => allAppointments.filter(b => b.date && isToday(parseISO(b.date)) && b.status?.toUpperCase() !== 'REJECTED'), [allAppointments]);
    const upcomingBookings = useMemo(() => allAppointments.filter(b => b.date && isAfter(parseISO(b.date), startOfDay(new Date())) && (b.status?.toUpperCase() === 'ACCEPTED' || b.status?.toUpperCase() === 'CONFIRMED')), [allAppointments]);
    const pendingRequests = useMemo(() => {
        const pBookings = allAppointments.filter(b => b.status?.toUpperCase() === 'PENDING').map(b => ({ ...b, type: 'BOOKING' }));
        const pMuhurtams = muhurtamRequests.filter(r => !r.viewed).map(r => ({ ...r, type: 'MUHURTAM' }));
        return [...pBookings, ...pMuhurtams];
    }, [allAppointments, muhurtamRequests]);

   const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopySuccess(true); 
    setTimeout(() => setCopySuccess(false), 2000);
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

    const handleAction = async (actionType) => {
        if (!selectedRequest) return;
        setIsActionLoading(true);
        try {
            if (selectedRequest.type === 'MUHURTAM') {
                await axios.put(`${API_BASE}/api/muhurtam/${selectedRequest.id}/viewed`, { viewed: true });
                toast.info("Muhurtam inquiry marked as viewed.");
            } else {
                const endpoint = actionType === 'accept' ? 'accept' : 'reject';
                await axios.put(`${API_BASE}/api/booking/${endpoint}/${selectedRequest.id}`);
                actionType === 'accept' ? toast.success("Request Accepted") : toast.warn("Request Rejected");
            }
            setSelectedRequest(null);
            fetchData();
        } catch (err) {
            toast.error("Action failed.");
        } finally {
            setIsActionLoading(false);
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
                            <div className="mini-link-box">
                                <input readOnly value={profileUrl} />
                                <button onClick={handleCopy} className={copySuccess ? "copied" : ""}>
                                    {copySuccess ? <FaCheck /> : <FaCopy />}
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* CENTER COLUMN */}
                    <main className="db-column center-col">
                        <div className="db-tile-row">
                            <div className="db-tile db-saffron" onClick={() => navigate('/availability-manager')}>
                                <FaCalendarDay className="db-tile-icon" />
                                <h3>Availability</h3>
                                <p>Manage schedule.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                            <div className="db-tile db-gold" onClick={() => setIsModalOpen(true)}>
                                <FaPlus className="db-tile-icon" />
                                <h3>Manual Booking</h3>
                                <p>Record ritual.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                            <div className={`db-tile db-charcoal ${activeView === 'stats' ? 'tile-active' : ''}`} onClick={() => handleTabChange('stats')}>
                                <FaChartBar className="db-tile-icon" />
                                <h3>Earnings</h3>
                                <p>Insights.</p>
                                <FaChevronRight className="db-tile-go" />
                            </div>
                        </div>

                        <div className="priest-view-container" ref={contentRef}>
                            <div className="priest-view-header">
                                <h2>{activeView.replace('-', ' ').toUpperCase()} VIEW</h2>
                            </div>
                            
                            <div className={`view-content-wrapper ${['stats', 'events', 'knowledge', 'pending'].includes(activeView) ? 'full-page-mode' : 'grid-mode'}`}>
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
                                    pendingRequests.map(item => (
                                        <div key={`${item.type}-${item.id}`} className={`db-request-card ${item.type === 'MUHURTAM' ? 'muh-card' : 'app-card'}`}>
                                            <div className="req-header">
                                                <span className="req-badge">{item.type === 'MUHURTAM' ? 'Muhurtam Inquiry' : 'Booking Request'}</span>
                                                <span className="req-id">REF: #{item.id}</span>
                                            </div>
                                            <div className="req-body">
                                                <h4>{item.poojaType}</h4>
                                                <div className="req-mini-grid">
                                                    <div className="req-mini-item"><label>CLIENT</label><p>{item.customerName}</p></div>
                                                    <div className="req-mini-item">
                                                        <label>{item.type === 'MUHURTAM' ? 'NAKSHATRAM' : 'DATE'}</label>
                                                        <p>{item.type === 'MUHURTAM' ? (item.nakshatram || 'N/A') : (item.date || 'TBD')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="req-details-trigger" onClick={() => setSelectedRequest(item)}>
                                                View Details & Action <FaChevronRight />
                                            </button>
                                        </div>
                                    )) : 
                                    <div className="empty-state">Action center is clear.</div>
                                )}
                                
                                {activeView === 'stats' && <PoojaStatsPage stats={stats} />}
                                {activeView === 'events' && <ManageEventsPage events={templeEvents} />}
                                {activeView === 'knowledge' && (
                                    <div className="rich-editor-container">
                                        <div className="editor-header-hint"><FaEdit /> Digital Mantra Bank</div>
                                        <KnowledgeBase content={knowledgeBaseContent} onSave={() => fetchData()} priestId={priestId}/>
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

            {/* --- REQUEST DETAILS OVERLAY --- */}
            {selectedRequest && (
                <div className="req-overlay" onClick={() => setSelectedRequest(null)}>
                    <div className="req-overlay-content" onClick={e => e.stopPropagation()}>
                        <div className="req-overlay-header">
                            <div className="req-type-pill">{selectedRequest.type}</div>
                            <button className="close-overlay" onClick={() => setSelectedRequest(null)}><FaTimes /></button>
                        </div>
                        
                        <div className="req-overlay-body">
                            <span className="ov-label">RITUAL REQUEST</span>
                            <h2 className="ov-title">{selectedRequest.poojaType}</h2>
                            
                            <div className="ov-section">
                                <div className="ov-item"><FaUserTie /> <span>{selectedRequest.customerName}</span></div>
                                <div className="ov-item"><FaPhoneAlt /> <span>{selectedRequest.contact || 'N/A'}</span></div>
                                <div className="ov-item"><FaEnvelope /> <span>{selectedRequest.email || 'N/A'}</span></div>
                            </div>

                            <div className="ov-details-box">
                                {selectedRequest.type === 'MUHURTAM' ? (
                                    <>
                                        <div className="ov-detail-row"><label>Nakshatram</label> <strong>{selectedRequest.nakshatram || '---'}</strong></div>
                                        <div className="ov-detail-row"><label>Birth Date</label> <strong>{selectedRequest.date || '---'}</strong></div>
                                        <div className="ov-detail-row"><label>Birth Time</label> <strong>{selectedRequest.time || '---'}</strong></div>
                                        <div className="ov-detail-row"><label>Place</label> <strong>{selectedRequest.place || '---'}</strong></div>
                                    </>
                                ) : (
                                    <>
                                        <div className="ov-detail-row"><label>Scheduled Date</label> <strong>{selectedRequest.date}</strong></div>
                                        <div className="ov-detail-row"><label>Preferred Time</label> <strong>{selectedRequest.startTime}</strong></div>
                                        <div className="ov-detail-row"><label>Address</label> <strong>{selectedRequest.address}</strong></div>
                                    </>
                                )}
                                {selectedRequest.note && (
                                    <div className="ov-notes">
                                        <label>Special Instructions:</label>
                                        <p>{selectedRequest.note}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="req-overlay-footer">
                            {selectedRequest.type === 'MUHURTAM' ? (
                                <button className="ov-btn view" onClick={() => handleAction('view')} disabled={isActionLoading}>Mark as Read & Archive</button>
                            ) : (
                                <>
                                    <button className="ov-btn reject" onClick={() => handleAction('reject')} disabled={isActionLoading}>Decline Booking</button>
                                    <button className="ov-btn accept" onClick={() => handleAction('accept')} disabled={isActionLoading}>Accept & Confirm</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isModalOpen && <AppointmentModal onClose={() => setIsModalOpen(false)} onSave={() => fetchData()} priest={{ id: priestId, firstName: userName }} />}
        </div>
    );
};

export default PriestDashboard;