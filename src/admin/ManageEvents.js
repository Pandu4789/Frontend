import axios from 'axios';
import React, { useState, useEffect } from 'react';

const AddDashboardEvent = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    photo: '',
    description: '',
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/dashboard/events');
      setEvents(res.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/dashboard/events/${editId}`, formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Event updated successfully!');
      } else {
        await axios.post('http://localhost:8080/api/dashboard/events', formData, {
          headers: { 'Content-Type': 'application/json' },
        });
        alert('Event added successfully!');
      }
      setFormData({ title: '', photo: '', description: '' });
      setEditId(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/dashboard/events/${id}`);
      fetchEvents();
    } catch (error) {
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
  };

  return (
    <div>
      <h2>{editId ? 'Edit Event' : 'Add Event'}</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
          style={{ marginRight: '10px' }}
        />
        <input
          name="photo"
          placeholder="Photo URL"
          type="url"
          value={formData.photo}
          onChange={handleChange}
          style={{ marginRight: '10px' }}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          required
          style={{ verticalAlign: 'top', marginRight: '10px' }}
        />
        <button type="submit">{editId ? 'Update Event' : 'Add Event'}</button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setFormData({ title: '', photo: '', description: '' });
              setEditId(null);
            }}
            style={{ marginLeft: '10px' }}
          >
            Cancel
          </button>
        )}
      </form>

      <h3>All Events</h3>
      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Photo</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>
                  {event.photo ? (
                    <img src={event.photo} alt={event.title} style={{ width: '100px', height: 'auto' }} />
                  ) : (
                    'No Photo'
                  )}
                </td>
                <td>{event.description}</td>
                <td>
                  <button onClick={() => handleEdit(event)} style={{ marginRight: '10px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(event.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AddDashboardEvent;
