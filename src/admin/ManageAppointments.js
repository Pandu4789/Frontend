import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaTimes, FaUser, FaPhoneAlt, FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';

const API_BASE = "http://localhost:8080";

const initialForm = {
  id: null,
  name: "",
  eventId: "",
  phone: "",
  address: "",
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
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const res = await axios.get(`${API_BASE}/api/booking/all`);
      // Sort by date, newest first
      const sorted = res.data.sort((a,b) => new Date(b.date) - new Date(a.date));
      setAppointments(sorted);
    } catch (err) {
      toast.error("Failed to fetch appointments.");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events`);
      setEvents(res.data);
    } catch (err) {
      toast.error("Failed to fetch pooja services.");
    }
  };

  const getEventName = (id) => {
    const event = events.find((e) => e.id === Number(id));
    return event ? event.name : 'Unknown Event';
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/api/booking/${status.toLowerCase()}/${id}`);
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
      toast.success(`Appointment status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };
  
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentAppointment(initialForm);
    setIsModalOpen(true);
  };

  const handleEdit = (appointment) => {
    setIsEditing(true);
    // Ensure times are in the correct 'HH:mm' format for the input fields
    const formattedAppointment = {
        ...appointment,
        start: appointment.start ? format(parseISO(`1970-01-01T${appointment.start}`), 'HH:mm') : '',
        end: appointment.end ? format(parseISO(`1970-01-01T${appointment.end}`), 'HH:mm') : '',
    };
    setCurrentAppointment(formattedAppointment);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentAppointment(null);
  };

  const handleInputChange = (e) => {
    setCurrentAppointment({ ...currentAppointment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...currentAppointment,
        priestId: currentPriestId,
        priestName: currentPriestName,
        eventId: Number(currentAppointment.eventId),
      };

      if (isEditing) {
        await axios.put(`${API_BASE}/api/booking/${currentAppointment.id}`, formData);
        toast.success("Appointment updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/booking`, formData);
        toast.success("Appointment created successfully!");
      }
      handleCloseModal();
      fetchAppointments();
    } catch (err) {
      toast.error("Failed to save appointment.");
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm("Are you sure you want to delete this appointment?")) {
        try {
            await axios.delete(`${API_BASE}/api/booking/${id}`);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Appointment deleted.");
        } catch (err) {
            toast.error("Failed to delete appointment.");
        }
    }
  };

  return (
    <>
      <style>{`
        /* --- Styles for ManageAppointments Component --- */
        .manage-appointments-container { padding: 1rem; }
        .ma-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .ma-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        .ma-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .ma-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

        /* Appointment Card List */
        .appointment-list { display: flex; flex-direction: column; gap: 1rem; }
        .appointment-card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); }
        .ac-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); }
        .ac-header h3 { margin: 0; font-size: 1.25rem; color: var(--primary-dark); }
        .ac-body { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; padding: 1.25rem; }
        .ac-body p { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 0.95rem; }
        .ac-body .icon { color: var(--text-light); }
        .ac-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); background-color: #f9fafb; display: flex; justify-content: flex-end; align-items: center; gap: 0.75rem; }
        
        /* Status Badge Styles */
        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .status-PENDING { background-color: #ffc107; color: #333; }
        .status-ACCEPTED { background-color: #28a745; color: white; }
        .status-REJECTED { background-color: #dc3545; color: white; }

        /* Action Buttons */
        .action-btn { border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 6px; }
        .btn-approve { background-color: #28a745; color: white; }
        .btn-reject { background-color: #dc3545; color: white; }
        .btn-edit { background-color: #0d6efd; color: white; }
        .btn-delete { background-color: #6c757d; color: white; }

        /* Modal Styles */
        .modal-overlay { /* ... same as other modals ... */ }
        .modal-content { /* ... same as other modals ... */ }
        .modal-header, .modal-footer { /* ... same as other modals ... */ }
        .modal-body .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-body .col-span-2 { grid-column: span 2 / span 2; }
      `}</style>

      <div className="manage-appointments-container">
        <div className="ma-header">
          <h2 className="ma-title">Manage Appointments</h2>
          <button className="ma-add-btn" onClick={handleAddNew}>
            <FaPlus /> Add New Appointment
          </button>
        </div>

        <div className="appointment-list">
          {appointments.map(a => (
            <div key={a.id} className="appointment-card">
              <div className="ac-header">
                <h3>{getEventName(a.eventId)}</h3>
                <span className={`status-badge status-${a.status}`}>{a.status}</span>
              </div>
              <div className="ac-body">
                <p><FaUser className="icon"/> {a.name}</p>
                <p><FaPhoneAlt className="icon"/> {a.phone}</p>
                <p><FaRegCalendarAlt className="icon"/> {format(parseISO(a.date), 'MMMM d, yyyy')}</p>
                <p><FaRegClock className="icon"/> {a.start} - {a.end}</p>
              </div>
              <div className="ac-footer">
                <button className="action-btn btn-approve" onClick={() => updateStatus(a.id, "ACCEPTED")}>Approve</button>
                <button className="action-btn btn-reject" onClick={() => updateStatus(a.id, "REJECTED")}>Reject</button>
                <button className="action-btn btn-edit" onClick={() => handleEdit(a)}>Edit</button>
                <button className="action-btn btn-delete" onClick={() => handleDelete(a.id)}>Delete</button>
              </div>
            </div>
          ))}
          {appointments.length === 0 && <p className="loading-error-message">No appointments found.</p>}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{isEditing ? 'Edit Appointment' : 'Create Appointment'}</h3>
                <button onClick={handleCloseModal} className="close-button"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-grid">
                  <input className="form-input" name="name" value={currentAppointment.name} onChange={handleInputChange} placeholder="Customer Name" required />
                  <input className="form-input" name="phone" value={currentAppointment.phone} onChange={handleInputChange} placeholder="Phone Number" required />
                  <select className="form-input" name="eventId" value={currentAppointment.eventId} onChange={handleInputChange} required>
                    <option value="">Select Pooja/Event</option>
                    {events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
                  </select>
                  <input className="form-input" name="date" type="date" value={currentAppointment.date} onChange={handleInputChange} required />
                  <input className="form-input" name="start" type="time" value={currentAppointment.start} onChange={handleInputChange} />
                  <input className="form-input" name="end" type="time" value={currentAppointment.end} onChange={handleInputChange} />
                  <input className="form-input col-span-2" name="address" value={currentAppointment.address} onChange={handleInputChange} placeholder="Address" />
                  <textarea className="form-input col-span-2" name="note" value={currentAppointment.note} onChange={handleInputChange} placeholder="Notes..." />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditing ? "Save Changes" : "Create Appointment"}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManageAppointments;