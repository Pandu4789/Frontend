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
    
    // Error States
    const [errors, setErrors] = useState({});
    const [birthErrors, setBirthErrors] = useState({});

    useEffect(() => {
        axios.get('http://localhost:8080/api/events').then(res => setEvents(res.data));
    }, []);

    const validateMainForm = () => {
        const newErrors = {};
        if (!eventId) newErrors.eventId = true;
        
        // Ensure either Nakshatram is picked OR Birth Details are filled
        const hasNakshatram = nakshatram && nakshatram.trim() !== '';
        const hasBirthDetails = birthDate && birthTime && birthPlace.trim();
        
        if (!hasNakshatram && !hasBirthDetails) {
            newErrors.nakshatram = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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
        // Clear main form nakshatram error if they provided birth details instead
        setErrors(prev => ({ ...prev, nakshatram: false }));
        toast.success('Birth details recorded.');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!validateMainForm()) {
            toast.error('Please fill in all required fields.');
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
            {/* Added shake animation trigger on main card */}
            <div className={`am-card ${Object.keys(errors).length > 0 ? 'animate-shake' : ''}`}>
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

                        <div className="am-form-side">
                            <header className="am-form-header">
                                <h3>Seek Auspicious Time</h3>
                            </header>

                            <div className="am-field">
                                <label className={errors.eventId ? 'error-label' : ''}>Sacred Occasion</label>
                                <select 
                                    className={`am-input ${errors.eventId ? 'error-border' : ''}`} 
                                    value={eventId} 
                                    onChange={e => {setEventId(e.target.value); setErrors({...errors, eventId: false})}}
                                >
                                    <option value="">Select Ritual...</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                            </div>

                            <div className="am-field">
                                <label className={errors.nakshatram ? 'error-label' : ''}>Birth Star (Nakshatram)</label>
                                <select 
                                    className={`am-input ${errors.nakshatram ? 'error-border' : ''}`} 
                                    value={nakshatram} 
                                    onChange={e => {setNakshatram(e.target.value); setErrors({...errors, nakshatram: false})}}
                                >
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

                {showBirthDetailsPopup && (
                    <div className="am-modal-overlay-inner">
                        {/* Added shake animation to inner popup */}
                        <div className={`am-modal-inner ${Object.keys(birthErrors).length > 0 ? 'animate-shake' : ''}`}>
                            <div className="am-modal-inner-header">
                                <h3>Birth Chart Details</h3>
                                <p>Used strictly for Nakshatram calculation.</p>
                            </div>
                            <div className="am-modal-inner-grid">
                                <div className="am-field">
                                    <label className={birthErrors.birthDate ? 'error-label' : ''}>Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={birthDate} 
                                        onChange={e => {setBirthDate(e.target.value); setBirthErrors({...birthErrors, birthDate: false})}} 
                                        className={`am-input ${birthErrors.birthDate ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field">
                                    <label className={birthErrors.birthTime ? 'error-label' : ''}>Time of Birth</label>
                                    <input 
                                        type="time" 
                                        value={birthTime} 
                                        onChange={e => {setBirthTime(e.target.value); setBirthErrors({...birthErrors, birthTime: false})}} 
                                        className={`am-input ${birthErrors.birthTime ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field full-span">
                                    <label className={birthErrors.birthPlace ? 'error-label' : ''}>Place of Birth</label>
                                    <input 
                                        type="text" 
                                        placeholder="City, State, Country" 
                                        value={birthPlace} 
                                        onChange={e => {setBirthPlace(e.target.value); setBirthErrors({...birthErrors, birthPlace: false})}} 
                                        className={`am-input ${birthErrors.birthPlace ? 'error-border' : ''}`} 
                                    />
                                </div>
                            </div>
                            <div className="am-modal-inner-footer">
                                <button className="am-btn-save-inner" onClick={handleSaveBirthDetails}>Save Details</button>
                                <button className="am-btn-back-inner" onClick={() => {setShowBirthDetailsPopup(false); setBirthErrors({});}}>Go Back</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;