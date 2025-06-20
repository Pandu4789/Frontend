import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './PriestProfile.css';
import BookingModal from './BookingModal';
import AskForMuhurtam from './AskForMuhurtam';
import LoginPromptModal from './LoginPromptModal';
import HoroscopeModal from './HoroscopeModal'; // ✅ 1. Import the new modal component
import { FaPhoneAlt, FaUserCircle, FaEnvelope, FaMapMarkerAlt, FaStar } from 'react-icons/fa'; // ✅ 2. Import a new icon

const PriestProfile = () => {
    const [priest, setPriest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [showHoroscopeModal, setShowHoroscopeModal] = useState(false); // ✅ 3. Add state for the new modal
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '', note: '' });
    const [nakshatramList, setNakshatramList] = useState([]);

    const { id: priestId } = useParams(); // Renamed for clarity

    const formatAddress = (priestData) => {
        if (!priestData) return 'N/A';
        const addressLines = [];
        if (priestData.addressLine1) addressLines.push(priestData.addressLine1);
        if (priestData.addressLine2) addressLines.push(priestData.addressLine2);
        const cityState = [];
        if (priestData.city) cityState.push(priestData.city);
        if (priestData.state) cityState.push(priestData.state);
        if (cityState.length > 0) addressLines.push(cityState.join(', '));
        if (priestData.zipCode) addressLines.push(priestData.zipCode);
        if (priestData.country) addressLines.push(priestData.country);
        if (addressLines.length === 0) return 'N/A';
        return <>{addressLines.map((line, index) => (<React.Fragment key={index}>{line}{index < addressLines.length - 1 && <br />}</React.Fragment>))}</>;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // This logic assumes your API returns the `offersHoroscopeReading` boolean field
                const priestRes = await axios.get(`http://localhost:8080/api/auth/priests/${priestId}`);
                const basicPriest = priestRes.data;

                const profileRes = await axios.get(`http://localhost:8080/api/profile?email=${basicPriest.email}`);
                const profileData = profileRes.data;
                
                const fullPriest = { ...basicPriest, ...profileData, poojas: profileData.services, languages: profileData.languages };
                setPriest(fullPriest);

                const nakshatraRes = await axios.get('http://localhost:8080/api/nakshatram');
                setNakshatramList(nakshatraRes.data);

                const email = localStorage.getItem('userEmail');
                if (email) {
                    const customerRes = await axios.get(`http://localhost:8080/api/profile?email=${email}`);
                    const data = customerRes.data;
                    setCustomer({ name: `${data.firstName || ''} ${data.lastName || ''}`, email: data.email || '', phone: data.phone || '', address: data.address || '', note: '' });
                }
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load priest profile.');
                toast.error('Error loading data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [priestId]);

    // ✅ 4. A unified handler to check for login before opening any modal
    const handleActionClick = (action) => {
        const isLoggedIn = !!localStorage.getItem('userEmail');
        if (!isLoggedIn) {
            setShowLoginPrompt(true);
        } else {
            action(); // Perform the requested action (e.g., open a modal)
        }
    };

    if (loading) return <div className="pp-profile-loading-error">Loading priest profile...</div>;
    if (error || !priest) return <div className="pp-profile-loading-error">{error || "Priest not found."}</div>;

    return (
        <div className="pp-profile-wrapper">
            <div className="pp-profile-main">
                <div className="pp-profile-left">
                    <h1 className="pp-priest-name">{priest.firstName} {priest.lastName}</h1>
                    <div className="pp-profile-section">
                        <h2>About</h2>
                        <p>{priest.bio || "No bio available."}</p>
                    </div>
                    <div className="pp-profile-section">
                        <h2>Services</h2>
                        <div className="pp-services-grid">
                            {priest.poojas && priest.poojas.length > 0 ? (
                                priest.poojas.map((pooja, index) => (<span key={index} className="pp-service-tag">{pooja}</span>))
                            ) : (
                                <p className="pp-no-data-message">No services listed.</p>
                            )}
                        </div>
                    </div>
                    <div className="pp-profile-section">
                        <h2>Languages</h2>
                        <div className="pp-services-grid">
                           {priest.languages && priest.languages.length > 0 ? (
                                priest.languages.map((language, index) => (<span key={index} className="pp-service-tag">{language}</span>))
                            ) : (
                                <p className="pp-no-data-message">No languages listed.</p>
                            )}
                        </div>
                    </div>
                    <div className="pp-profile-section">
                        <h2>Contact Info</h2>
                        <div className="pp-contact-info">
                            <p><FaPhoneAlt className="pp-contact-icon" /> <span className="pp-contact-detail">{priest.phone || 'N/A'}</span></p>
                            <p><FaEnvelope className="pp-contact-icon" /> <span className="pp-contact-detail">{priest.email || 'N/A'}</span></p>
                            <p><FaMapMarkerAlt className="pp-contact-icon" /> <span className="pp-contact-detail">{formatAddress(priest)}</span></p>
                        </div>
                    </div>

                    <div className="pp-profile-actions">
                        <button className="pp-book-btn" onClick={() => handleActionClick(() => setShowBookingModal(true))}>
                            Book Now
                        </button>
                        <button className="pp-muhurtam-btn" onClick={() => handleActionClick(() => setShowMuhurtamModal(true))}>
                            Ask for Muhurtam
                        </button>
                        
                        {/* ✅ 5. The new conditional button */}
                        {priest.offersHoroscopeReading && (
                            <button 
                                className="pp-horoscope-btn" 
                                onClick={() => handleActionClick(() => setShowHoroscopeModal(true))}
                            >
                                <FaStar /> Request Horoscope
                            </button>
                        )}
                    </div>
                </div>

                <div className="pp-profile-right">
                    {priest.imageUrl ? (
                        <img src={priest.imageUrl} alt={`${priest.firstName} ${priest.lastName}`} className="pp-priest-profile-image" />
                    ) : (
                        <div className="pp-priest-profile-image-placeholder">
                            <FaUserCircle className="pp-placeholder-icon" />
                            <span>No Image Available</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals are now rendered at the bottom */}
            {showBookingModal && ( <BookingModal priest={priest} customer={customer} setCustomer={setCustomer} onClose={() => setShowBookingModal(false)} /> )}
            {showMuhurtamModal && ( <AskForMuhurtam priest={priest} customer={customer} setCustomer={setCustomer} nakshatramList={nakshatramList} onClose={() => setShowMuhurtamModal(false)} /> )}
            {showLoginPrompt && ( <LoginPromptModal onClose={() => setShowLoginPrompt(false)} /> )}
            {showHoroscopeModal && ( <HoroscopeModal priest={priest} onClose={() => setShowHoroscopeModal(false)} /> )}
        </div>
    );
};

export default PriestProfile;