import axios from 'axios';
import React, { useState } from 'react';

const AddDashboardEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    photo: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post('http://localhost:8080/api/dashboard/events', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      alert('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="title"
        placeholder="Title"
        value={formData.title}
        onChange={handleChange}
      />
      <input
        name="photo"
        placeholder="Photo URL"
        type="url"
        value={formData.photo}
        onChange={handleChange}
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
      />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default AddDashboardEvent;
