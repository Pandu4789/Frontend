import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, isValid, isBefore, startOfDay } from 'date-fns';
import { 
    FaCheckCircle, FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaInbox, 
    FaChevronLeft, FaChevronRight, FaArrowLeft, FaTimesCircle, FaMapMarkerAlt, 
    FaExternalLinkAlt, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaBaby, FaFilter, FaBan 
} from 'react-icons/fa';
import './YourBookings.css';

const API_BASE = "http://localhost:8080";

const YourBookings = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('bookings');
    const [statusFilter, setStatusFilter] = useState('ALL'); 
    
    const [appointmentBookings, setAppointmentBookings] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null); 
    const itemsPerPage = 6;

    useEffect(() => {
        if (location.state?.filter) {
            const sidebarFilter = location.state.filter;
            if (sidebarFilter === 'MUHURTAM') {
                setActiveTab('requests');
                setStatusFilter('ALL');
            } else {
                setActiveTab('bookings');
                setStatusFilter(sidebarFilter);
            }
        }
    }, [location.state]);

    useEffect(() => {
        const fetchUserBookings = async () => {
            const customerId = localStorage.getItem('userId');
            if (!customerId) { setIsLoading(false); return; }

            try {
                const [bookingRes, muhurtamRes] = await Promise.all([
                    axios.get(`${API_BASE}/api/booking/customer/${customerId}`),
                    axios.get(`${API_BASE}/api/muhurtam/customer/${customerId}`)
                ]);
                const sortFn = (a, b) => (b.id - a.id);
                setAppointmentBookings((bookingRes.data || []).sort(sortFn));
                setMuhurtamRequests((muhurtamRes.data || []).sort(sortFn));
            } catch (err) {
                console.error("Fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserBookings();
    }, []);

    // --- LOGIC HELPERS ---
    const isPast = (dateStr) => dateStr && isBefore(new Date(dateStr), startOfDay(new Date()));

    const getStatusMeta = (item) => {
        const rawStatus = (item.status || '').toUpperCase();
        const isExpired = activeTab === 'bookings' && isPast(item.date);

        // 1. If date passed and it was still PENDING or NO STATUS
        if (isExpired && (!rawStatus || rawStatus === 'PENDING' || rawStatus === 'VIEWED')) {
            return { cls: 'expired', icon: <FaBan />, label: 'No Longer Available' };
        }

        // 2. Standard Statuses (Regardless of date)
        if (rawStatus.includes('ACCEPT')) return { cls: 'confirmed', icon: <FaCheckCircle />, label: 'Accepted' };
        if (rawStatus.includes('REJECT')) return { cls: 'rejected', icon: <FaTimesCircle />, label: 'Rejected' };
        
        // 3. Current Pending/Viewed
        if (item.viewed && !rawStatus) return { cls: 'viewed', icon: <FaInfoCircle />, label: 'Viewed' };
        return { cls: 'pending', icon: <FaExclamationCircle />, label: 'Pending' };
    };

    // --- COUNT LOGIC ---
    const counts = useMemo(() => {
        const data = activeTab === 'bookings' ? appointmentBookings : muhurtamRequests;
        if (activeTab === 'bookings') {
            return {
                all: data.length,
                upcoming: data.filter(item => !isPast(item.date)).length,
                pending: data.filter(item => !isPast(item.date) && (!item.status || item.status === 'PENDING')).length,
                accepted: data.filter(item => item.status?.toUpperCase().includes('ACCEPT')).length,
                rejected: data.filter(item => item.status?.toUpperCase().includes('REJECT')).length,
                expired: data.filter(item => isPast(item.date) && (!item.status || item.status === 'PENDING')).length
            };
        } else {
            return {
                all: data.length,
                pending: data.filter(item => !item.viewed).length,
                viewed: data.filter(item => item.viewed).length
            };
        }
    }, [activeTab, appointmentBookings, muhurtamRequests]);

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        const rawData = activeTab === 'bookings' ? appointmentBookings : muhurtamRequests;
        if (statusFilter === 'ALL') return rawData;
        
        if (statusFilter === 'UPCOMING') return rawData.filter(item => !isPast(item.date));
        
        if (statusFilter === 'EXPIRED') {
            return rawData.filter(item => isPast(item.date) && (!item.status || item.status.toUpperCase() === 'PENDING'));
        }

        return rawData.filter(item => {
            const status = (item.status || '').toUpperCase();
            if (statusFilter === 'PENDING') return (status === 'PENDING' || status === '') && !isPast(item.date);
            if (statusFilter === 'VIEWED') return item.viewed === true && (status === '' || status === 'VIEWED');
            return status.includes(statusFilter);
        });
    }, [activeTab, appointmentBookings, muhurtamRequests, statusFilter]);

    const visibleData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="yb-viewport">
            <div className="yb-app-shell">
                <header className="yb-main-header">
                    <div className="yb-title-stack">
                        <button className="yb-minimal-back" onClick={() => navigate('/events')}><FaArrowLeft /></button>
                        <div className="yb-header-text">
                            <h1>My Rituals</h1>
                            <p>Track your spiritual schedule and upcoming poojas.</p>
                        </div>
                    </div>
                </header>

                <div className="yb-nav-container">
                    <div className="yb-segmented-control">
                        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => {setActiveTab('bookings'); setStatusFilter('ALL'); setCurrentPage(1);}}>Ritual Bookings ({appointmentBookings.length})</button>
                        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => {setActiveTab('requests'); setStatusFilter('ALL'); setCurrentPage(1);}}>Muhurtam Requests ({muhurtamRequests.length})</button>
                    </div>

                    <div className="yb-filter-row">
                        <span className="yb-filter-label"><FaFilter /> Filter:</span>
                        <div className="yb-chips">
                            <button className={statusFilter === 'ALL' ? 'chip-active' : ''} onClick={() => setStatusFilter('ALL')}>All</button>
                            
                            {activeTab === 'bookings' ? (
                                <>
                                    <button className={statusFilter === 'UPCOMING' ? 'chip-active' : ''} onClick={() => setStatusFilter('UPCOMING')}>Upcoming ({counts.upcoming})</button>
                                    <button className={statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('PENDING')}>Pending ({counts.pending})</button>
                                    <button className={statusFilter === 'ACCEPTED' ? 'chip-active' : ''} onClick={() => setStatusFilter('ACCEPTED')}>Accepted ({counts.accepted})</button>
                                    <button className={statusFilter === 'REJECTED' ? 'chip-active' : ''} onClick={() => setStatusFilter('REJECTED')}>Rejected ({counts.rejected})</button>
                                    {counts.expired > 0 && (
                                        <button className={statusFilter === 'EXPIRED' ? 'chip-active red-chip' : ''} onClick={() => setStatusFilter('EXPIRED')}>Expired ({counts.expired})</button>
                                    )}
                                </>
                            ) : (
                                <>
                                    <button className={statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('PENDING')}>Pending ({counts.pending})</button>
                                    <button className={statusFilter === 'VIEWED' ? 'chip-active' : ''} onClick={() => setStatusFilter('VIEWED')}>Viewed ({counts.viewed})</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <main className="yb-scroll-container">
                    {isLoading ? (
                        <div className="yb-loader">Organizing your schedule...</div>
                    ) : visibleData.length > 0 ? (
                        <div className="yb-feed">
                            {visibleData.map((item) => {
                                const meta = getStatusMeta(item);
                                return (
                                    <div key={`${activeTab}-${item.id}`} className={`yb-ritual-card border-${meta.cls}`}>
                                        <div className={`yb-status-sidebar status-${meta.cls}`}></div>
                                        <div className="yb-card-content">
                                            <div className="yb-card-top">
                                                <span className="yb-ritual-id">REF: #{item.id}</span>
                                                <div className={`yb-status-badge status-${meta.cls}`}>{meta.icon} <span>{meta.label}</span></div>
                                            </div>
                                            <h3 className="yb-ritual-title">{item.eventName || 'Ritual Service'}</h3>
                                            
                                            <div className="yb-data-stack">
                                                <div className="yb-data-row">
                                                    <span className="yb-label">PRIEST</span>
                                                    <span className="yb-value">{item.priestName}</span>
                                                </div>
                                                <div className="yb-data-row">
                                                    <span className="yb-label">{activeTab === 'requests' && !item.nakshatram ? 'BIRTH INFO' : activeTab === 'requests' ? 'NAKSHATRAM' : 'SCHEDULE'}</span>
                                                    <span className="yb-value">
                                                        {activeTab === 'requests' ? (item.nakshatram || `${item.date} | ${item.time}`) : 
                                                        (item.date && isValid(new Date(item.date)) ? format(new Date(item.date), 'MMMM dd, yyyy') : 'TBD')}
                                                        {!activeTab === 'requests' && item.start ? ` @ ${item.start}` : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="yb-card-footer">
                                                {activeTab === 'bookings' && item.address ? <div className="yb-location-tag"><FaMapMarkerAlt /> <span>{item.address}</span></div> : <span></span>}
                                                <button className="yb-btn-details" onClick={() => setSelectedItem(item)}>View Details <FaExternalLinkAlt /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="yb-empty-state"><FaInbox size={50} /><h3>No results found</h3></div>
                    )}
                </main>

                {totalPages > 1 && (
                    <footer className="yb-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /> Previous</button>
                        <span className="yb-page-info">Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next <FaChevronRight /></button>
                    </footer>
                )}
            </div>

            {selectedItem && (
                <div className="yb-drawer-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="yb-drawer" onClick={e => e.stopPropagation()}>
                        <div className="yb-drawer-header">
                            <h2>Service Summary</h2>
                            <button className="yb-close-btn" onClick={() => setSelectedItem(null)}>&times;</button>
                        </div>
                        <div className="yb-drawer-body">
                             <div className={`yb-drawer-status banner-${getStatusMeta(selectedItem).cls}`}>
                                {getStatusMeta(selectedItem).label}
                            </div>
                            <section className="yb-drawer-section">
                                <h3><FaUserAlt /> Priest Contact</h3>
                                <div className="yb-drawer-info">
                                    <p className="yb-drawer-priest-name">{selectedItem.priestName}</p>
                                    <div className="yb-contact-item"><FaPhoneAlt className="yb-contact-icon" /> <span>{selectedItem.priestPhone || 'Not Provided'}</span></div>
                                    <div className="yb-contact-item"><FaEnvelope className="yb-contact-icon" /> <span>{selectedItem.priestEmail || 'Not Provided'}</span></div>
                                </div>
                            </section>
                            {/* ... etc ... */}
                        </div>
                        <div className="yb-drawer-footer">
                            <button className="yb-btn-close-full" onClick={() => setSelectedItem(null)}>Close Summary</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default YourBookings;