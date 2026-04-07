import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './PriestProfile.css';
import BookingModal from './BookingModal';
import AskForMuhurtam from './AskForMuhurtam';
import LoginPromptModal from './LoginPromptModal';
import HoroscopeModal from './HoroscopeModal';
import { FaPhoneAlt, FaUserCircle, FaEnvelope, FaMapMarkerAlt, FaStar, FaGlobe, FaAward, FaCalendarCheck } from 'react-icons/fa';

const PriestProfile = () => {
    const [priest, setPriest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showHoroscopeModal, setShowHoroscopeModal] = useState(false);
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '', note: '' });
    const [nakshatramList, setNakshatramList] = useState([]);

    const { id: priestId } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const priestRes = await axios.get(`http://localhost:8080/api/auth/priests/${priestId}`);
                const profileRes = await axios.get(`http://localhost:8080/api/profile?email=${priestRes.data.email}`);
                
                setPriest({ ...priestRes.data, ...profileRes.data, poojas: profileRes.data.services, languages: profileRes.data.languages });

                const nakshatraRes = await axios.get('http://localhost:8080/api/nakshatram');
                setNakshatramList(nakshatraRes.data);

                const email = localStorage.getItem('userEmail');
                if (email) {
                    const customerRes = await axios.get(`http://localhost:8080/api/profile?email=${email}`);
                    setCustomer({ 
                        name: `${customerRes.data.firstName || ''} ${customerRes.data.lastName || ''}`, 
                        email: customerRes.data.email || '', 
                        phone: customerRes.data.phone || '', 
                        address: customerRes.data.address || '', 
                        note: '' 
                    });
                }
            } catch (err) {
                setError('Profile unavailable.');
                toast.error('Connection error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [priestId]);

    const handleActionClick = (action) => {
        if (!localStorage.getItem('userEmail')) {
            setShowLoginPrompt(true);
        } else {
            action();
        }
    };

    if (loading) return <div className="pp-status-msg">Refining Profile Details...</div>;
    if (error || !priest) return <div className="pp-status-msg">{error}</div>;

    return (
        <div className="pp-dashboard-wrapper">
            <div className="pp-grid-layout">
                
                {/* LEFT: INFORMATION STACK */}
                <div className="pp-main-info">
                    <div className="pp-breadcrumb">Priests › {priest.firstName} {priest.lastName}</div>
                    
                    <header className="pp-hero-section">
                        <h1>{priest.firstName} {priest.lastName}</h1>
                        <div className="pp-badges">
                            <span className="pp-badge-certified"><FaAward /> Verified Priest</span>
                            <span className="pp-badge-location"><FaMapMarkerAlt /> {priest.city}, {priest.state}</span>
                        </div>
                    </header>

                    <section className="pp-content-block">
                        <h3>About the Priest</h3>
                        <p className="pp-bio-text">{priest.bio || "Authentic Vedic scholar providing ritual services with deep spiritual insight."}</p>
                    </section>

                    <section className="pp-content-block">
                        <h3>Services</h3>
                        <div className="pp-tag-container">
                            {priest.poojas?.map((p, i) => <span key={i} className="pp-pooja-tag">{p}</span>)}
                        </div>
                    </section>

                    <section className="pp-content-block">
                        <h3>Languages</h3>
                        <div className="pp-tag-container">
                            {priest.languages?.map((l, i) => <span key={i} className="pp-lang-tag"><FaGlobe /> {l}</span>)}
                        </div>
                    </section>
                </div>

                {/* RIGHT: STICKY BOOKING SIDEBAR */}
                <aside className="pp-sidebar-anchor">
                    <div className="pp-booking-card">
                        <div className="pp-image-frame">
                            {priest.imageUrl ? (
                                <img src={priest.imageUrl} alt="Priest" />
                            ) : (
                                <div className="pp-img-fallback"><FaUserCircle /></div>
                            )}
                        </div>

                        <div className="pp-pricing-preview">
                            <span className="pp-price-label">Available for Bookings</span>
                        </div>

                        <div className="pp-cta-group">
                            <button className="pp-btn-book" onClick={() => handleActionClick(() => setShowBookingModal(true))}>
                                <FaCalendarCheck /> Book Service Now
                            </button>
                            
                            <button className="pp-btn-muhurtam" onClick={() => handleActionClick(() => setShowMuhurtamModal(true))}>
                                Ask for Muhurtam
                            </button>

                            {priest.offersHoroscopeReading && (
                                <button className="pp-btn-horoscope" onClick={() => handleActionClick(() => setShowHoroscopeModal(true))}>
                                    <FaStar /> Horoscope Analysis
                                </button>
                            )}
                        </div>

                        <div className="pp-contact-summary">
                            <p><FaPhoneAlt /> {priest.phone || 'Phone hidden'}</p>
                            <p><FaEnvelope /> {priest.email}</p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Modals */}
            {showBookingModal && (
  <BookingModal 
    priest={priest} 
    customer={customer} 
    setCustomer={setCustomer}  // <--- ENSURE THIS LINE EXISTS
    onClose={() => setShowBookingModal(false)} 
  />
)}
            {showMuhurtamModal && <AskForMuhurtam priest={priest} customer={customer} nakshatramList={nakshatramList} onClose={() => setShowMuhurtamModal(false)} />}
            {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />}
            {showHoroscopeModal && <HoroscopeModal priest={priest} onClose={() => setShowHoroscopeModal(false)} />}
        </div>
    );
};

export default PriestProfile;