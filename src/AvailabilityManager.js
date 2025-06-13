import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parse, isBefore, startOfDay, parseISO } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaRegClock, FaPencilAlt, FaTimes, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import './AvailabilityManager.css';

const API_BASE = "http://localhost:8080";

// --- Helper & Modal Components ---
const generateTimeSlots = () => {
    const slots = {};
    for (let i = 3; i <= 23; i++) { const time = `${String(i).padStart(2, '0')}:00`; slots[time] = 'Available'; }
    return slots;
};
const allPossibleSlots = Object.keys(generateTimeSlots());
const ConfirmationModal = ({ onConfirm, onCancel, message }) => ( <div className="am-modal-backdrop"> <div className="am-modal-content small"> <h3 className="am-modal-title">Please Confirm</h3> <p className="am-modal-message">{message}</p> <div className="am-modal-footer"> <button className="am-modal-btn-secondary" onClick={onCancel}>Cancel</button> <button className="am-modal-btn-primary" onClick={onConfirm}>Yes, I'm Sure</button> </div> </div> </div> );

// --- Main Page Component ---
const AvailabilityManager = () => {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [availability, setAvailability] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    
    // This function will be passed to child components that need to trigger a refresh
    const refreshAvailability = async () => {
        const priestId = localStorage.getItem('userId');
        if (!priestId) {
            toast.error("Priest ID not found. Cannot refresh data.");
            return;
        }
        
        setIsLoading(true);
        try {
            // Fetch all three data sources again
            const [bookingRes, manualAppointmentRes, availabilityRes] = await Promise.all([
                axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
                axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
                axios.get(`${API_BASE}/api/availability/${priestId}`)
            ]);

            const newAvailabilityMap = {};
            
            // 1. Process "Unavailable" slots marked by the priest
            (availabilityRes.data || []).forEach(slot => {
                if (!slot.slotDate || !slot.slotTime) return;
                const dateStr = format(parseISO(slot.slotDate), 'yyyy-MM-dd');
                const timeStr = slot.slotTime.substring(0, 5); // Ensure HH:mm format
                if (!newAvailabilityMap[dateStr]) { newAvailabilityMap[dateStr] = generateTimeSlots(); }
                newAvailabilityMap[dateStr][timeStr] = 'Unavailable';
            });
            
            // 2. Overlay confirmed customer bookings
            (bookingRes.data || []).forEach(booking => {
                if (!booking.date || !booking.start) return;
                if (booking.status?.toUpperCase() === 'ACCEPTED' || booking.status?.toUpperCase() === 'CONFIRMED') {
                    if (!newAvailabilityMap[booking.date]) { newAvailabilityMap[booking.date] = generateTimeSlots(); }
                    newAvailabilityMap[booking.date][booking.start] = 'Booked';
                }
            });

            // 3. Overlay priest's manual appointments
            (manualAppointmentRes.data || []).forEach(appointment => {
                if (!appointment.start) return;
                const dateTime = parseISO(appointment.start);
                const dateStr = format(dateTime, 'yyyy-MM-dd');
                const timeStr = format(dateTime, 'HH:mm');
                if (!newAvailabilityMap[dateStr]) { newAvailabilityMap[dateStr] = generateTimeSlots(); }
                newAvailabilityMap[dateStr][timeStr] = 'Booked';
            });
            
            setAvailability(newAvailabilityMap);
        } catch (error) {
            toast.error("Failed to load latest availability data.");
            console.error("Fetch availability error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch initial data on component mount
    useEffect(() => {
        refreshAvailability();
    }, []);

    useEffect(() => {
        if (isBefore(selectedDate, startOfDay(new Date()))) {
            setSelectedDate(new Date());
        }
    }, [selectedDate]);

    // --- Sub-components (CalendarHeader and CalendarGrid are unchanged) ---
    const CalendarHeader = () => ( <div className="am-calendar-header"> <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}><FaChevronLeft /></button> <span>{format(currentDate, 'MMMM yyyy')}</span> <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}><FaChevronRight /></button> </div> );
    const CalendarGrid = () => { const monthStart = startOfMonth(currentDate); const monthEnd = endOfMonth(monthStart); const startDate = startOfWeek(monthStart); const endDate = endOfWeek(monthEnd); const days = eachDayOfInterval({ start: startDate, end: endDate }); const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]; const today = startOfDay(new Date()); return ( <div className="am-calendar-grid"> {dayNames.map(day => <div className="am-day-name" key={day}>{day}</div>)} {days.map(day => { const isPastDay = isBefore(day, today); return ( <div key={day.toString()} className={`am-day-cell ${!isSameMonth(day, monthStart) ? 'other-month' : ''} ${isSameDay(day, new Date()) ? 'today' : ''} ${isSameDay(day, selectedDate) ? 'selected' : ''} ${isPastDay ? 'past-day' : ''}`} onClick={() => !isPastDay && setSelectedDate(day)}><span>{format(day, 'd')}</span></div> ) })} </div> ); };

    // --- Side Panel Sub-component ---
    const DayTimeSlots = ({ onAvailabilitySave }) => {
        const [draftSlots, setDraftSlots] = useState(null);
        const [settingsVisible, setSettingsVisible] = useState(false);
        const [template, setTemplate] = useState({ start: '09:00', end: '17:00', breaks: ['12:00'] });
        const [overrideSlot, setOverrideSlot] = useState(null);

        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const originalSlots = availability[selectedDateStr] || generateTimeSlots();
        const isPast = isBefore(selectedDate, startOfDay(new Date()));
        
        useEffect(() => { setDraftSlots(null); }, [selectedDate]);

        const handleSlotClick = (time, status) => {
            if (isPast) return;
            if (status === 'Booked') { setOverrideSlot(time); return; }
            const currentSlots = draftSlots || { ...originalSlots };
            const newStatus = currentSlots[time] === 'Available' ? 'Unavailable' : 'Available';
            setDraftSlots({ ...currentSlots, [time]: newStatus });
        };
        
        const handleConfirmOverride = () => {
            if (!overrideSlot) return;
            const currentSlots = draftSlots || { ...originalSlots };
            setDraftSlots({ ...currentSlots, [overrideSlot]: 'Available' });
            setOverrideSlot(null);
        };

        const handleSaveChanges = async () => {
            if (!draftSlots) return;
            const priestId = localStorage.getItem('userId');
            const unavailableSlots = Object.entries(draftSlots)
                .filter(([, status]) => status === 'Unavailable')
                .map(([time]) => time);

            const payload = { priestId, date: selectedDateStr, unavailableSlots };
            
            try {
                await axios.post(`${API_BASE}/api/availability`, payload);
                toast.success("Availability saved successfully!");
                setDraftSlots(null);
                onAvailabilitySave(); // Trigger a full data refresh
            } catch (error) { toast.error("Failed to save changes."); }
        };

        const applyTemplate = () => {
            let newSlots = { ...originalSlots };
            const startHour = parseInt(template.start.split(':')[0]);
            const endHour = parseInt(template.end.split(':')[0]);
            Object.keys(newSlots).forEach(time => {
                const hour = parseInt(time.split(':')[0]);
                const isWorkingHour = hour >= startHour && hour <= endHour;
                const isBreakTime = template.breaks.includes(time);
                if (newSlots[time] !== 'Booked') { // Don't override booked slots with template
                  newSlots[time] = isWorkingHour && !isBreakTime ? 'Available' : 'Unavailable';
                }
            });
            setDraftSlots(newSlots);
        };
        
        const handleTemplateChange = (e) => { const { name, value } = e.target; setTemplate(prev => ({ ...prev, [name]: value, breaks: [] })); };
        const handleBreakToggle = (time) => { const newBreaks = template.breaks.includes(time) ? template.breaks.filter(b => b !== time) : [...template.breaks, time].sort(); setTemplate(prev => ({ ...prev, breaks: newBreaks })); };
        
        const slotsToDisplay = draftSlots || originalSlots;
        
        return (
            <div className={`am-timeslot-panel ${isPast ? 'disabled' : ''}`}>
                 {overrideSlot && <ConfirmationModal onConfirm={handleConfirmOverride} onCancel={() => setOverrideSlot(null)} message="An appointment is already booked. Are you sure you want to make this slot available?"/> }
                <div className="am-panel-header"> <h2 className="am-panel-title">Daily Schedule</h2> <button className="am-edit-template-btn" onClick={() => setSettingsVisible(!settingsVisible)}> <FaRegClock /> {settingsVisible ? 'Hide Settings' : 'Workday Settings'} </button> </div>
                {settingsVisible && ( <div className="template-settings"> <div className="time-select-group"> <label>Start Time</label> <select name="start" value={template.start} onChange={handleTemplateChange}> {allPossibleSlots.map(time => <option key={time} value={time}>{format(parse(time, 'HH:mm', new Date()), 'h:mm a')}</option>)} </select> </div> <div className="time-select-group"> <label>End Time</label> <select name="end" value={template.end} onChange={handleTemplateChange}> {allPossibleSlots.map(time => <option key={time} value={time}>{format(parse(time, 'HH:mm', new Date()), 'h:mm a')}</option>)} </select> </div> <div className="break-settings"> <label>Select Break Times</label> <div className="break-slots-grid"> {allPossibleSlots.filter(time => { const h = parseInt(time.split(':')[0]); return h >= parseInt(template.start.split(':')[0]) && h <= parseInt(template.end.split(':')[0]); }).map(time => ( <button type="button" key={time} className={`break-slot-btn ${template.breaks.includes(time) ? 'is-break' : ''}`} onClick={() => handleBreakToggle(time)} > {format(parse(time, 'HH:mm', new Date()), 'h a')} </button> ))} </div> </div> <button className="am-apply-template-btn" onClick={applyTemplate}>Apply This Template to Current Day</button> </div> )}
                <hr className="am-divider"/>
                <h3 className="am-panel-subtitle">Availability for <span className="am-panel-title-date">{format(selectedDate, 'EEEE, MMMM d')}</span></h3>
                {isPast && <div className="am-past-day-notice">You cannot edit availability for past dates.</div>}
                {draftSlots && ( <div className="am-save-actions"> <p>You have unsaved changes.</p> <div> <button className="am-cancel-btn" onClick={() => setDraftSlots(null)}>Cancel</button> <button className="am-save-btn" onClick={handleSaveChanges}>Save</button> </div> </div> )}
                <div className="am-timeslot-grid"> {Object.entries(slotsToDisplay).map(([time, status]) => ( <button type="button" key={time} className={`am-slot-btn status-${status.toLowerCase()}`} onClick={() => handleSlotClick(time, status)} disabled={isPast} > {format(parse(time, 'HH:mm', new Date()), 'h:mm a')} </button> ))} </div>
            </div>
        );
    };

    if (isLoading) { return <div className="loading-container">Loading Availability...</div> }

    return (
        <div className="availability-page-container">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
            <div className="availability-page-header"> <h1 className="availability-page-title">Manage Your Availability</h1> <button className="am-back-to-dashboard-btn" onClick={() => navigate('/dashboard')}> <FaArrowLeft /> Back to Dashboard </button> </div>
            <p className="availability-page-description"> Use "Workday Settings" to define a template, or click individual time slots to set availability for a specific day. </p>
            <div className="availability-manager-component">
                <div className="am-calendar-view"> <CalendarHeader /> <CalendarGrid /> </div>
                <DayTimeSlots onAvailabilitySave={refreshAvailability} />
            </div>
        </div>
    );
};

export default AvailabilityManager;