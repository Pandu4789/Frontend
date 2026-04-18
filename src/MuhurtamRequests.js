import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { isBefore, startOfDay, parseISO, format, isValid } from 'date-fns';
import { 
    FaCheckCircle, FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaInbox, 
    FaChevronLeft, FaChevronRight, FaTimesCircle, FaMapMarkerAlt, 
    FaExternalLinkAlt, FaInfoCircle, FaPhoneAlt, FaEnvelope, FaBaby, FaBell, FaSearch, FaBan,
    FaArrowLeft, FaFilter
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
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    
    const [appointmentBookings, setAppointmentBookings] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null); 
    const itemsPerPage = 6;

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
            
            // Date filter
            let matchesDateRange = true;
            if (dateFrom) {
                const fromDate = new Date(dateFrom);
                const itemDate = new Date(item.date);
                matchesDateRange = itemDate >= fromDate;
            }
            if (dateTo) {
                const toDate = new Date(dateTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                const itemDate = new Date(item.date);
                matchesDateRange = matchesDateRange && itemDate <= toDate;
            }
            
            if (!matchesSearch || !matchesDateRange) return false;
            if (statusFilter === 'ALL') return true;
            
            if (activeTab === 'bookings') {
                const status = (item.status || 'PENDING').toUpperCase();
                // Special filter for Navbar: if state passed PENDING, show only non-expired pending
                if (statusFilter === 'PENDING') return status === 'PENDING' && !isExpired(item.date);
                return status === statusFilter;
            } else {
                const isNew = statusFilter === 'NEW' || statusFilter === 'PENDING';
                return isNew ? !item.viewed : item.viewed;
            }
        });
    }, [activeTab, appointmentBookings, muhurtamRequests, statusFilter, searchTerm, dateFrom, dateTo]);

    const visibleData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, currentPage]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    return (
        <div className="yb-container">
            <ToastContainer position="bottom-right" theme="colored" />
            
            {/* Modern Header */}
            <div className="yb-header">
                <div className="yb-header-content">
                    <div className="yb-header-text">
                        <h1 className="yb-title">Inquiry Inbox</h1>
                        <p className="yb-subtitle">Review and manage your incoming ritual requests</p>
                    </div>
                </div>
                <div className="yb-header-stats">
                    <div className="yb-stat-card">
                        <div className="yb-stat-number">{counts.rituals.all}</div>
                        <div className="yb-stat-label">Ritual Bookings</div>
                    </div>
                    <div className="yb-stat-card">
                        <div className="yb-stat-number">{counts.muhurtams.all}</div>
                        <div className="yb-stat-label">Muhurtam Inquiries</div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="yb-main-content">
                {/* Enhanced Tab Navigation */}
                <div className="yb-tabs">
                    <button 
                        className={`yb-tab ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => {setActiveTab('bookings'); setStatusFilter('ALL'); setCurrentPage(1);}}
                    >
                        <div className="yb-tab-icon">
                            <FaCalendarAlt />
                        </div>
                        <div className="yb-tab-content">
                            <div className="yb-tab-title">Ritual Bookings</div>
                            <div className="yb-tab-count">{counts.rituals.all}</div>
                        </div>
                    </button>
                    <button 
                        className={`yb-tab ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => {setActiveTab('requests'); setStatusFilter('ALL'); setCurrentPage(1);}}
                    >
                        <div className="yb-tab-icon">
                            <FaBaby />
                        </div>
                        <div className="yb-tab-content">
                            <div className="yb-tab-title">Muhurtam Inquiries</div>
                            <div className="yb-tab-count">{counts.muhurtams.all}</div>
                        </div>
                    </button>
                </div>

                {/* Advanced Filters */}
                <div className="yb-filters-section">
                    <div className="yb-filters-header">
                        <h3 className="yb-filters-title">
                            <FaFilter /> Filters & Search
                        </h3>
                    
 <div className="yb-active-filters">
                             {searchTerm && <span className="yb-filter-tag">Search: "{searchTerm}"</span>}
                             {dateFrom && <span className="yb-filter-tag">From: {format(new Date(dateFrom), 'MMM dd, yyyy')}</span>}
                             {dateTo && <span className="yb-filter-tag">To: {format(new Date(dateTo), 'MMM dd, yyyy')}</span>}
                             {(searchTerm || dateFrom || dateTo) && (
                                 <button 
                                     className="yb-clear-all-filters"
                                     onClick={() => { setSearchTerm(''); setDateFrom(''); setDateTo(''); setStatusFilter('ALL'); }}
                                 >
                                     Clear All
                                 </button>
                             )}
                         </div> 
                         </div>
                    <div className="yb-filters-grid">
                        {/* Search */}
                        <div className="yb-filter-group">
                            <label className="yb-filter-label">Search</label>
                            <div className="yb-search-wrapper">
                                <FaSearch className="yb-search-icon" />
                                <input 
                                    type="text" 
                                    placeholder="Search customer or event..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="yb-search-input"
                                />
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="yb-filter-group">
                            <label className="yb-filter-label">Date Range</label>
                            <div className="yb-date-range">
                                <div className="yb-date-input-wrapper">
                                    <span className="yb-date-label">From</span>
                                    <input 
                                        type="date" 
                                        value={dateFrom} 
                                        onChange={(e) => setDateFrom(e.target.value)} 
                                        className="yb-date-input"
                                    />
                                </div>
                                <div className="yb-date-input-wrapper">
                                    <span className="yb-date-label">To</span>
                                    <input 
                                        type="date" 
                                        value={dateTo} 
                                        onChange={(e) => setDateTo(e.target.value)} 
                                        className="yb-date-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="yb-filter-group">
                            <label className="yb-filter-label">Status</label>
                            <div className="yb-status-chips">
                                <button 
                                    className={`yb-status-chip ${statusFilter === 'ALL' ? 'active' : ''}`}
                                    onClick={() => setStatusFilter('ALL')}
                                >
                                    All ({activeTab === 'bookings' ? counts.rituals.all : counts.muhurtams.all})
                                </button>
                                
                                {activeTab === 'bookings' ? (
                                    <>
                                        <button 
                                            className={`yb-status-chip pending ${statusFilter === 'PENDING' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('PENDING')}
                                        >
                                            Pending ({counts.rituals.pending})
                                        </button>
                                        <button 
                                            className={`yb-status-chip confirmed ${statusFilter === 'ACCEPTED' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('ACCEPTED')}
                                        >
                                            Accepted ({counts.rituals.accepted})
                                        </button>
                                        <button 
                                            className={`yb-status-chip rejected ${statusFilter === 'REJECTED' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('REJECTED')}
                                        >
                                            Rejected ({counts.rituals.rejected})
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            className={`yb-status-chip pending ${statusFilter === 'NEW' || statusFilter === 'PENDING' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('NEW')}
                                        >
                                            New ({counts.muhurtams.new})
                                        </button>
                                        <button 
                                            className={`yb-status-chip viewed ${statusFilter === 'VIEWED' ? 'active' : ''}`}
                                            onClick={() => setStatusFilter('VIEWED')}
                                        >
                                            Viewed ({counts.muhurtams.viewed})
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="yb-results-summary">
                    <div className="yb-results-count">
                        Showing {visibleData.length} of {filteredData.length} {activeTab === 'bookings' ? 'bookings' : 'inquiries'}
                    </div>
                    {filteredData.length > itemsPerPage && (
                        <div className="yb-pagination-info">
                            Page {currentPage} of {totalPages}
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="yb-content-area">
                    {isLoading ? (
                        <div className="yb-loading-state">
                            <div className="yb-loading-spinner"></div>
                            <p>Synchronizing heavens...</p>
                        </div>
                    ) : visibleData.length > 0 ? (
                        <div className="yb-cards-grid">
                            {visibleData.map((item) => {
                                const meta = getStatusMeta(item);
                                return (
                                    <div key={`${activeTab}-${item.id}`} className={`yb-card ${meta.cls}`}>
                                        <div className="yb-card-header">
                                            <div className="yb-card-id">#{item.id}</div>
                                            <div className={`yb-card-status ${meta.cls}`}>
                                                {meta.icon}
                                                <span>{meta.label}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="yb-card-body">
                                            <h3 className="yb-card-title">{item.eventName || 'Ritual Service'}</h3>
                                            
                                            <div className="yb-card-details">
                                                <div className="yb-detail-item">
                                                    <FaUserAlt className="yb-detail-icon" />
                                                    <div className="yb-detail-content">
                                                        <div className="yb-detail-label">Client</div>
                                                        <div className="yb-detail-value">{item.name}</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="yb-detail-item">
                                                    <FaCalendarAlt className="yb-detail-icon" />
                                                    <div className="yb-detail-content">
                                                        <div className="yb-detail-label">
                                                            {activeTab === 'requests' && !item.nakshatram ? 'Birth Info' : activeTab === 'requests' ? 'Nakshatram' : 'Schedule'}
                                                        </div>
                                                        <div className="yb-detail-value">
                                                            {activeTab === 'requests' ? 
                                                                (item.nakshatram || `${item.date} | ${item.time}`) : 
                                                                (`${item.date}${item.start ? ` @ ${item.start}` : ''}`)
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {activeTab === 'bookings' && item.address && (
                                                    <div className="yb-detail-item">
                                                        <FaMapMarkerAlt className="yb-detail-icon" />
                                                        <div className="yb-detail-content">
                                                            <div className="yb-detail-label">Location</div>
                                                            <div className="yb-detail-value">{item.address}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="yb-card-footer">
                                            <button 
                                                className="yb-view-details-btn"
                                                onClick={() => setSelectedItem(item)}
                                            >
                                                <FaExternalLinkAlt />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="yb-empty-state">
                            <div className="yb-empty-icon">
                                <FaInbox />
                            </div>
                            <h3 className="yb-empty-title">No inquiries found</h3>
                            <p className="yb-empty-description">
                                Try adjusting your filters or search terms to find what you're looking for.
                            </p>
                            {(searchTerm || statusFilter !== 'ALL') && (
                                <button 
                                    className="yb-reset-filters-btn"
                                    onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
                                >
                                    Reset All Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="yb-pagination">
                        <button 
                            className="yb-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(prev => prev - 1)}
                        >
                            <FaChevronLeft />
                            Previous
                        </button>
                        
                        <div className="yb-pagination-pages">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                if (pageNum > totalPages) return null;
                                return (
                                    <button
                                        key={pageNum}
                                        className={`yb-pagination-page ${pageNum === currentPage ? 'active' : ''}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <button 
                            className="yb-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(prev => prev + 1)}
                        >
                            Next
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>

            {selectedItem && (
                <div className="yb-drawer-overlay" onClick={() => setSelectedItem(null)}>
                    <div className="yb-drawer" onClick={e => e.stopPropagation()}>
                        <div className="yb-drawer-header">
                            <h2>Inquiry Details</h2>
                            <button className="yb-close-btn" onClick={() => setSelectedItem(null)}>&times;</button>
                        </div>
                        <div className="yb-drawer-body">
                             <div className={`yb-drawer-status banner-${getStatusMeta(selectedItem).cls}`}>
                                {getStatusMeta(selectedItem).label}
                            </div>
                            <section className="yb-drawer-section">
                                <h3><FaUserAlt /> Customer Info</h3>
                                <div className="yb-drawer-info">
                                    <p className="yb-drawer-priest-name">{selectedItem.name}</p>
                                    <div className="yb-contact-item"><FaPhoneAlt className="yb-contact-icon" /> <span>{selectedItem.phone}</span></div>
                                    <div className="yb-contact-item"><FaEnvelope className="yb-contact-icon" /> <span>{selectedItem.email || 'N/A'}</span></div>
                                </div>
                            </section>
                            <section className="yb-drawer-section">
                                <h3>{activeTab === 'requests' ? <FaBaby /> : <FaCalendarAlt />} Details</h3>
                                <div className="yb-drawer-info">
                                    <p><strong>Ritual:</strong> {selectedItem.eventName || 'Analysis'}</p>
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
                                            <p><strong>Scheduled:</strong> {selectedItem.date} @ {selectedItem.start}</p>
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
                            {getStatusMeta(selectedItem).cls === 'pending' ? (
                                <div className="yb-action-group">
                                    <button className="yb-btn-reject-full" onClick={() => handleAction(selectedItem.id, 'reject')}>Decline</button>
                                    <button className="yb-btn-accept-full" onClick={() => handleAction(selectedItem.id, activeTab === 'requests' ? 'view' : 'accept')}>
                                        {activeTab === 'requests' ? 'Acknowledge' : 'Accept Booking'}
                                    </button>
                                </div>
                            ) : (
                                <button className="yb-btn-close-full" onClick={() => setSelectedItem(null)}>Close Details</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MuhurtamRequests;