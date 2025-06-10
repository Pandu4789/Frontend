import React, { useState, useEffect } from 'react'; // Import useEffect
import axios from 'axios';
import { toast } from 'react-toastify';
import './AskForMuhurtam.css';

const AskForMuhurtam = ({ priest, customer, setCustomer, nakshatramList, onClose, navigate }) => {
    const [eventId, setEventId] = useState('');
    const [selectedEventName, setSelectedEventName] = useState('');
    const [nakshatram, setNakshatram] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [events, setEvents] = useState([]); // State to hold events
    // --- EFFECT TO FETCH EVENTS ---
useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('http://localhost:8080/api/events');
        setEvents(res.data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events list.');
      }
    };
    fetchEvents();
  }, []);
    // --- EFFECT TO HANDLE ESCAPE KEY ---
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                // Prioritize closing the inner popups first
                if (showBirthDetailsPopup) {
                    setShowBirthDetailsPopup(false);
                } else if (showConfirmation) {
                    // Close both confirmation and main modal, like the OK button
                    setShowConfirmation(false);
                    onClose();
                } else {
                    // If no popups are open, close the main modal
                    onClose();
                }
            }
        };

        // Add event listener when the component mounts
        document.addEventListener('keydown', handleKeyDown);

        // Cleanup function to remove the listener when the component unmounts
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [showBirthDetailsPopup, showConfirmation, onClose]); // Dependencies ensure the handler has the latest state

    const handleInputChange = (field, value) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveBirthDetails = () => {
        if (!birthDate || !birthTime || !birthPlace.trim()) {
            toast.error('Please fill in the complete birth date, time, and place.');
            return;
        }
        toast.success('Birth details saved!');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!eventId) {
            toast.error('Please select an event.');
            return;
        }


        const isNakshatramValid = nakshatram.trim() !== '';
        const isBirthDetailsValid = birthDate && birthTime && birthPlace.trim();

        if (!isNakshatramValid && !isBirthDetailsValid) {
            toast.error('Please either select your Nakshatram or enter your birth details.');
            return;
        }

        const payload = {
            event: eventId,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            note: customer.note || '',
            nakshatram: isNakshatramValid ? nakshatram : null,
            date: isBirthDetailsValid ? birthDate : null,
            time: isBirthDetailsValid ? birthTime : null,
            place: isBirthDetailsValid ? birthPlace : null,
            priestId: priest?.id || null,
        };

       try {
          await axios.post('http://localhost:8080/api/muhurtam/request', payload);
          setShowConfirmation(true);
          toast.success(`Muhurtam request sent to Priest: ${priest.firstName} ${priest.lastName}`);
        } catch (error) {
          console.error('Failed to send Muhurtam request:', error);
          toast.error('Failed to send request.');
        }
    };


    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Request a Muhurtam</h2>

                {/* --- Block 1: Event Selection --- */}
                <div className="form-section">
                    <h3>Select Event</h3>
                    <label>
                        Event Type:
                        <select value={eventId} onChange={e => {
                            setEventId(e.target.value);
                            const name = events.find(event => event.id === parseInt(e.target.value))?.name;
                            setSelectedEventName(name || '');
                        }}>
                            <option value="">-- Select Event --</option>
                            {events.map(event => (
                                <option key={event.id} value={event.id}>{event.name}</option>
                            ))}
                        </select>
                    </label>
                </div>

                {/* --- Block 2: Nakshatram/Birth Details --- */}
                <div className="form-section">
                    <h3>Provide Birth Star (Nakshatram)</h3>
                    <label>
                        Nakshatram:
                        <select value={nakshatram} onChange={e => setNakshatram(e.target.value)}>
                            <option value="">-- Select Nakshatram --</option>
                            {nakshatramList.map(n => (
                                <option key={n.id} value={n.name}>{n.name}</option>
                            ))}
                        </select>
                    </label>
                    <div className="small-link" onClick={() => setShowBirthDetailsPopup(true)}>
                        Don’t know Nakshatram?
                    </div>
                </div>

               
                {customer ? (
                    <>
                       

                        {/* --- Block 4: Note --- */}
                        <div className="form-section">
                            <h3>Additional Note</h3>
                             <label>
                                Note:
                                <textarea
                                    placeholder="Optional note for the priest"
                                    value={customer.note || ''}
                                    onChange={e => handleInputChange('note', e.target.value)}
                                    rows="3"
                                />
                            </label>
                        </div>
                    </>
                ) : (
                    <p>
                        Please <span className="signup-link" onClick={() => navigate('/signup')}>Sign Up</span> to continue.
                    </p>
                )}

                <div className="modal-actions">
                    <button onClick={handleSendMuhurtamRequest}>Send Request</button>
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                </div>

                {showConfirmation && (
                  <div className="modal-overlay inner-popup">
                    <div className="modal-content confirmation-box">
                      <h3>Request Sent!</h3>
                      <p>
                        <strong>{priest?.firstName} {priest?.lastName || 'priest'}</strong> has received your Muhurtam request for the <strong>{selectedEventName}</strong> event.
                      </p>
                      <p>
                        The priest will review your details and get back to you shortly with an auspicious time.
                      </p>
                      <div className="modal-actions">
                        <button className="ok-button" onClick={onClose}>OK</button>
                      </div>
                    </div>
                  </div>
                )}


                {showBirthDetailsPopup && (
                    <div className="modal-overlay inner-popup">
                        <div className="modal-content">
                            <h3>Enter Your Birth Details</h3>

                            <div className="form-section">
                                <label>
                                    Birth Date:
                                    <input
                                        type="date"
                                        value={birthDate}
                                        onChange={e => setBirthDate(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]} 
                                    />
                                </label>

                                <label>
                                    Birth Time:
                                    <input
                                        type="time"
                                        value={birthTime}
                                        onChange={e => setBirthTime(e.target.value)}
                                    />
                                </label>

                                <label>
                                    Birth Place:
                                    <input
                                        type="text"
                                        placeholder="City, State, Country"
                                        value={birthPlace}
                                        onChange={e => setBirthPlace(e.target.value)}
                                    />
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button onClick={handleSaveBirthDetails}>Save</button>
                                <button className="cancel-button" onClick={() => setShowBirthDetailsPopup(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;