import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageEvents = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/events").then((res) => setEvents(res.data));
  }, []);

  const deleteEvent = async (id) => {
    await axios.delete(`/api/admin/events/${id}`);
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Events</h2>
      <ul>
        {events.map((e) => (
          <li key={e.id} className="flex justify-between items-center border-b py-2">
            {e.title} on {e.date}
            <button onClick={() => deleteEvent(e.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManageEvents;
