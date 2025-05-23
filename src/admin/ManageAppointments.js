import React, { useEffect, useState } from "react";
import axios from "axios";

const initialForm = {
  id: null,
  name: "",
  eventId: "",       // Use eventId here
  phone: "",
  address: "",       // Added address field
  note: "",
  date: "",
  start: "",
  end: "",
  status: "PENDING",
  priestName: "",
  priestId: null,
};

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [events, setEvents] = useState([]);

  // Hardcoded priest info (replace with your logic)
  const currentPriestId = 16;
  const currentPriestName = "Mohit Kumar Nagubandi";

  useEffect(() => {
    fetchAppointments();
    fetchEvents();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/booking/all");
      setAppointments(res.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    }
  };

  const getEventName = (id) => {
    const event = events.find((e) => e.id === id || e.id === Number(id));
    return event ? event.name : id;
  };

  const updateStatus = async (id, status) => {
    try {
      if (status === "ACCEPTED") {
        await axios.put(`http://localhost:8080/api/booking/accept/${id}`);
      } else if (status === "REJECTED") {
        await axios.put(`http://localhost:8080/api/booking/reject/${id}`);
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = {
        ...form,
        priestId: currentPriestId,
        priestName: currentPriestName,
        eventId: Number(form.eventId),  // convert eventId to number
      };

      if (isEditing) {
        const res = await axios.put(
          `http://localhost:8080/api/booking/${form.id}`,
          formData
        );
        setAppointments((prev) =>
          prev.map((a) => (a.id === form.id ? res.data : a))
        );
      } else {
        const res = await axios.post("http://localhost:8080/api/booking", formData);
        setAppointments((prev) => [...prev, res.data]);
      }
      setForm(initialForm);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save appointment:", err);
    }
  };

  const handleEdit = (appointment) => {
    setForm(appointment);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/booking/${id}`);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to delete appointment:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Manage Appointments</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 flex-grow"
            required
          />

          <select
            value={form.eventId || ""}
            onChange={(e) => setForm({ ...form, eventId: Number(e.target.value) })}
            className="border p-2 flex-grow"
            required
          >
            <option value="">-- Select Event (Pooja) --</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 flex-grow"
            required
          />

          <input
            type="text"
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border p-2 flex-grow"
            required
          />

          <input
            type="text"
            placeholder="Note"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className="border p-2 flex-grow"
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="border p-2 flex-grow"
            required
          />

          <input
            type="time"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            className="border p-2 flex-grow"
          />

          <input
            type="time"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            className="border p-2 flex-grow"
          />
        </div>

        <div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            {isEditing ? "Update" : "Add"} Appointment
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setIsEditing(false);
              }}
              className="ml-2 text-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Appointments Table */}
      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th>Customer Name</th>
            <th>Priest Name</th>
            <th>Pooja</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Note</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((a) => (
              <tr key={a.id} className="border-t text-center">
                <td>{a.name}</td>
                <td>{a.priestName || "N/A"}</td>
                <td>{getEventName(a.eventId)}</td>
                <td>{a.phone}</td>
                <td>{a.address}</td>
                <td>{a.note}</td>
                <td>{a.date}</td>
                <td>{a.start}</td>
                <td>{a.end}</td>
                <td>{a.status}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => updateStatus(a.id, "ACCEPTED")}
                    className="text-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateStatus(a.id, "REJECTED")}
                    className="text-red-600"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleEdit(a)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="text-gray-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={11} className="text-center py-4 text-gray-500">
                No appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAppointments;
