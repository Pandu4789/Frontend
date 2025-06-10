// Filename: AvailabilityManager.js - UPDATED with Back to Dashboard button
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // NEW: Import useNavigate
import {
    format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
    eachDayOfInterval, isSameMonth, isSameDay, addDays, parse, isBefore, startOfDay, getDay
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaRegClock, FaPencilAlt, FaTimes, FaArrowLeft } from 'react-icons/fa';
import './AvailabilityManager.css';

// --- Helper functions & ConfirmationModal (No changes here) ---
const generateTimeSlots = () => {
    const slots = {};
    for (let i = 3; i <= 23; i++) { const time = `${String(i).padStart(2, '0')}:00`; slots[time] = 'Available'; }
    return slots;
};
const allPossibleSlots = Object.keys(generateTimeSlots());
const getInitialAvailability = () => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
    return {
        [todayStr]: { ...generateTimeSlots(), "10:00": "Booked", "14:00": "Booked" },
        [tomorrowStr]: { ...generateTimeSlots(), "08:00": "Unavailable", "12:00": "Unavailable" }
    };
};
const ConfirmationModal = ({ onConfirm, onCancel, message }) => ( <div className="am-modal-backdrop"> <div className="am-modal-content small"> <h3 className="am-modal-title">Please Confirm</h3> <p className="am-modal-message">{message}</p> <div className="am-modal-footer"> <button className="am-modal-btn-secondary" onClick={onCancel}>Cancel</button> <button className="am-modal-btn-primary" onClick={onConfirm}>Yes, I'm Sure</button> </div> </div> </div> );


// --- Main Page Component ---
const AvailabilityManager = () => {
    const navigate = useNavigate(); // NEW: Initialize the navigate hook
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState(getInitialAvailability);
    const [overrideSlot, setOverrideSlot] = useState(null); 

    useEffect(() => {
        if (isBefore(selectedDate, startOfDay(new Date()))) {
            setSelectedDate(new Date());
        }
    }, []);

    const CalendarHeader = () => ( <div className="am-calendar-header"> <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><FaChevronLeft /></button> <span>{format(currentDate, 'MMMM yyyy')}</span> <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><FaChevronRight /></button> </div> );
    const CalendarGrid = () => { const monthStart = startOfMonth(currentDate); const monthEnd = endOfMonth(monthStart); const startDate = startOfWeek(monthStart); const endDate = endOfWeek(monthEnd); const days = eachDayOfInterval({ start: startDate, end: endDate }); const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; const today = startOfDay(new Date()); return ( <div className="am-calendar-grid"> {dayNames.map(day => <div className="am-day-name" key={day}>{day}</div>)} {days.map(day => { const isPastDay = isBefore(day, today); return ( <div key={day.toString()} className={`am-day-cell ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isPastDay ? 'past-day' : ''} `} onClick={() => !isPastDay && setSelectedDate(day)} > <span>{format(day, 'd')}</span> </div> ) })} </div> ); };

    const DayTimeSlots = () => {
        const [draftSlots, setDraftSlots] = useState(null);
        const [settingsVisible, setSettingsVisible] = useState(false);
        const [template, setTemplate] = useState({ start: '09:00', end: '17:00', breaks: ['12:00'] });

        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const originalSlots = availability[selectedDateStr] || generateTimeSlots();
        const isPast = isBefore(selectedDate, startOfDay(new Date()));
        
        useEffect(() => { setDraftSlots(null); }, [selectedDate]);

        const handleSlotClick = (time, status) => {
            if (isPast) return;
            if (status === 'Booked') {
                setOverrideSlot(time);
                return;
            }
            const currentSlots = draftSlots || originalSlots;
            const newStatus = currentSlots[time] === 'Available' ? 'Unavailable' : 'Available';
            setDraftSlots({ ...currentSlots, [time]: newStatus });
        };

        const handleConfirmOverride = () => {
            if (!overrideSlot) return;
            const currentSlots = draftSlots || originalSlots;
            const updatedSlots = { ...currentSlots, [overrideSlot]: 'Available' };
            setDraftSlots(updatedSlots);
            setOverrideSlot(null);
        };

        const handleSaveChanges = () => { setAvailability(prev => ({ ...prev, [selectedDateStr]: draftSlots })); setDraftSlots(null); };
        const handleCancelChanges = () => { setDraftSlots(null); };
        const applyTemplate = () => { let newSlots = { ...generateTimeSlots() }; const startHour = parseInt(template.start.split(':')[0]); const endHour = parseInt(template.end.split(':')[0]); Object.keys(newSlots).forEach(time => { const hour = parseInt(time.split(':')[0]); const isWorkingHour = hour >= startHour && hour <= endHour; const isBreakTime = template.breaks.includes(time); newSlots[time] = isWorkingHour && !isBreakTime ? 'Available' : 'Unavailable'; }); setDraftSlots(newSlots); };
        const handleTemplateChange = (e) => { const { name, value } = e.target; setTemplate(prev => ({ ...prev, [name]: value, breaks: [] })); };
        const handleBreakToggle = (time) => { const newBreaks = template.breaks.includes(time) ? template.breaks.filter(b => b !== time) : [...template.breaks, time].sort((a,b) => a.localeCompare(b)); setTemplate(prev => ({ ...prev, breaks: newBreaks })); };
        
        const slotsToDisplay = draftSlots || originalSlots;

        return (
            <div className={`am-timeslot-panel ${isPast ? 'disabled' : ''}`}>
                {overrideSlot && (
                    <ConfirmationModal 
                        message="An appointment is already booked. Are you sure you want to make this slot available? This will not cancel the existing appointment."
                        onConfirm={handleConfirmOverride}
                        onCancel={() => setOverrideSlot(null)}
                    />
                )}
                <div className="am-panel-header">
                    <h2 className="am-panel-title">Daily Schedule</h2>
                    <button className="am-edit-template-btn" onClick={() => setSettingsVisible(!settingsVisible)}>
                        <FaRegClock /> {settingsVisible ? 'Hide Settings' : 'Workday Settings'}
                    </button>
                </div>
                {settingsVisible && (
                    <div className="template-settings">
                        <div className="time-select-group"> <label>Start Time</label> <select name="start" value={template.start} onChange={handleTemplateChange}> {allPossibleSlots.map(time => <option key={time} value={time}>{format(parse(time, 'HH:mm', new Date()), 'h:mm a')}</option>)} </select> </div>
                        <div className="time-select-group"> <label>End Time</label> <select name="end" value={template.end} onChange={handleTemplateChange}> {allPossibleSlots.map(time => <option key={time} value={time}>{format(parse(time, 'HH:mm', new Date()), 'h:mm a')}</option>)} </select> </div>
                        <div className="break-settings"> <label>Select Break Times</label> <div className="break-slots-grid"> {allPossibleSlots.filter(time => { const h = parseInt(time.split(':')[0]); return h >= parseInt(template.start.split(':')[0]) && h <= parseInt(template.end.split(':')[0]); }).map(time => ( <button key={time} className={`break-slot-btn ${template.breaks.includes(time) ? 'is-break' : ''}`} onClick={() => handleBreakToggle(time)} > {format(parse(time, 'HH:mm', new Date()), 'h a')} </button> ))} </div> </div>
                        <button className="am-apply-template-btn" onClick={applyTemplate}>Apply This Template to Current Day</button>
                    </div>
                )}
                <hr className="am-divider"/>
                <h3 className="am-panel-subtitle">Availability for <span className="am-panel-title-date">{format(selectedDate, 'EEEE, MMMM d')}</span></h3>
                {isPast && <div className="am-past-day-notice">You cannot edit availability for past dates.</div>}
                {draftSlots && ( <div className="am-save-actions"> <p>You have unsaved changes.</p> <div> <button className="am-cancel-btn" onClick={handleCancelChanges}>Cancel</button> <button className="am-save-btn" onClick={handleSaveChanges}>Save Changes</button> </div> </div> )}
                <div className="am-timeslot-grid"> {Object.entries(slotsToDisplay).map(([time, status]) => ( <button key={time} className={`am-slot-btn status-${status.toLowerCase()}`} onClick={() => handleSlotClick(time, status)} disabled={isPast} > {format(parse(time, 'HH:mm', new Date()), 'h:mm a')} </button> ))} </div>
            </div>
        );
    };

    return (
        <div className="availability-page-container">
            {/* NEW: Wrapper for title and back button */}
            <div className="availability-page-header">
                <h1 className="availability-page-title">Manage Your Availability</h1>
                {/* NEW: Back to Dashboard button */}
                <button className="am-back-to-dashboard-btn" onClick={() => navigate('/dashboard')}>
                    <FaArrowLeft />
                    Back to Dashboard
                </button>
            </div>
            <p className="availability-page-description">
                Use "Workday Settings" to define a template. Then, apply it or click individual time slots to set availability for a specific day.
            </p>
            <div className="availability-manager-component">
                <div className="am-calendar-view">
                    <CalendarHeader />
                    <CalendarGrid />
                </div>
                <DayTimeSlots />
            </div>
        </div>
    );
};

export default AvailabilityManager;