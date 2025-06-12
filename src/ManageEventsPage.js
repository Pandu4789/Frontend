// Filename: src/ManageEventsPage.js - FULLY REDESIGNED
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FaEdit, FaTrash, FaPlus, FaImage, FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './ManageEventsPage.css';

const API_BASE = "http://localhost:8080";

const ManageEventsPage = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEvent, setCurrentEvent] = useState({
        id: null, title: '', date: '', eventTime: '', location: '', description: '', imageUrl: ''
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const fileInputRef = useRef(null);

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_BASE}/api/dashboard/events`);
            setEvents((response.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
        } catch (error) { toast.error("Failed to fetch events."); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchEvents(); }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentEvent(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const resetForm = () => {
        setIsFormVisible(false);
        setIsEditing(false);
        setCurrentEvent({ id: null, title: '', date: '', eventTime: '', location: '', description: '', imageUrl: '' });
        setImageFile(null);
        setImagePreview('');
    };

    const handleAddNewClick = () => {
        resetForm();
        setIsFormVisible(true);
    };

    const handleEditClick = (event) => {
        setIsEditing(true);
        const eventData = { ...event, date: format(parseISO(event.date), 'yyyy-MM-dd') };
        setCurrentEvent(eventData);
        setImagePreview(event.imageUrl || '');
        setImageFile(null);
        setIsFormVisible(true);
        window.scrollTo(0, 0); // Scroll to top to see the form
    };

    const handleDelete = async (eventId) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await axios.delete(`${API_BASE}/api/dashboard/events/${eventId}`);
                toast.success("Event deleted!");
                fetchEvents();
            } catch (error) { toast.error("Failed to delete event."); }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let payload = { ...currentEvent };

        if (imageFile) {
            // In a real app, you would upload to a service like S3/Cloudinary first
            // For this demo, we'll just use the local preview URL as a placeholder
            payload.imageUrl = imagePreview;
            toast.info("Image 'uploaded' (demo). In production, this would go to a file server.");
        }
        
        try {
            if (isEditing) {
                await axios.put(`${API_BASE}/api/dashboard/events/${currentEvent.id}`, payload);
                toast.success(`Event "${currentEvent.title}" updated!`);
            } else {
                await axios.post(`${API_BASE}/api/dashboard/events`, payload);
                toast.success(`Event "${currentEvent.title}" created!`);
            }
            resetForm();
            fetchEvents();
        } catch (error) { toast.error("Failed to save event."); }
    };

    return (
        <div className="manage-events-page">
            <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
            <div className="em-page-header">
                <h1 className="em-page-title">Manage Temple Events</h1>
                {!isFormVisible && (
                    <button className="em-add-btn" onClick={handleAddNewClick}>
                        <FaPlus /> Announce New Event
                    </button>
                )}
            </div>

            {isFormVisible && (
                <div className="em-form-card">
                    <h2>{isEditing ? 'Edit Event' : 'Announce New Event'}</h2>
                    <form onSubmit={handleSubmit} className="em-form">
                        <div className="form-row">
                            <div className="form-fields">
                                <input type="text" name="title" placeholder="Event Title" value={currentEvent.title} onChange={handleInputChange} required />
                                <div className="form-grid-half">
                                    <input type="date" name="date" value={currentEvent.date} onChange={handleInputChange} required />
                                    <input type="time" name="eventTime" value={currentEvent.eventTime} onChange={handleInputChange} required />
                                </div>
                                <input type="text" name="location" placeholder="Location (e.g., Main Prayer Hall)" value={currentEvent.location} onChange={handleInputChange} required />
                            </div>
                            <div className="image-uploader">
                                <div className="image-preview" onClick={() => fileInputRef.current.click()}>
                                    {imagePreview ? <img src={imagePreview} alt="Event Preview" /> : <div className="image-placeholder"><FaImage /><p>Click to upload</p></div>}
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
                            </div>
                        </div>
                        <textarea name="description" placeholder="Brief description of the event..." value={currentEvent.description} onChange={handleInputChange} required />
                        <div className="em-form-actions">
                            <button type="button" className="em-cancel-btn" onClick={resetForm}>Cancel</button>
                            <button type="submit" className="em-save-btn">{isEditing ? 'Update Event' : 'Announce Event'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="event-list-grid">
                {isLoading ? <p>Loading Events...</p> : (events || []).map(event => (
                    <div key={event.id} className="event-card">
                        <div className="event-image-banner" style={{backgroundImage: `url(${event.imageUrl || 'https://via.placeholder.com/400x200/FDF5E6/B74F2F?text=Temple+Event'})`}}>
                            <div className="event-card-actions">
                                <button onClick={() => handleEditClick(event)}><FaEdit /> Edit</button>
                                <button className="delete" onClick={() => handleDelete(event.id)}><FaTrash /> Delete</button>
                            </div>
                        </div>
                        <div className="event-card-content">
                            <h3 className="event-card-title">{event.title}</h3>
                            <div className="event-card-details">
                                <p><FaCalendarAlt /> {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</p>
                                <p><FaClock /> {event.eventTime}</p>
                                <p><FaMapMarkerAlt /> {event.location}</p>
                            </div>
                            <p className="event-card-description">{event.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageEventsPage;