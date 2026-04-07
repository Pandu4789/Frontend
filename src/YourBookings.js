import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, isValid } from 'date-fns';
import { toast } from 'react-toastify'; 
import { 
    FaCheckCircle, FaExclamationCircle, FaUserAlt, FaCalendarAlt, FaInbox, 
    FaChevronLeft, FaChevronRight, FaArrowLeft, FaTimesCircle, FaMapMarkerAlt, 
    FaExternalLinkAlt, FaInfoCircle, FaPhoneAlt, FaEnvelope 
} from 'react-icons/fa';
import './YourBookings.css';

const API_BASE = "http://localhost:8080";

const YourBookings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('bookings');
    const [appointmentBookings, setAppointmentBookings] = useState([]);
    const [muhurtamRequests, setMuhurtamRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null); 
    const itemsPerPage = 6;

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

    const visibleData = useMemo(() => {
        const data = activeTab === 'bookings' ? appointmentBookings : muhurtamRequests;
        const start = (currentPage - 1) * itemsPerPage;
        return data.slice(start, start + itemsPerPage);
    }, [activeTab, appointmentBookings, muhurtamRequests, currentPage]);

    const totalPages = Math.ceil((activeTab === 'bookings' ? appointmentBookings.length : muhurtamRequests.length) / itemsPerPage);

    const getStatusMeta = (item) => {
        const raw = (item.status || (item.viewed ? 'Viewed' : 'Pending')).toLowerCase();
        if (raw.includes('accept') || raw.includes('confirm')) return { cls: 'confirmed', icon: <FaCheckCircle /> };
        if (raw.includes('reject') || raw.includes('cancel')) return { cls: 'rejected', icon: <FaTimesCircle /> };
        if (raw === 'viewed') return { cls: 'viewed', icon: <FaInfoCircle /> };
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
                        <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => {setActiveTab('bookings'); setCurrentPage(1);}}>Ritual Bookings</button>
                        <button className={activeTab === 'requests' ? 'active' : ''} onClick={() => {setActiveTab('requests'); setCurrentPage(1);}}>Muhurtam Requests</button>
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
                                                <div className="yb-data-row"><span className="yb-label">PRIEST</span><span className="yb-value">{item.priestName}</span></div>
                                                <div className="yb-data-row"><span className="yb-label">SCHEDULE</span><span className="yb-value">{item.date ? format(new Date(item.date), 'MMMM dd, yyyy') : 'TBD'} {item.start ? `@ ${item.start}` : ''}</span></div>
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
                        <div className="yb-empty-state"><FaInbox size={50} /><h3>No activity found</h3></div>
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
                                <h3><FaCalendarAlt /> Appointment Details</h3>
                                <div className="yb-drawer-info">
                                    <p><strong>Ritual:</strong> {selectedItem.eventName}</p>
                                    <p><strong>Date:</strong> {selectedItem.date ? format(new Date(selectedItem.date), 'PPPP') : 'To be determined'}</p>
                                    <p><strong>Time:</strong> {selectedItem.start || 'To be determined'}</p>
                                </div>
                            </section>

                            {selectedItem.address && (
                                <section className="yb-drawer-section">
                                    <h3><FaMapMarkerAlt /> Venue Location</h3>
                                    <p className="yb-drawer-address">{selectedItem.address}</p>
                                </section>
                            )}

                            {selectedItem.note && (
                                <section className="yb-drawer-section">
                                    <h3><FaInfoCircle /> Your Instructions</h3>
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