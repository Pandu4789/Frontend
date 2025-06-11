// Filename: ManagePoojaServices.js - FULLY UPDATED
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:8080";

const ManagePoojaServices = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // State to hold all fields for the event being created or edited
  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    name: '',
    description: '',
    category: '',
    duration: '',
    estimatedPrice: ''
  });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/events`);
      setEvents(response.data);
    } catch (error) {
      toast.error("Failed to fetch events.");
      console.error("Fetch Events Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    // Reset the form fields for a new event
    setCurrentEvent({ id: null, name: '', description: '', category: '', duration: '', estimatedPrice: '' });
    setIsFormVisible(true);
  };

  const handleEdit = (event) => {
    setIsEditing(true);
    // Load the selected event's data into the form
    setCurrentEvent(event);
    setIsFormVisible(true);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`${API_BASE}/api/events/${eventId}`);
        toast.success("Event deleted successfully!");
        fetchEvents(); // Refresh the list from the server
      } catch (error) {
        toast.error("Failed to delete event.");
        console.error("Delete Event Error:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eventData = { ...currentEvent };
    
    try {
      if (isEditing) {
        // Update existing event
        await axios.put(`${API_BASE}/api/events/${eventData.id}`, eventData);
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        await axios.post(`${API_BASE}/api/events`, eventData);
        toast.success("Event created successfully!");
      }
      setIsFormVisible(false);
      fetchEvents(); // Refresh the list
    } catch (error) {
      toast.error("Failed to save event.");
      console.error("Save Event Error:", error);
    }
  };
  
  return (
    <div className="event-manager-container">
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
      <div className="em-header">
        <h1>Manage Pooja Services</h1>
        {!isFormVisible && (
          <button className="em-add-btn" onClick={handleAddNew}>
            <FaPlus /> Add New Service
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="em-form-card">
          <h2>{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="em-form-grid">
              <input name="name" value={currentEvent.name} onChange={handleInputChange} placeholder="Service Name (e.g., Griha Pravesh)" required />
              <input name="category" value={currentEvent.category} onChange={handleInputChange} placeholder="Category (e.g., Lifecycle Events)" />
              <input name="duration" value={currentEvent.duration} onChange={handleInputChange} placeholder="Duration (e.g., 2 - 3 hours)" />
              <input name="estimatedPrice" value={currentEvent.estimatedPrice} onChange={handleInputChange} placeholder="Estimated Price (e.g., $351)" />
              <textarea name="description" value={currentEvent.description} onChange={handleInputChange} placeholder="A brief description of the service..." required className="full-width"/>
            </div>
            <div className="em-form-actions">
              <button type="button" className="em-cancel-btn" onClick={() => setIsFormVisible(false)}>Cancel</button>
              <button type="submit" className="em-save-btn">{isEditing ? 'Update Service' : 'Create Service'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="em-event-list">
        {isLoading ? <p>Loading services...</p> : events.map(event => (
          <div className="em-event-card" key={event.id}>
            <div className="em-event-details">
              <h3>{event.name}</h3>
              <p><strong>Category:</strong> {event.category || 'N/A'}</p>
              <p><strong>Duration:</strong> {event.duration || 'N/A'}</p>
              <p><strong>Price:</strong> {event.estimatedPrice || 'N/A'}</p>
              <p className="description">{event.description || 'No description.'}</p>
            </div>
            <div className="em-event-actions">
              <button onClick={() => handleEdit(event)}><FaEdit /> Edit</button>
              <button className="delete" onClick={() => handleDelete(event.id)}><FaTrash /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManagePoojaServices;