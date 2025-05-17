import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './PriestProfile.css';
import BookingModal from './BookingModal';
import AskForMuhurtam from './AskForMuhurtam';
import LoginPromptModal from './LoginPromptModal';

const PriestProfile = () => {
    const [priest, setPriest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    const [customer, setCustomer] = useState(null);
    const [nakshatramList, setNakshatramList] = useState([]);

    const { id: Id } = useParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [priestRes, nakshatraRes] = await Promise.all([
                    axios.get(`http://localhost:8080/api/auth/priests/${Id}`),
                    axios.get('http://localhost:8080/api/nakshatram')
                ]);
                setPriest(priestRes.data);
                setNakshatramList(nakshatraRes.data);
            } catch (err) {
                console.error('Priest or Nakshatram load failed:', err);
                setError('Failed to load priest or nakshatram data');
                toast.error('Error loading data');
                setLoading(false);
                return;
            }

            // Optional customer fetch
            try {
                const username = localStorage.getItem('username');
                if (username) {
                    const customerRes = await axios.get(`http://localhost:8080/api/profile`, {
                        params: { username }
                    });
                    const data = customerRes.data;
                    setCustomer({
                        name: `${data.firstName} ${data.lastName}`,
                        email: data.mailId,
                        phone: data.phone,
                        address: data.address,
                        note: '',
                    });
                } else {
                    setCustomer(null);
                }
            } catch (err) {
                console.warn('Customer not logged in or profile fetch failed (OK for guest):', err);
                setCustomer(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [Id]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error || !priest) return <div className="error">{error || "Priest not found."}</div>;

    return (
        <div className="profile-wrapper">
            <div className="profile-main">
                <div className="profile-left">
                    <h1 className="priest-name">{priest.firstName} {priest.lastName}</h1>

                    <div className="profile-section">
                        <h2>About</h2>
                        <p>{priest.profile?.bio || "No bio available."}</p>
                    </div>

                    <div className="profile-section">
                        <h2>Services</h2>
                        <div className="services">
                            {priest.poojas && priest.poojas.length > 0 ? (
                                priest.poojas.map((pooja, index) => (
                                    <span key={index} className="service-tag">{pooja.name}</span>
                                ))
                            ) : (
                                <p>No services listed.</p>
                            )}
                        </div>
                    </div>

                    <div className="profile-section">
                        <h2>Contact Info</h2>
                        <div className="contact-info">
                            <p>📞 {priest.phone || 'N/A'}</p>
                            <p>✉️ {priest.mailId || 'N/A'}</p>
                            <p>📍 {priest.address || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="buttons">
                        <button className="muhurtam-btn" onClick={() => {
                            if (!customer) {
                                setShowLoginPrompt(true);
                            } else {
                                setShowMuhurtamModal(true);
                            }
                        }}>
                            Ask for Muhurtam
                        </button>
                        <button className="book-btn" onClick={() => {
                            if (!customer) {
                                setShowLoginPrompt(true);
                            } else {
                                setShowBookingModal(true);
                            }
                        }}>
                            Book Now
                        </button>
                    </div>
                </div>

                <div className="profile-right">
                    {priest.profile?.profilePicture ? (
                        <img src={priest.profile.profilePicture} alt="Priest" className="priest-image" />
                    ) : (
                        <div className="priest-image-placeholder">No Image</div>
                    )}
                </div>
            </div>

            {showBookingModal && (
                <BookingModal
                    priest={priest}
                    customer={customer}
                    setCustomer={setCustomer}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
            {showMuhurtamModal && (
                <AskForMuhurtam
                    priest={priest}
                    customer={customer}
                    setCustomer={setCustomer}
                    nakshatramList={nakshatramList}
                    onClose={() => setShowMuhurtamModal(false)}
                />
            )}
            {showLoginPrompt && (
                <LoginPromptModal onClose={() => setShowLoginPrompt(false)} />
            )}
        </div>
    );
};

export default PriestProfile;
