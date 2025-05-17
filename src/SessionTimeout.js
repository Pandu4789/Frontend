// src/components/SessionTimeout.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SessionTimeout = ({ children, timeout = 10 * 60 * 1000 }) => { 
  const navigate = useNavigate();

  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        localStorage.removeItem('token'); // or any auth info 
        alert('Session expired due to inactivity.');
        navigate('/login');
      }, timeout);
    };

    // Events to track
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer(); // initialize on load

    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [navigate, timeout]);

  return <>{children}</>;
};

export default SessionTimeout;
