// Filename: DashboardEventsDisplay.js - REDESIGNED
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import "./DashboardEventsDisplay.css"; // The new stylesheet

const API_BASE = "http://localhost:8080";

// --- ✅ 1. ADDED: Reusable component for "Show More" functionality ---
const TruncatedDescription = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <p className="event-description">{text}</p>;
  }

  return (
    <div>
      <p className="event-description">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="show-more-btn"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

// --- Skeleton Loader Component (Unchanged) ---
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
  // --- ✅ 2. ADDED: State to manage the current view ---
  const [view, setView] = useState("upcoming");

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/api/dashboard/events`);
        // We will sort later, just set the raw data here
        setEvents(response.data || []);
      } catch (err) {
        console.error("Failed to fetch events", err);
      } finally {
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchEvents();
  }, []);

  // --- ✅ 3. ADDED: Logic to filter and sort events ---
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize for accurate comparison

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Soonest first

  const pastEvents = events
    .filter((event) => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent first

  const displayedEvents = view === "upcoming" ? upcomingEvents : pastEvents;

  if (isLoading) {
    return (
      <div className="events-grid-layout">
        {Array.from({ length: 6 }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* --- ✅ 4. ADDED: View toggle buttons --- */}
      <div className="em-view-toggle">
        <button
          className={`toggle-btn ${view === "upcoming" ? "active" : ""}`}
          onClick={() => setView("upcoming")}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          className={`toggle-btn ${view === "past" ? "active" : ""}`}
          onClick={() => setView("past")}
        >
          Past Events ({pastEvents.length})
        </button>
      </div>

      <div className="events-grid-layout">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <img
                src={
                  event.imageUrl ||
                  "https://via.placeholder.com/400x250/FDF5E6/B74F2F?text=Temple+Event"
                }
                alt={event.title}
                className="event-image"
              />
              <div className="event-card-content">
                <h3 className="event-title">{event.title}</h3>
                <div className="event-details">
                  <p>
                    <FaCalendarAlt />{" "}
                    {event.date
                      ? format(parseISO(event.date), "MMMM d, yyyy")
                      : "Date TBD"}
                  </p>
                  <p>
                    <FaClock /> {event.eventTime || "Time TBD"}
                  </p>
                  <p>
                    <FaMapMarkerAlt /> {event.location || "Location TBD"}
                  </p>
                </div>
                {/* --- ✅ 5. CHANGED: Using the new TruncatedDescription component --- */}
                <TruncatedDescription text={event.description} />
              </div>
            </div>
          ))
        ) : (
          <p className="no-events-message">
            There are no {view} events to display.
          </p>
        )}
      </div>
    </>
  );
};

export default DashboardEventsDisplay;
