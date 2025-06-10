import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import './PriestProfile.css';
import BookingModal from './BookingModal';
import AskForMuhurtam from './AskForMuhurtam';
import LoginPromptModal from './LoginPromptModal';

import { FaPhoneAlt, FaUserCircle, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const PriestProfile = () => {
    const [priest, setPriest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMuhurtamModal, setShowMuhurtamModal] = useState(false);
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    // Initialize customer as an object, even if empty, so BookingModal can render inputs
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '', note: '' });
    const [nakshatramList, setNakshatramList] = useState([]);

    const { id: Id } = useParams();

    // Helper function to format the address
   const formatAddress = (priestData) => {
    if (!priestData) return 'N/A';

    const addressLines = [];

    // Line 1: addressLine1
    if (priestData.addressLine1) {
        addressLines.push(priestData.addressLine1);
    }

    // Line 2: addressLine2
    if (priestData.addressLine2) {
        addressLines.push(priestData.addressLine2);
    }

    // Line 3: City, State (without Zip)
    const cityState = [];
    if (priestData.city) cityState.push(priestData.city);
    if (priestData.state) cityState.push(priestData.state);
    if (cityState.length > 0) {
        addressLines.push(cityState.join(', '));
    }

    // Line 4: Zip code (on its own line, no comma)
    if (priestData.zipCode) {
        addressLines.push(priestData.zipCode);
    }

    // Line 5: Country
    if (priestData.country) {
        addressLines.push(priestData.country);
    }

    if (addressLines.length === 0) {
        return 'N/A';
    }

    return (
        <>
            {addressLines.map((line, index) => (
                <React.Fragment key={index}>
                    {line}
                    {index < addressLines.length - 1 && <br />}
                </React.Fragment>
            ))}
        </>
    );
};


    
        useEffect(() => {
    const fetchData = async () => {
        try {
            // Step 1: Get basic priest data (firstName, lastName, phone, email, etc.)
            const priestRes = await axios.get(`http://localhost:8080/api/auth/priests/${Id}`);
            const basicPriest = priestRes.data;
            console.log('Basic Priest Data:', basicPriest);

            // Step 2: Get full profile using priest's email
            const profileRes = await axios.get(`http://localhost:8080/api/profile?email=${basicPriest.email}`);
            const profileData = profileRes.data;
            console.log('Profile Data:', profileData);
            // Step 3: Merge both results
            const fullPriest = {
                ...basicPriest,
                bio: profileData.bio,
                poojas: profileData.services,
                languages: profileData.languages
            };

            setPriest(fullPriest);

            // Step 4: Get nakshatram list
            const nakshatraRes = await axios.get('http://localhost:8080/api/nakshatram');
            setNakshatramList(nakshatraRes.data);
        } catch (err) {
            console.error('Error fetching priest/profile/nakshatram:', err);
            setError('Failed to load priest profile or nakshatram.');
            toast.error('Error loading data');
            setLoading(false);
            return;
        }

        // Fetch customer if logged in
        try {
            const email = localStorage.getItem('userEmail');
            if (email) {
                const customerRes = await axios.get(`http://localhost:8080/api/profile?email=${email}`);
                const data = customerRes.data;
                setCustomer({ // Update existing customer object
                    name: `${data.firstName || ''} ${data.lastName || ''}`,
                    email: data.email || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    note: '',
                });
            }
            // NO ELSE HERE. If not logged in, customer remains as the initialized empty object.
        } catch (err) {
            console.warn('Customer not logged in or profile fetch failed (OK for guest to proceed):', err);
            // No need to set customer to null here. It remains as the empty object for guest input.
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, [Id]);


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
  priest.poojas.map((pooja, index) => (
    <span key={index} className="pp-service-tag">{pooja}</span>
  ))
) : (
  <p className="pp-no-data-message">No services listed.</p>
)}

                        </div>
                    </div>
                    <div className="pp-profile-section">
                        <h2>Languages</h2>
                        <div className="pp-services-grid">
                           {priest.languages && priest.languages.length > 0 ? (
  priest.languages.map((language, index) => (
    <span key={index} className="pp-service-tag">{language}</span>
  ))
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
                        <button className="pp-muhurtam-btn" onClick={() => {
                            if (!customer || !customer.name) { // Check customer.name to determine if profile is loaded
                                setShowLoginPrompt(true);
                            } else {
                                setShowMuhurtamModal(true);
                            }
                        }}>
                            Ask for Muhurtam
                        </button>
                        <button className="pp-book-btn" onClick={() => {
                            if (!customer || !customer.name) { // Check customer.name to determine if profile is loaded
                                setShowLoginPrompt(true);
                            } else {
                                setShowBookingModal(true);
                            }
                        }}>
                            Book Now
                        </button>
                    </div>
                </div>

                <div className="pp-profile-right">
                    {priest.profile?.profilePicture ? (
                        <img src={priest.profile.profilePicture} alt="Priest" className="pp-priest-profile-image" />
                    ) : (
                        <div className="pp-priest-profile-image-placeholder">
                            <FaUserCircle className="pp-placeholder-icon" />
                            <span>No Image Available</span>
                        </div>
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