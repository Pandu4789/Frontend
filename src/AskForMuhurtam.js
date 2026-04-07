import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
    FaCalendarAlt, FaStar, FaMapMarkerAlt, FaTimes, 
    FaCheckCircle, FaHandsHelping, FaHistory 
} from 'react-icons/fa';
import './AskForMuhurtam.css';

const AskForMuhurtam = ({ priest, customer, setCustomer, nakshatramList, onClose }) => {
    const [eventId, setEventId] = useState('');
    const [selectedEventName, setSelectedEventName] = useState('');
    const [nakshatram, setNakshatram] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [events, setEvents] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [errors, setErrors] = useState({});
    const [birthErrors, setBirthErrors] = useState({});

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/events');
                setEvents(res.data);
            } catch (error) { 
                toast.error('Failed to load events.'); 
            }
        };
        fetchEvents();
    }, []);

    const validateMainForm = () => {
        const newErrors = {};
        if (!eventId) newErrors.eventId = true;
        
        const hasNakshatram = nakshatram && nakshatram.trim() !== '';
        const hasBirthDetails = birthDate && birthTime && birthPlace.trim();
        
        if (!hasNakshatram && !hasBirthDetails) newErrors.details = true; 

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
        setErrors(prev => ({ ...prev, details: false })); 
        toast.success('Birth details recorded.');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!validateMainForm()) {
            toast.error('Please complete the required astrological fields.');
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
            priestId: priest?.id || null,
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
            <div className={`am-card ${showConfirmation ? 'am-confirm-mode' : ''} ${Object.keys(errors).length > 0 ? 'animate-shake' : ''}`}>
                <button className="am-close" onClick={onClose} aria-label="Close"><FaTimes /></button>

                {showConfirmation ? (
                    <div className="am-success-view">
                        <div className="am-success-header">
                            <div className="am-icon-circle-success animate-pop">
                                <FaCheckCircle />
                            </div>
                            <h2 className="animate-fade-in">Request Submitted</h2>
                            <p className="am-success-tagline">Our priest is now analyzing the Panchang for your Muhurtam.</p>
                        </div>

                        <div className="am-receipt-card animate-slide-up">
                            <div className="am-receipt-row">
                                <span>Occasion</span>
                                <strong>{selectedEventName}</strong>
                            </div>
                            <div className="am-receipt-row">
                                <span>Priest</span>
                                <strong>{priest.firstName} {priest.lastName}</strong>
                            </div>
                            <div className="am-receipt-row">
                                <span>Calculation Basis</span>
                                <strong>{nakshatram ? `Star: ${nakshatram}` : 'Birth Chart Details'}</strong>
                            </div>
                        </div>

                        <div className="am-next-steps animate-fade-in">
                            <h4>What happens next?</h4>
                            <div className="am-step">
                                <div className="am-step-indicator"><FaHistory /></div>
                                <p><strong>Panchang Analysis:</strong> The priest will find the most auspicious Tithi for you.</p>
                            </div>
                            <div className="am-step">
                                <div className="am-step-indicator"><FaCalendarAlt /></div>
                                <p><strong>Updates:</strong> You will receive proposed dates in your <strong>"My Rituals"</strong> tab.</p>
                            </div>
                        </div>

                        <button onClick={onClose} className="am-btn-finish">Return to Profile</button>
                    </div>
                ) : (
                    <div className="am-split-container">
                        <aside className="am-sidebar-branding">
                            <div className="am-branding-content">
                                <div className="am-priest-box">
                                    <img 
                                        src={priest.imageUrl || '/placeholder.png'} 
                                        alt="Priest" 
                                        className="am-priest-img" 
                                    />
                                    <div className="am-priest-text">
                                        <h4>{priest.firstName} {priest.lastName}</h4>
                                        <p><FaMapMarkerAlt /> {priest.city}, {priest.state}</p>
                                    </div>
                                </div>
                                <div className="am-feature-list">
                                    <div className="am-feature-item"><FaHandsHelping /> Vedic Astrology Expert</div>
                                    <div className="am-feature-item"><FaStar /> Precise Tithi Calculation</div>
                                </div>
                            </div>
                        </aside>

                        <main className="am-form-area">
                            <header className="am-form-header">
                                <h3>Seek Auspicious Time</h3>
                                <p>Professional astrological consultation for your sacred events.</p>
                            </header>

                            <div className="am-field">
                                <label className={errors.eventId ? 'error-label' : ''}>Sacred Occasion</label>
                                <select 
                                    className={`am-input ${errors.eventId ? 'error-border' : ''}`} 
                                    value={eventId} 
                                    onChange={e => {
                                        setEventId(e.target.value);
                                        const name = events.find(ev => ev.id === parseInt(e.target.value))?.name;
                                        setSelectedEventName(name || '');
                                        setErrors(prev => ({...prev, eventId: false}));
                                    }}
                                >
                                    <option value="">Select Ritual Type...</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                            </div>

                            <div className="am-field">
                                <label className={errors.details ? 'error-label' : ''}>Birth Star (Nakshatram)</label>
                                <select 
                                    className={`am-input ${errors.details ? 'error-border' : ''}`} 
                                    value={nakshatram} 
                                    onChange={e => {
                                        setNakshatram(e.target.value);
                                        setErrors(prev => ({...prev, details: false}));
                                    }}
                                >
                                    <option value="">Choose Nakshatram...</option>
                                    {nakshatramList.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                                </select>
                                <button type="button" className="am-helper-btn" onClick={() => setShowBirthDetailsPopup(true)}>
                                    Don't know your Star? Enter birth details
                                </button>
                            </div>

                            <div className="am-field">
                                <label>Special Instructions</label>
                                <textarea 
                                    className="am-textarea" 
                                    placeholder="Family traditions or specific time windows..." 
                                    value={customer.note || ''} 
                                    onChange={e => setCustomer(prev => ({ ...prev, note: e.target.value }))} 
                                />
                            </div>

                            <footer className="am-form-footer">
                                <button type="button" className="am-btn-secondary" onClick={onClose}>Cancel</button>
                                <button 
                                    type="button" 
                                    className="am-btn-primary" 
                                    onClick={handleSendMuhurtamRequest} 
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Sending Request...' : 'Send Request'}
                                </button>
                            </footer>
                        </main>
                    </div>
                )}

                {showBirthDetailsPopup && (
                    <div className="am-modal-overlay-inner">
                        <div className={`am-modal-inner ${Object.keys(birthErrors).length > 0 ? 'animate-shake' : ''}`}>
                            <div className="am-modal-inner-header">
                                <h3>Birth Chart Details</h3>
                                <p>Strictly used for precise Nakshatram and Tithi calculations.</p>
                            </div>
                            <div className="am-modal-inner-grid">
                                <div className="am-field">
                                    <label className={birthErrors.birthDate ? 'error-label' : ''}>Date of Birth</label>
                                    <input 
                                        type="date" 
                                        value={birthDate} 
                                        onChange={e => {setBirthDate(e.target.value); setBirthErrors(prev => ({...prev, birthDate: false}))}} 
                                        className={`am-input ${birthErrors.birthDate ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field">
                                    <label className={birthErrors.birthTime ? 'error-label' : ''}>Time of Birth</label>
                                    <input 
                                        type="time" 
                                        value={birthTime} 
                                        onChange={e => {setBirthTime(e.target.value); setBirthErrors(prev => ({...prev, birthTime: false}))}} 
                                        className={`am-input ${birthErrors.birthTime ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field full-span">
                                    <label className={birthErrors.birthPlace ? 'error-label' : ''}>Place of Birth</label>
                                    <input 
                                        type="text" 
                                        placeholder="City, State, Country" 
                                        value={birthPlace} 
                                        onChange={e => {setBirthPlace(e.target.value); setBirthErrors(prev => ({...prev, birthPlace: false}))}} 
                                        className={`am-input ${birthErrors.birthPlace ? 'error-border' : ''}`} 
                                    />
                                </div>
                            </div>
                            <div className="am-modal-inner-footer">
                                <button type="button" className="am-btn-save-inner" onClick={handleSaveBirthDetails}>Apply Details</button>
                                <button type="button" className="am-btn-back-inner" onClick={() => {setShowBirthDetailsPopup(false); setBirthErrors({});}}>Go Back</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;