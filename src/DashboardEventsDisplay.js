import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css";

// Skeleton loader component for events
const EventCardSkeleton = () => (
  <div className="event-card skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-line short"></div>
      <div className="skeleton-line long"></div>
      <div className="skeleton-line medium"></div>
    </div>
  </div>
);

const DashboardEventsDisplay = ({ isLoading }) => { // Accept isLoading prop
  const [events, setEvents] = useState([]);

  const cardColor = "#FDEBC1";

  const getRandomHeight = () => {
    const heights = [250, 280, 300, 350];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const fetchEvents = () => {
    // Only fetch if not already loading, or if explicitly requested to load
    if (!isLoading) return; // If parent says it's not loading, don't fetch (though parent sets it to true initially)
    
    // Simulate API call delay for loading state
    setTimeout(() => {
      axios
        .get("http://localhost:8080/api/dashboard/events")
        .then((res) => {
          const data = res.data.map((event) => ({
            ...event,
            backgroundColor: cardColor,
            height: getRandomHeight(),
          }));
          setEvents(data);
          // Assuming the parent Dashboard component will handle setting isLoading to false
          // if this component is just for display, the parent will control loading.
          // If this component solely manages its own loading, uncomment setIsEventsLoading(false) here.
        })
        .catch((err) => console.error("Failed to fetch events", err));
    }, 1000); // Simulate network delay
  };

  useEffect(() => {
    // Only fetch if isLoading is true (controlled by parent)
    if (isLoading) {
      fetchEvents();
    }
  }, [isLoading]); // Re-run when isLoading changes

  // Determine how many skeleton cards to show (e.g., 6)
  const skeletonCount = 6;

  return (
    <div className="masonry">
      {isLoading ? (
        // Show skeletons when loading
        Array.from({ length: skeletonCount }).map((_, index) => (
          <EventCardSkeleton key={index} />
        ))
      ) : events.length > 0 ? (
        // Show actual events when loaded and available
        events.map((event) => (
          <div
            key={event.id}
            className="event-card"
            style={{
              backgroundColor: event.backgroundColor,
              height: event.height,
            }}
          >
            {event.photoUrl && (
              <img
                src={event.photoUrl}
                alt={event.title}
                className="event-image"
              />
            )}
            <div className="event-content">
              <h3 className="event-title">{event.title}</h3>
              <p className="event-description">{event.description}</p>
            </div>
          </div>
        ))
      ) : (
        // Handle no events found after loading
        <p className="no-events-message">No events found today.</p>
      )}
    </div>
  );
};

export default DashboardEventsDisplay;