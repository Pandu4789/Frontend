import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { isBefore, startOfDay, parseISO } from 'date-fns';
import { 
    FaCheckCircle, FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaInbox, 
    FaChevronLeft, FaChevronRight, FaTimesCircle, FaMapMarkerAlt, 
    FaExternalLinkAlt, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaBaby, FaBell, FaSearch, FaBan 
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import './MuhurtamRequests.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const MuhurtamRequests = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [activeTab, setActiveTab] = useState('bookings');
    const [statusFilter, setStatusFilter] = useState('ALL'); 
    const [searchTerm, setSearchTerm] = useState('');
    
    const [appointmentBookings, setAppointmentBookings] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null); 
    const itemsPerPage = 10;

    const priestId = localStorage.getItem('userId');

    // --- NAVIGATION SYNC LOGIC ---
    useEffect(() => {
        if (location.state) {
            const { tab, filter } = location.state;
            if (tab) setActiveTab(tab);
            if (filter) setStatusFilter(filter);
            setCurrentPage(1); // Reset pagination on filter change
        }
    }, [location.state]);

    const fetchData = async () => {
        if (!priestId) return;
        setIsLoading(true);
        try {
            const [bookingRes, muhurtamRes] = await Promise.all([
                axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
                axios.get(`${API_BASE}/api/muhurtam/priest/${priestId}`)
            ]);

            const smartSort = (data, type) => [...data].sort((a, b) => {
                const statusA = type === 'muhurtam' ? (a.viewed ? 'ACK' : 'PENDING') : (a.status || 'PENDING').toUpperCase();
                const statusB = type === 'muhurtam' ? (b.viewed ? 'ACK' : 'PENDING') : (b.status || 'PENDING').toUpperCase();
                
                if (statusA === 'PENDING' && statusB !== 'PENDING') return -1;
                if (statusA !== 'PENDING' && statusB === 'PENDING') return 1;
                return b.id - a.id;
            });

            setAppointmentBookings(smartSort(bookingRes.data || [], 'booking'));
            setMuhurtamRequests(smartSort(muhurtamRes.data || [], 'muhurtam'));
        } catch (err) {
            toast.error("Failed to sync inbox.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [priestId]);

    // --- EXPIRATION LOGIC ---
    const isExpired = (dateStr) => {
        if (!dateStr) return false;
        // Check if the ritual date is before today
        return isBefore(parseISO(dateStr.split('T')[0]), startOfDay(new Date()));
    };

    const getStatusMeta = (item) => {
        if (activeTab === 'requests') {
            return item.viewed 
                ? { cls: 'confirmed', icon: <FaCheckCircle />, label: 'Acknowledged' }
                : { cls: 'pending', icon: <FaExclamationCircle />, label: 'New Inquiry' };
        }

        const status = (item.status || 'PENDING').toUpperCase();
        
        // Expiration check only for PENDING Ritual Bookings
        if (status === 'PENDING' && isExpired(item.date)) {
            return { cls: 'expired', icon: <FaBan />, label: 'Expired / Passed' };
        }

        if (status === 'ACCEPTED' || status === 'CONFIRMED') return { cls: 'confirmed', icon: <FaCheckCircle />, label: 'Accepted' };
        if (status === 'REJECTED') return { cls: 'rejected', icon: <FaTimesCircle />, label: 'Rejected' };
        return { cls: 'pending', icon: <FaExclamationCircle />, label: 'Pending' };
    };

    const counts = useMemo(() => ({
        rituals: {
            all: appointmentBookings.length,
            pending: appointmentBookings.filter(b => (b.status || 'PENDING').toUpperCase() === 'PENDING' && !isExpired(b.date)).length,
            accepted: appointmentBookings.filter(b => b.status?.toUpperCase() === 'ACCEPTED').length,
            rejected: appointmentBookings.filter(b => b.status?.toUpperCase() === 'REJECTED').length,
        },
        muhurtams: {
            all: muhurtamRequests.length,
            new: muhurtamRequests.filter(r => !r.viewed).length,
            viewed: muhurtamRequests.filter(r => r.viewed).length
        }
    }), [appointmentBookings, muhurtamRequests]);

    const handleAction = async (id, action) => {
        try {
            if (activeTab === 'requests') {
                await axios.put(`${API_BASE}/api/muhurtam/${id}/viewed`, { viewed: true });
            } else {
                await axios.put(`${API_BASE}/api/booking/${action}/${id}`);
            }
            toast.success("Update successful");
            setSelectedItem(null);
            fetchData();
        } catch { toast.error("Action failed"); }
    };

    const filteredData = useMemo(() => {
        const rawData = activeTab === 'bookings' ? appointmentBookings : muhurtamRequests;
        return rawData.filter(item => {
            const matchesSearch = (item.name + (item.eventName || '')).toLowerCase().includes(searchTerm.toLowerCase());
            if (statusFilter === 'ALL') return matchesSearch;
            
            if (activeTab === 'bookings') {
                const status = (item.status || 'PENDING').toUpperCase();
                // Special filter for Navbar: if state passed PENDING, show only non-expired pending
                if (statusFilter === 'PENDING') return matchesSearch && status === 'PENDING' && !isExpired(item.date);
                return matchesSearch && status === statusFilter;
            } else {
                const isNew = statusFilter === 'NEW' || statusFilter === 'PENDING';
                return matchesSearch && (isNew ? !item.viewed : item.viewed);
            }
        });
    }, [activeTab, appointmentBookings, muhurtamRequests, statusFilter, searchTerm]);

    const visibleData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="mr-viewport">
            <div className="mr-app-shell">
                <ToastContainer position="bottom-right" theme="colored" />
                
                <header className="mr-main-header">
                    <div className="mr-header-text">
                        <h1>Inquiry Inbox</h1>
                        <p>Review and manage your incoming ritual requests.</p>
                    </div>
                </header>

                <div className="mr-nav-container">
                    <div className="mr-segmented-control">
                        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => {setActiveTab('bookings'); setStatusFilter('ALL'); setCurrentPage(1);}}>
                            Ritual Bookings ({counts.rituals.all})
                        </button>
                        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => {setActiveTab('requests'); setStatusFilter('ALL'); setCurrentPage(1);}}>
                            Muhurtam Inquiries ({counts.muhurtams.all})
                        </button>
                    </div>

                    <div className="mr-filter-row">
                        <div className="mr-search-bar">
                            <FaSearch />
                            <input type="text" placeholder="Search customer or event..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="mr-chips">
                            <button className={statusFilter === 'ALL' ? 'chip-active' : ''} onClick={() => setStatusFilter('ALL')}>All</button>
                            {activeTab === 'bookings' ? (
                                <>
                                    <button className={statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('PENDING')}>Pending ({counts.rituals.pending})</button>
                                    <button className={statusFilter === 'ACCEPTED' ? 'chip-active' : ''} onClick={() => setStatusFilter('ACCEPTED')}>Accepted ({counts.rituals.accepted})</button>
                                    <button className={statusFilter === 'REJECTED' ? 'chip-active red-chip' : ''} onClick={() => setStatusFilter('REJECTED')}>Rejected ({counts.rituals.rejected})</button>
                                </>
                            ) : (
                                <>
                                    <button className={statusFilter === 'NEW' || statusFilter === 'PENDING' ? 'chip-active' : ''} onClick={() => setStatusFilter('NEW')}>New ({counts.muhurtams.new})</button>
                                    <button className={statusFilter === 'VIEWED' ? 'chip-active' : ''} onClick={() => setStatusFilter('VIEWED')}>Viewed ({counts.muhurtams.viewed})</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <main className="mr-scroll-container">
                    {isLoading ? (
                        <div className="mr-loader">Synchronizing heavens...</div>
                    ) : visibleData.length > 0 ? (
                        <div className="mr-grid">
                            {visibleData.map((item) => {
                                const meta = getStatusMeta(item);
                                return (
                                    <div key={`${activeTab}-${item.id}`} className={`mr-ritual-card border-${meta.cls}`}>
                                        <div className={`mr-status-sidebar status-${meta.cls}`}></div>
                                        <div className="mr-card-content">
                                            <div className="mr-card-top">
                                                <span className="mr-ritual-id">REF: #{item.id}</span>
                                                <div className={`mr-status-badge status-${meta.cls}`}>{meta.icon} <span>{meta.label}</span></div>
                                            </div>
                                            <h3 className="mr-ritual-title">{item.eventName || 'Sacred Service'}</h3>
                                            
                                            <div className="mr-data-stack">
                                                <div className="mr-data-row"><span className="mr-label">CLIENT</span><span className="mr-value">{item.name}</span></div>
                                                <div className="mr-data-row">
                                                    <span className="mr-label">{activeTab === 'requests' ? 'BIRTH INFO' : 'SCHEDULE'}</span>
                                                    <span className="mr-value">
                                                        {activeTab === 'requests' ? (item.nakshatram || `${item.date} | ${item.time}`) : `${item.date} @ ${item.start}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mr-card-footer">
                                                <div className="mr-contact-mini"><FaPhoneAlt /> <span>{item.phone}</span></div>
                                                <button className="mr-btn-details" onClick={() => setSelectedItem(item)}>View & Action <FaExternalLinkAlt /></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mr-empty-state"><FaInbox size={50} /><h3>No inquiries found</h3></div>
                    )}
                </main>

                {totalPages > 1 && (
                    <footer className="mr-pagination">
                        <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}><FaChevronLeft /> Previous</button>
                        <span className="mr-page-info">Page {currentPage} of {totalPages}</span>
                        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next <FaChevronRight /></button>
                    </footer>
                )}
            </div>

            {selectedItem && (
                <div className="mr-drawer-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="mr-drawer" onClick={e => e.stopPropagation()}>
                        <div className="mr-drawer-header">
                            <h2>Request Details</h2>
                            <button className="mr-close-btn" onClick={() => setSelectedItem(null)}>&times;</button>
                        </div>
                        <div className="mr-drawer-body">
                             <div className={`mr-drawer-status banner-${getStatusMeta(selectedItem).cls}`}>
                                {getStatusMeta(selectedItem).label}
                            </div>
                            <section className="mr-drawer-section">
                                <h3><FaUserAlt /> Customer Info</h3>
                                <div className="mr-drawer-info">
                                    <p className="mr-drawer-priest-name">{selectedItem.name}</p>
                                    <div className="mr-contact-item"><FaPhoneAlt className="mr-contact-icon" /> <span>{selectedItem.phone}</span></div>
                                    <div className="mr-contact-item"><FaEnvelope className="mr-contact-icon" /> <span>{selectedItem.email || 'N/A'}</span></div>
                                </div>
                            </section>
                            <section className="mr-drawer-section">
                                <h3>{activeTab === 'requests' ? <FaBaby /> : <FaCalendarAlt />} Ritual Details</h3>
                                <div className="mr-drawer-info">
                                    <p><strong>Ritual:</strong> {selectedItem.eventName || 'Analysis'}</p>
                                    {activeTab === 'requests' ? (
                                        selectedItem.nakshatram ? <p><strong>Nakshatram:</strong> {selectedItem.nakshatram}</p> :
                                        <>
                                            <p><strong>Birth Date:</strong> {selectedItem.date}</p>
                                            <p><strong>Birth Time:</strong> {selectedItem.time}</p>
                                            <p><strong>Place:</strong> {selectedItem.place || 'N/A'}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong>Scheduled:</strong> {selectedItem.date} @ {selectedItem.start}</p>
                                            {selectedItem.address && (
                                                <div className="mr-drawer-address-box">
                                                    <p><strong><FaMapMarkerAlt /> Venue Address:</strong></p>
                                                    <p className="mr-drawer-address-text">{selectedItem.address}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </section>
                            {selectedItem.note && (
                                <section className="mr-drawer-section">
                                    <h3><FaInfoCircle /> Notes</h3>
                                    <p className="mr-drawer-note">"{selectedItem.note}"</p>
                                </section>
                            )}
                        </div>
                        <div className="mr-drawer-footer">
                            {/* ACTION BUTTONS LOGIC */}
                            {getStatusMeta(selectedItem).cls === 'pending' ? (
                                <div className="mr-action-group">
                                    <button className="mr-btn-reject-full" onClick={() => handleAction(selectedItem.id, 'reject')}>Decline</button>
                                    <button className="mr-btn-accept-full" onClick={() => handleAction(selectedItem.id, activeTab === 'requests' ? 'view' : 'accept')}>
                                        {activeTab === 'requests' ? 'Acknowledge' : 'Accept Booking'}
                                    </button>
                                </div>
                            ) : (
                                <button className="mr-btn-close-full" onClick={() => setSelectedItem(null)}>
                                    {getStatusMeta(selectedItem).cls === 'expired' ? 'No Longer Available' : 'Close Details'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MuhurtamRequests;