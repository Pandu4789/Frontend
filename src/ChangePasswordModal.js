import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ChangePasswordModal.css'; // The new, improved CSS
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// ✅ NEW: Helper function to check password strength
const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length > 8) score++;
    if (password.match(/[a-z]/)) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++; // Special characters

    switch (score) {
        case 5: return { label: 'Very Strong', score: 4, color: '#28a745' };
        case 4: return { label: 'Strong', score: 3, color: '#20c997' };
        case 3: return { label: 'Medium', score: 2, color: '#fd7e14' };
        case 2: return { label: 'Weak', score: 1, color: '#dc3545' };
        default: return { label: 'Very Weak', score: 0, color: '#6c757d' };
    }
};

const ChangePasswordModal = ({ isOpen, onClose }) => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ label: '', score: 0, color: '#6c757d' }); // ✅ NEW state for strength

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        setPasswords(prev => ({ ...prev, [name]: value }));

        // ✅ Check strength only for the new password field
        if (name === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        if (passwordStrength.score < 2) { // Optional: Enforce at least medium strength
            setError("Password is too weak. Please choose a stronger one.");
            return;
        }
        
        setLoading(true);
        try {
            const payload = {
                email: localStorage.getItem('userEmail'),
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            };
            await axios.post(`${API_BASE}/api/auth/change-password`, payload);
            toast.success("Password changed successfully!");
            onClose();
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to change password. Check your current password.";
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content change-password-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2><FaLock /> Change Your Password</h2>
                    <button onClick={onClose} className="close-button">&times;</button>
                </div>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="currentPassword">Current Password</label>
                        <div className="password-input-wrapper">
                            <input id="currentPassword" type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required />
                            <span className="password-toggle-icon" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <FaEyeSlash /> : <FaEye />}</span>
                        </div>
                    </div>
                    <div className="form-group">
                        <label htmlFor="newPassword">New Password</label>
                         <div className="password-input-wrapper">
                            <input id="newPassword" type={showNewPassword ? "text" : "password"} name="newPassword" value={passwords.newPassword} onChange={handleChange} required />
                             <span className="password-toggle-icon" onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <FaEyeSlash /> : <FaEye />}</span>
                        </div>
                        {/* ✅ NEW: Password Strength Indicator */}
                        {passwords.newPassword && (
                            <div className="strength-indicator">
                                <div className="strength-bar">
                                    {Array.from(Array(4).keys()).map(i => (
                                        <div key={i} className={`strength-bar-segment ${i < passwordStrength.score ? 'filled' : ''}`} style={{'--segment-color': passwordStrength.color}}></div>
                                    ))}
                                </div>
                                <span className="strength-label" style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm New Password</label>
                        <input id="confirmPassword" type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required />
                    </div>

                    {error && <p className="error-message">{error}</p>}
                    
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <FaSpinner className="spinner" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;