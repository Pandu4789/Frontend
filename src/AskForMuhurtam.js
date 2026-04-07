import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaStar, FaMapMarkerAlt, FaTimes, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
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
    
    const [errors, setErrors] = useState({});
    const [birthErrors, setBirthErrors] = useState({});

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:8080/api/events');
                setEvents(res.data);
            } catch (error) { toast.error('Failed to load events.'); }
        };
        fetchEvents();
    }, []);

    const validateMainForm = () => {
        const newErrors = {};
        if (!eventId) newErrors.eventId = true;
        const hasNakshatram = nakshatram.trim() !== '';
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
        toast.success('Birth details captured.');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!validateMainForm()) {
            toast.error('Please complete the highlighted fields.');
            return;
        }

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
        } catch (error) { toast.error('Failed to send request.'); }
    };

    return (
        <div className="am-overlay">
            <div className={`am-card ${showConfirmation ? 'am-confirm-mode' : ''} ${Object.keys(errors).length > 0 ? 'animate-shake' : ''}`}>
                <button className="am-close" onClick={onClose}><FaTimes /></button>

                {showConfirmation ? (
                    <div className="am-success-view">
                        <div className="am-success-header">
                            <div className="am-icon-circle animate-pop">
                                <FaCheckCircle />
                            </div>
                            <h2 className="animate-fade-in">Request Sent!</h2>
                            <p className="am-success-tagline">Calculating the most auspicious time for you.</p>
                        </div>

                        <div className="am-receipt-card animate-slide-up">
                            <div className="am-receipt-row">
                                <span>Purpose</span>
                                <strong>{selectedEventName}</strong>
                            </div>
                            <div className="am-receipt-row">
                                <span>Consulting Priest</span>
                                <strong>{priest.firstName} {priest.lastName}</strong>
                            </div>
                            <div className="am-receipt-row">
                                <span>Based on</span>
                                <strong>{nakshatram ? nakshatram : 'Birth Details Provided'}</strong>
                            </div>
                        </div>

                        <div className="am-next-steps animate-fade-in">
                            <h4>Process Timeline</h4>
                            <div className="am-step">
                                <div className="am-step-number">1</div>
                                <p><strong>Panchang Analysis:</strong> The priest will analyze the Hindu calendar for your specific Nakshatram.</p>
                            </div>
                            <div className="am-step">
                                <div className="am-step-number">2</div>
                                <p><strong>Proposal:</strong> You will receive suggested <strong>Muhurtam dates</strong> via Email/SMS shortly.</p>
                            </div>
                        </div>

                        <div className="am-success-actions">
                            <button onClick={onClose} className="am-btn-finish">Return to Profile</button>
                            <p className="am-support-text">Questions about your chart? Contact the priest directly.</p>
                        </div>
                    </div>
                ) : (
                    <div className="am-split-container">
                        <div className="am-summary-side">
                            <div className="am-priest-mini">
                                <img src={priest.imageUrl || '/placeholder.png'} alt="Priest" />
                                <div className="am-mini-meta">
                                    <h4>{priest.firstName} {priest.lastName}</h4>
                                    <span>{priest.city}, {priest.state}</span>
                                </div>
                            </div>
                            <div className="am-trust-badges">
                                <div className="am-trust-item"><FaCheckCircle className="icon-green" /> Expert Astrological Guidance</div>
                                <div className="am-trust-item"><FaStar className="icon-green" /> Personalized Muhurtam</div>
                            </div>
                        </div>

                        <div className="am-form-side">
                            <header className="am-form-header">
                                <h3>Request a Muhurtam</h3>
                            </header>

                            <div className="am-field">
                                <label className={errors.eventId ? 'error-label' : ''}><FaCalendarAlt /> Occasion Type</label>
                                <select 
                                    className={`am-input ${errors.eventId ? 'error-border' : ''}`} 
                                    value={eventId} 
                                    onChange={e => {
                                        setEventId(e.target.value);
                                        const name = events.find(ev => ev.id === parseInt(e.target.value))?.name;
                                        setSelectedEventName(name || '');
                                        setErrors({...errors, eventId: false});
                                    }}
                                >
                                    <option value="">Select Event...</option>
                                    {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
                                </select>
                            </div>

                            <div className="am-field">
                                <label className={errors.details ? 'error-label' : ''}><FaStar /> Birth Star (Nakshatram)</label>
                                <select 
                                    className={`am-input ${errors.details ? 'error-border' : ''}`} 
                                    value={nakshatram} 
                                    onChange={e => {
                                        setNakshatram(e.target.value);
                                        setErrors({...errors, details: false});
                                    }}
                                >
                                    <option value="">Choose Nakshatram...</option>
                                    {nakshatramList.map(n => <option key={n.id} value={n.name}>{n.name}</option>)}
                                </select>
                                <div className={`am-helper-link ${errors.details ? 'error-text-blink' : ''}`} onClick={() => setShowBirthDetailsPopup(true)}>
                                    Don't know Nakshatram? Enter Birth Details
                                </div>
                            </div>

                            <div className="am-field">
                                <label><FaInfoCircle /> Additional Instructions</label>
                                <textarea className="am-textarea" placeholder="Optional notes for the priest..." value={customer.note || ''} onChange={e => setCustomer(prev => ({ ...prev, note: e.target.value }))} />
                            </div>

                            <footer className="am-actions">
                                <button className="am-btn-cancel" onClick={onClose}>Cancel</button>
                                <button className="am-btn-submit" onClick={handleSendMuhurtamRequest}>Send Request</button>
                            </footer>
                        </div>
                    </div>
                )}

                {showBirthDetailsPopup && (
                    <div className="am-inner-overlay">
                        <div className={`am-inner-card ${Object.keys(birthErrors).length > 0 ? 'animate-shake' : ''}`}>
                            <div className="am-inner-header">
                                <h3>Birth Details</h3>
                                <p>Help the priest calculate your Star.</p>
                            </div>
                            <div className="am-inner-grid">
                                <div className="am-field">
                                    <label className={birthErrors.birthDate ? 'error-label' : ''}>Birth Date</label>
                                    <input 
                                        type="date" 
                                        value={birthDate} 
                                        onChange={e => {setBirthDate(e.target.value); setBirthErrors(prev => ({...prev, birthDate: false}))}} 
                                        className={`am-input ${birthErrors.birthDate ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field">
                                    <label className={birthErrors.birthTime ? 'error-label' : ''}>Birth Time</label>
                                    <input 
                                        type="time" 
                                        value={birthTime} 
                                        onChange={e => {setBirthTime(e.target.value); setBirthErrors(prev => ({...prev, birthTime: false}))}} 
                                        className={`am-input ${birthErrors.birthTime ? 'error-border' : ''}`} 
                                    />
                                </div>
                                <div className="am-field full-width">
                                    <label className={birthErrors.birthPlace ? 'error-label' : ''}><FaMapMarkerAlt /> Birth Place</label>
                                    <input 
                                        type="text" 
                                        placeholder="City, State, Country" 
                                        value={birthPlace} 
                                        onChange={e => {setBirthPlace(e.target.value); setBirthErrors(prev => ({...prev, birthPlace: false}))}} 
                                        className={`am-input ${birthErrors.birthPlace ? 'error-border' : ''}`} 
                                    />
                                </div>
                            </div>
                            <div className="am-inner-actions">
                                <button className="am-btn-save" onClick={handleSaveBirthDetails}>Use These Details</button>
                                <button className="am-btn-close-inner" onClick={() => {setShowBirthDetailsPopup(false); setBirthErrors({});}}>Back</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;