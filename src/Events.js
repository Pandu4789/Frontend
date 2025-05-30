import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css";

const DashboardEventsDisplay = () => {
  const [events, setEvents] = useState([]);

  // Set the single color you want for all event cards
  const cardColor = "#FDEBC1"; // Light turmeric or any other color you prefer

  const getRandomHeight = () => {
    const heights = [250, 280, 300, 350];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const fetchEvents = () => {
    axios
      .get("http://localhost:8080/api/dashboard/events")
      .then((res) => {
        const data = res.data.map((event) => ({
          ...event,
          backgroundColor: cardColor,
          height: getRandomHeight(),
        }));
        setEvents(data);
      })
      .catch((err) => console.error("Failed to fetch events", err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="masonry">
      {events.map((event) => (
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
      ))}
    </div>
  );
};

export default DashboardEventsDisplay;
