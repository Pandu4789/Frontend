import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FaCalendarAlt, FaStar, FaMapMarkerAlt, FaTimes, 
    FaCheckCircle, FaUserCircle, FaHistory, FaInfoCircle 
} from 'react-icons/fa';
import './AskForMuhurtam.css';

const AskForMuhurtam = ({ priest, customer, setCustomer, nakshatramList, onClose }) => {
    const [eventId, setEventId] = useState('');
    const [nakshatram, setNakshatram] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [events, setEvents] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [birthErrors, setBirthErrors] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/events').then(res => setEvents(res.data));
    }, []);

    const validateBirthDetails = () => {
        const bErrors = {};
        if (!birthDate) bErrors.birthDate = true;
        if (!birthTime) bErrors.birthTime = true;
        if (!birthPlace.trim()) bErrors.birthPlace = true;
        setBirthErrors(bErrors);
        return Object.keys(bErrors).length === 0;
    };

    const handleSaveBirthDetails = () => {
        if (!validateBirthDetails()) {
            toast.error('Please fill in all birth details.');
            return;
        }
        toast.success('Birth details recorded.');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!eventId) {
            toast.error('Please select an occasion.');
            return;
        }
        setIsSubmitting(true);
        const payload = {
            event: eventId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            note: customer.note || '',
            nakshatram: nakshatram || null,
            date: birthDate || null,
            time: birthTime || null,
            place: birthPlace || null,
            priestId: priest?.id,
            userId: localStorage.getItem('userId'),
        };

        try {
            await axios.post('http://localhost:8080/api/muhurtam/request', payload);
            setShowConfirmation(true);
        } catch (error) { 
            toast.error('Connection lost. Please try again.'); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="am-overlay">
            <div className="am-card">
                <button className="am-close" onClick={onClose}><FaTimes /></button>

                {showConfirmation ? (
                    <div className="am-success-view">
                        <FaCheckCircle className="am-icon-circle-success" />
                        <h2>Muhurtam Requested</h2>
                        <p>Our priest will analyze the Panchang for your ritual.</p>
                        <button onClick={onClose} className="am-btn-finish">Understood</button>
                    </div>
                ) : (
                    <div className="am-split-container">
                        {/* LEFT SIDE: SUMMARY */}
                        <div className="am-summary-side">
                            <div className="am-priest-mini">
                                <div className="am-priest-img-container">
                                    {priest.imageUrl ? (
                                        <img src={priest.imageUrl} alt="Priest" />
                                    ) : (
                                        <FaUserCircle className="am-user-placeholder" />
                                    )}
                                </div>
                                <div className="am-mini-meta">
                                    <h4>{priest.firstName} {priest.lastName}</h4>
                                    <span>Panchang Analysis Expert</span>
                                </div>
                            </div>
                            <div className="am-trust-badges">
                                <div className="am-trust-item"><FaCheckCircle className="icon-green" /> Vedic Time Calculation</div>
                                <div className="am-trust-item"><FaStar className="icon-green" /> Tithi & Nakshatram Alignment</div>
                            </div>
                        </div>

                        {/* RIGHT SIDE: FORM */}
                        <div className="am-form-side">
                            <header className="am-form-header">
                                <h3>Seek Auspicious Time</h3>
                            </header>

                            <div className="am-field">
                                <label>Sacred Occasion</label>
                                <select className="am-input" value={eventId} onChange={e => setEventId(e.target.value)}>
                                    <option value="">Select Ritual...</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                            </div>

                            <div className="am-field">
                                <label>Birth Star (Nakshatram)</label>
                                <select className="am-input" value={nakshatram} onChange={e => setNakshatram(e.target.value)}>
                                    <option value="">Choose your Nakshatram...</option>
                                    {nakshatramList.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                                </select>
                                <button type="button" className="am-helper-btn" onClick={() => setShowBirthDetailsPopup(true)}>
                                    Don't know? Enter birth details instead
                                </button>
                            </div>

                            <div className="am-field">
                                <label>Additional Notes</label>
                                <textarea 
                                    className="am-textarea" 
                                    placeholder="Any specific preferences or traditions..." 
                                    value={customer.note || ''} 
                                    onChange={e => setCustomer({ ...customer, note: e.target.value })} 
                                />
                            </div>

                            <footer className="am-actions">
                                <button className="am-btn-cancel" onClick={onClose}>Cancel</button>
                                <button className="am-btn-submit" onClick={handleSendMuhurtamRequest} disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : 'Request Muhurtam'}
                                </button>
                            </footer>
                        </div>
                    </div>
                )}

                {/* RESTORED: BIRTH DETAILS MODAL */}
                {showBirthDetailsPopup && (
                    <div className="am-modal-overlay-inner">
                        <div className="am-modal-inner">
                            <div className="am-modal-inner-header">
                                <h3>Birth Chart Details</h3>
                                <p>Used strictly for Nakshatram calculation.</p>
                            </div>
                            <div className="am-modal-inner-grid">
                                <div className="am-field">
                                    <label>Date of Birth</label>
                                    <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="am-input" />
                                </div>
                                <div className="am-field">
                                    <label>Time of Birth</label>
                                    <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)} className="am-input" />
                                </div>
                                <div className="am-field full-span">
                                    <label>Place of Birth</label>
                                    <input type="text" placeholder="City, State, Country" value={birthPlace} onChange={e => setBirthPlace(e.target.value)} className="am-input" />
                                </div>
                            </div>
                            <div className="am-modal-inner-footer">
                                <button className="am-btn-save-inner" onClick={handleSaveBirthDetails}>Save Details</button>
                                <button className="am-btn-back-inner" onClick={() => setShowBirthDetailsPopup(false)}>Go Back</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;