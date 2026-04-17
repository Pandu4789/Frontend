import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserLock, FaTimes } from 'react-icons/fa';
import './LoginPromptModal.css';

const LoginPromptModal = ({ onClose }) => {
    const navigate = useNavigate();

    return (
        <div className="lpm-overlay" onClick={onClose}>
            <div className="lpm-modal" onClick={e => e.stopPropagation()}>
                <button className="lpm-close-icon" onClick={onClose}>
                    <FaTimes />
                </button>
                
                <div className="lpm-icon-wrapper">
                    <FaUserLock />
                </div>

                <div className="lpm-content">
                    <h2>Namaste!</h2>
                    <p>To book a Priest or consult for a Muhurtam, please log in to your account.</p>
                </div>

                <div className="lpm-actions">
                    <button className="lpm-btn-login" onClick={() => navigate('/login')}>
                        Log In Now
                    </button>
                    <button className="lpm-btn-cancel" onClick={onClose}>
                        Maybe Later
                    </button>
                </div>
                
                <p className="lpm-footer">New to Priestify? <span onClick={() => navigate('/signup')}>Sign Up</span></p>
            </div>
        </div>
    );
};

export default LoginPromptModal;