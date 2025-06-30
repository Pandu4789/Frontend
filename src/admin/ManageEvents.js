import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaImage } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:8080";

const initialFormState = {
  title: '',
  photo: '', // This should be an image URL
  description: '',
};

const AddDashboardEvent = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // ✅ To control form visibility

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/dashboard/events`);
      setEvents(res.data);
    } catch (error) {
      toast.error('Error fetching events.');
      console.error('Error fetching events:', error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditId(null);
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/dashboard/events/${editId}`, formData);
        toast.success('Event updated successfully!');
      } else {
        await axios.post(`${API_BASE}/api/dashboard/events`, formData);
        toast.success('Event added successfully!');
      }
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Error saving event.');
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`${API_BASE}/api/dashboard/events/${id}`);
      toast.success('Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      toast.error('Error deleting event.');
      console.error('Error deleting event:', error);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      title: event.title,
      photo: event.photo,
      description: event.description,
    });
    setEditId(event.id);
    setIsFormVisible(true); // Show the form for editing
    window.scrollTo(0, 0); // Scroll to top to see the form
  };

  return (
    <>
      {/* ✅ ALL STYLES ARE NOW INCLUDED DIRECTLY IN THE COMPONENT FILE */}
      <style>{`
        .add-event-container {
          padding: 1rem;
          font-family: 'Inter', sans-serif;
        }
        .ae-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid var(--border-color, #EEE0CB);
        }
        .ae-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--primary-dark, #4A2000);
        }
        .ae-add-btn {
          background-color: var(--theme-heading, #B74F2F);
          color: white;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ae-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* Form Card Styles */
        .ae-form-card {
          background-color: var(--card-bg, #FFFFFF);
          border: 1px solid var(--border-color, #EEE0CB);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
        }
        .ae-form-card h2 {
          font-size: 1.5rem;
          color: var(--primary-dark, #4A2000);
          margin-top: 0;
        }
        .ae-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .ae-form-grid input, .ae-form-grid textarea {
          width: 100%;
          padding: 12px;
          border-radius: 6px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }
        .ae-form-grid .full-width {
          grid-column: 1 / -1;
        }
        .ae-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 1rem;
        }

        /* Event Card Grid */
        .event-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .event-card {
          background-color: var(--card-bg, #FFFFFF);
          border: 1px solid var(--border-color, #EEE0CB);
          border-radius: 12px;
          box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05));
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .event-card-image {
          width: 100%;
          height: 180px;
          object-fit: cover;
          background-color: var(--hover-bg, #FEF3E4);
        }
        .placeholder-image {
          width: 100%;
          height: 180px;
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: var(--hover-bg, #FEF3E4);
          color: var(--text-light, #6c757d);
          font-size: 3rem;
        }
        .event-card-content {
          padding: 1rem;
          flex-grow: 1;
        }
        .event-card-content h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: var(--primary-dark, #4A2000);
        }
        .event-card-content p {
          margin: 0;
          color: var(--text-light, #6c757d);
          font-size: 0.95rem;
        }
        .event-card-actions {
          padding: 1rem;
          border-top: 1px solid var(--border-color, #EEE0CB);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          background-color: #f9fafb;
        }
      `}</style>

      <div className="add-event-container">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="ae-header">
          <h1 className="ae-title">Manage Dashboard Events</h1>
          {!isFormVisible && (
            <button className="ae-add-btn" onClick={() => { setEditId(null); setFormData(initialFormState); setIsFormVisible(true); }}>
              <FaPlus /> Add New Event
            </button>
          )}
        </div>

        {isFormVisible && (
          <div className="ae-form-card">
            <h2>{editId ? 'Edit Event' : 'Add New Event'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="ae-form-grid">
                <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required />
                <input name="photo" placeholder="Photo URL" type="url" value={formData.photo} onChange={handleChange} />
                <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required className="full-width" rows="4"/>
              </div>
              <div className="ae-form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update Event' : 'Add Event'}</button>
              </div>
            </form>
          </div>
        )}

        <div className="event-grid">
          {events.length === 0 ? (
            <p className="loading-error-message">{!events ? "Loading..." : "No events found."}</p>
          ) : (
            events.map((event) => (
              <div key={event.id} className="event-card">
                {event.photo ? (
                  <img src={event.photo} alt={event.title} className="event-card-image" />
                ) : (
                  <div className="placeholder-image"><FaImage /></div>
                )}
                <div className="event-card-content">
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="event-card-actions">
                  <button className="btn-edit" onClick={() => handleEdit(event)}>
                    <FaEdit /> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(event.id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default AddDashboardEvent;