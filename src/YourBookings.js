import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import { 
    FaCheckCircle, FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaInbox, 
    FaChevronLeft, FaChevronRight, FaArrowLeft, FaTimesCircle, FaMapMarkerAlt, 
    FaExternalLinkAlt, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaBaby, FaFilter 
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

    const filteredData = useMemo(() => {
        const rawData = activeTab === 'bookings' ? appointmentBookings : muhurtamRequests;
        
        if (statusFilter === 'ALL') return rawData;
        
        // Ritual Specific: Upcoming
        if (statusFilter === 'UPCOMING') {
            const now = new Date();
            return rawData.filter(item => new Date(item.date || item.datetime) >= now);
        }

        return rawData.filter(item => {
            const status = (item.status || '').toUpperCase();
            
            if (statusFilter === 'PENDING') {
                // For Muhurtams: Not viewed and no status
                // For Rituals: Explicit Pending or Empty
                return (status === 'PENDING' || status === '') && !item.viewed;
            }

            if (statusFilter === 'VIEWED') {
                return item.viewed === true && (status === '' || status === 'VIEWED');
            }
            
            return status.includes(statusFilter);
        });
    }, [activeTab, appointmentBookings, muhurtamRequests, statusFilter]);

    const visibleData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const getStatusMeta = (item) => {
        const raw = (item.status || (item.viewed ? 'Viewed' : 'Pending')).toLowerCase();
        if (raw.includes('accept') || raw.includes('confirm')) return { cls: 'confirmed', icon: <FaCheckCircle /> };
        if (raw.includes('reject') || raw.includes('cancel')) return { cls: 'rejected', icon: <FaTimesCircle /> };
        if (raw === 'viewed' || (item.viewed && !item.status)) return { cls: 'viewed', icon: <FaInfoCircle /> };
        return { cls: 'pending', icon: <FaExclamationCircle /> };
    };

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
                        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => {setActiveTab('bookings'); setStatusFilter('ALL'); setCurrentPage(1);}}>Ritual Bookings</button>
                        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => {setActiveTab('requests'); setStatusFilter('ALL'); setCurrentPage(1);}}>Muhurtam Requests</button>
                    </div>

                    <div className="yb-filter-row">
                        <span className="yb-filter-label"><FaFilter /> Filter:</span>
                        <div className="yb-chips">
                            <button className={statusFilter === 'ALL' ? 'chip-active' : ''} onClick={() => setStatusFilter('ALL')}>All</button>
                            
                            {/* DYNAMIC CHIPS BASED ON TAB */}
                            {activeTab === 'bookings' ? (
                                <>
                                    <button className={statusFilter === 'UPCOMING' ? 'chip-active' : ''} onClick={() => setStatusFilter('UPCOMING')}>Upcoming</button>
                                    <button className={statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('PENDING')}>Pending</button>
                                    <button className={statusFilter === 'ACCEPTED' ? 'chip-active' : ''} onClick={() => setStatusFilter('ACCEPTED')}>Accepted</button>
                                    <button className={statusFilter === 'REJECTED' ? 'chip-active' : ''} onClick={() => setStatusFilter('REJECTED')}>Rejected</button>
                                </>
                            ) : (
                                <>
                                    <button className={statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('PENDING')}>Pending</button>
                                    <button className={statusFilter === 'VIEWED' ? 'chip-active' : ''} onClick={() => setStatusFilter('VIEWED')}>Viewed</button>
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
                                const { cls, icon } = getStatusMeta(item);
                                return (
                                    <div key={`${activeTab}-${item.id}`} className={`yb-ritual-card border-${cls}`}>
                                        <div className={`yb-status-sidebar status-${cls}`}></div>
                                        <div className="yb-card-content">
                                            <div className="yb-card-top">
                                                <span className="yb-ritual-id">REF: #{item.id}</span>
                                                <div className={`yb-status-badge status-${cls}`}>{icon} <span>{item.status || (item.viewed ? 'Viewed' : 'Pending')}</span></div>
                                            </div>
                                            <h3 className="yb-ritual-title">{item.eventName || 'Ritual Service'}</h3>
                                            
                                            <div className="yb-data-stack">
                                                <div className="yb-data-row">
                                                    <span className="yb-label">PRIEST</span>
                                                    <span className="yb-value">{item.priestName}</span>
                                                </div>

                                                {activeTab === 'requests' ? (
                                                    item.nakshatram ? (
                                                        <div className="yb-data-row">
                                                            <span className="yb-label">NAKSHATRAM</span>
                                                            <span className="yb-value">{item.nakshatram}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="yb-data-row">
                                                            <span className="yb-label">BIRTH INFO</span>
                                                            <span className="yb-value">{item.date} | {item.time}</span>
                                                        </div>
                                                    )
                                                ) : (
                                                    <div className="yb-data-row">
                                                        <span className="yb-label">SCHEDULE</span>
                                                        <span className="yb-value">
                                                            {item.date && isValid(new Date(item.date)) ? format(new Date(item.date), 'MMMM dd, yyyy') : 'TBD'} 
                                                            {item.start ? ` @ ${item.start}` : ''}
                                                        </span>
                                                    </div>
                                                )}
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
                        <div className="yb-empty-state"><FaInbox size={50} /><h3>No {statusFilter.toLowerCase()} activity found</h3></div>
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
                                {selectedItem.status || (selectedItem.viewed ? 'Viewed' : 'Pending')}
                            </div>
                            
                            <section className="yb-drawer-section">
                                <h3><FaUserAlt /> Priest Contact</h3>
                                <div className="yb-drawer-info">
                                    <p className="yb-drawer-priest-name">{selectedItem.priestName}</p>
                                    <div className="yb-contact-item">
                                        <FaPhoneAlt className="yb-contact-icon" />
                                        <span>{selectedItem.priestPhone || 'Not Provided'}</span>
                                    </div>
                                    <div className="yb-contact-item">
                                        <FaEnvelope className="yb-contact-icon" />
                                        <span>{selectedItem.priestEmail || 'Not Provided'}</span>
                                    </div>
                                </div>
                            </section>

                            <section className="yb-drawer-section">
                                <h3>{activeTab === 'requests' ? <FaBaby /> : <FaCalendarAlt />} Service Details</h3>
                                <div className="yb-drawer-info">
                                    <p><strong>Ritual:</strong> {selectedItem.eventName}</p>
                                    
                                    {activeTab === 'requests' ? (
                                        selectedItem.nakshatram ? (
                                            <p><strong>Nakshatram:</strong> {selectedItem.nakshatram}</p>
                                        ) : (
                                            <>
                                                <p><strong>Birth Date:</strong> {selectedItem.date}</p>
                                                <p><strong>Birth Time:</strong> {selectedItem.time}</p>
                                                <p><strong>Birth Place:</strong> {selectedItem.place || 'N/A'}</p>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <p><strong>Date:</strong> {selectedItem.date && isValid(new Date(selectedItem.date)) ? format(new Date(selectedItem.date), 'PPPP') : 'To be determined'}</p>
                                            <p><strong>Time:</strong> {selectedItem.start || 'To be determined'}</p>
                                        </>
                                    )}
                                </div>
                            </section>

                            {activeTab === 'bookings' && selectedItem.address && (
                                <section className="yb-drawer-section">
                                    <h3><FaMapMarkerAlt /> Venue Location</h3>
                                    <p className="yb-drawer-address">{selectedItem.address}</p>
                                </section>
                            )}

                            {selectedItem.note && (
                                <section className="yb-drawer-section">
                                    <h3><FaInfoCircle /> Instructions</h3>
                                    <p className="yb-drawer-note">"{selectedItem.note}"</p>
                                </section>
                            )}
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