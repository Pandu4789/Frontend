import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css"; // Assuming you have a CSS file for styling
const DashboardEventsDisplay = () => {
  const [events, setEvents] = useState([]);

  const colors = [
  "#FFF8E7", // Sandalwood cream
  "#F4E2D8", // Light rose petal
  "#EED6C4", // Rose beige
  "#ECD9BA", // Sacred ash
  "#FDEBC1", // Light turmeric
  "#D6A75D", // Muted marigold
  "#F6C177", // Subtle saffron
  "#E6B17E", // Warm pooja fire tone
  "#E3C598", // Incense color
  "#FFD8B1"  // Light kumkum or tilak tone
];


  const getRandomColor = () =>
    colors[Math.floor(Math.random() * colors.length)];

  const getRandomHeight = () => {
    const heights = [250, 280, 300, 350];
    return heights[Math.floor(Math.random() * heights.length)];
  };

  const fetchEvents = () => {
    axios.get("http://localhost:8080/api/dashboard/events")
      .then(res => {
        const data = res.data.map(event => ({
          ...event,
          randomColor: event.bgColor || getRandomColor(),
          height: getRandomHeight()
        }));
        setEvents(data);
      })
      .catch(err => console.error("Failed to fetch events", err));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <div className="masonry">
      {events.map(event => (
        <div
          key={event.id}
          className="event-card"
          style={{ backgroundColor: event.randomColor, height: event.height }}
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
