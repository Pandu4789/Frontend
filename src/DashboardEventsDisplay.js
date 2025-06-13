// Filename: DashboardEventsDisplay.js (or Events.js) - REDESIGNED
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import './DashboardEventsDisplay.css'; // The new stylesheet

const API_BASE = "http://localhost:8080";

// --- Skeleton Loader Component ---
const EventCardSkeleton = () => (
    <div className="event-card skeleton-card">
        <div className="skeleton-image"></div>
        <div className="event-card-content">
            <div className="skeleton-line short"></div>
            <div className="skeleton-line long"></div>
            <div className="skeleton-line medium"></div>
        </div>
    </div>
);

// --- Main Display Component ---
const DashboardEventsDisplay = () => {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch events when the component mounts
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${API_BASE}/api/dashboard/events`);
                // Sort events by date, most recent first
                const sortedEvents = (response.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
                setEvents(sortedEvents);
            } catch (err) {
                console.error("Failed to fetch events", err);
            } finally {
                // Add a small delay to show the skeleton loader, improving perceived performance
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        fetchEvents();
    }, []);

    // Show 6 skeleton cards while loading
    if (isLoading) {
        return (
            <div className="masonry-layout">
                {Array.from({ length: 6 }).map((_, index) => (
                    <EventCardSkeleton key={index} />
                ))}
            </div>
        );
    }
    
    return (
        <div className="masonry-layout">
            {events.length > 0 ? (
                events.map((event) => (
                    <div key={event.id} className="event-card">
                        {/* Use event.imageUrl from your backend entity */}
                        <img
                            src={event.imageUrl || 'https://via.placeholder.com/400x250/FDF5E6/B74F2F?text=Temple+Event'}
                            alt={event.title}
                            className="event-image"
                        />
                        <div className="event-card-content">
                            <h3 className="event-title">{event.title}</h3>
                            
                            {/* Display all the rich details with icons */}
                            <div className="event-details">
                                <p><FaCalendarAlt /> {event.date ? format(parseISO(event.date), 'MMMM d, yyyy') : 'Date TBD'}</p>
                                <p><FaClock /> {event.eventTime || 'Time TBD'}</p>
                                <p><FaMapMarkerAlt /> {event.location || 'Location TBD'}</p>
                            </div>

                            <p className="event-description">{event.description}</p>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-events-message">No upcoming events have been announced.</p>
            )}
        </div>
    );
};

export default DashboardEventsDisplay;