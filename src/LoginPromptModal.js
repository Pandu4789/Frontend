import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPromptModal = ({ onClose }) => {
    const navigate = useNavigate();

    const styles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        },
        modal: {
            backgroundColor: '#fff',
            padding: '2rem',
            borderRadius: '10px',
            width: '300px',
            textAlign: 'center',
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)',
        },
        buttons: {
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: '1.5rem',
        },
        loginBtn: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#007bff',
            color: 'white',
            cursor: 'pointer',
        },
        cancelBtn: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '5px',
            backgroundColor: '#ccc',
            color: '#333',
            cursor: 'pointer',
        },
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2>Please Log In</h2>
                <p>You need to login to Book the Priest or to Ask for the Mohurtam</p>
                <div style={styles.buttons}>
                    <button style={styles.loginBtn} onClick={() => navigate('/login')}>
                        Login
                    </button>
                    <button style={styles.cancelBtn} onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPromptModal;
