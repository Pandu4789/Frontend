import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './PriestProfile.css';

const AskForMuhurtam = ({ priest, customer, setCustomer, nakshatramList, onClose, navigate }) => {
    const [nakshatram, setNakshatram] = useState('');
    const [birthTime, setBirthTime] = useState('');
    const [birthPlace, setBirthPlace] = useState('');
    const [showBirthDetailsPopup, setShowBirthDetailsPopup] = useState(false);

    const handleInputChange = (field, value) => {
        setCustomer(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveBirthDetails = () => {
        if (!birthTime || !birthPlace.trim()) {
            toast.error('Please fill both birth time and place.');
            return;
        }
        toast.success('Birth details saved!');
        setShowBirthDetailsPopup(false);
    };

    const handleSendMuhurtamRequest = async () => {
        if (!customer || !customer.name?.trim() || !customer.email?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
            toast.error('Please fill in all customer details.');
            return;
        }

        const isNakshatramValid = nakshatram.trim() !== '';
        const isBirthDetailsValid = birthTime && birthPlace.trim();

        if (!isNakshatramValid && !isBirthDetailsValid) {
            toast.error('Please fill either birth details or Nakshatram.');
            return;
        }

        const [datePart, timePart] = birthTime ? birthTime.split('T') : [null, null];

        const payload = {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            note: customer.note || '',
            nakshatram: isNakshatramValid ? nakshatram : null,
            date: isBirthDetailsValid ? datePart : null,
            time: isBirthDetailsValid ? timePart : null,
            place: isBirthDetailsValid ? birthPlace : null,
            priestId: priest?.id || null,
        };

        try {
            await axios.post('http://localhost:8080/api/muhurtam/request', payload);
            toast.success(`Muhurtam request sent to Priest: ${priest.firstName} ${priest.lastName}`);
            onClose();
        } catch (error) {
            console.error('Failed to send Muhurtam request:', error);
            toast.error('Failed to send request.');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Request a Muhurtam</h2>

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

                {customer ? (
                    <div className="customer-details">
                        <label>
                            Name:
                            <input
                                type="text"
                                placeholder="Name"
                                value={customer.name || ''}
                                onChange={e => handleInputChange('name', e.target.value)}
                            />
                        </label>

                        <label>
                            Email:
                            <input
                                type="email"
                                placeholder="Email"
                                value={customer.email || ''}
                                onChange={e => handleInputChange('email', e.target.value)}
                            />
                        </label>

                        <label>
                            Phone:
                            <input
                                type="tel"
                                placeholder="Phone"
                                value={customer.phone || ''}
                                onChange={e => handleInputChange('phone', e.target.value)}
                            />
                        </label>

                        <label>
                            Address:
                            <input
                                type="text"
                                placeholder="Address"
                                value={customer.address || ''}
                                onChange={e => handleInputChange('address', e.target.value)}
                            />
                        </label>

                        <label>
                            Note:
                            <input
                                type="text"
                                placeholder="Note (Optional)"
                                value={customer.note || ''}
                                onChange={e => handleInputChange('note', e.target.value)}
                            />
                        </label>
                    </div>
                ) : (
                    <p>
                        Please <span className="signup-link" onClick={() => navigate('/signup')}>Sign Up</span> to continue.
                    </p>
                )}

                <div className="modal-actions">
                    <button onClick={handleSendMuhurtamRequest}>Send Request</button>
                    <button onClick={onClose}>Cancel</button>
                </div>

                {showBirthDetailsPopup && (
                    <div className="modal-overlay inner-popup">
                        <div className="modal-content">
                            <h3>Enter Your Birth Details</h3>

                            <label>
                                Birth Date & Time:
                                <input
                                    type="datetime-local"
                                    value={birthTime}
                                    onChange={e => setBirthTime(e.target.value)}
                                />
                            </label>

                            <label>
                                Birth Place:
                                <input
                                    type="text"
                                    placeholder="Birth Place"
                                    value={birthPlace}
                                    onChange={e => setBirthPlace(e.target.value)}
                                />
                            </label>

                            <div className="modal-actions">
                                <button onClick={handleSaveBirthDetails}>Save</button>
                                <button onClick={() => setShowBirthDetailsPopup(false)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AskForMuhurtam;
