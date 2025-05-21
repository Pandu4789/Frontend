import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PoojaItemsManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemName: '', quantity: 1, unitPrice: 0 });
  const [editingItemId, setEditingItemId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchItems();
      resetForm();
    } else {
      setItems([]);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/events'); // Replace with your actual event list API
      setEvents(res.data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/pooja-items/event/${selectedEventId}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm({ itemName: '', quantity: 1, unitPrice: 0 });
    setEditingItemId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      quantity: parseInt(form.quantity),
      unitPrice: parseFloat(form.unitPrice),
      eventId: selectedEventId,
    };

    try {
      if (editingItemId) {
        await axios.put(`http://localhost:8080/api/pooja-items/update/${editingItemId}`, payload);
      } else {
        await axios.post('http://localhost:8080/api/pooja-items/add', payload);
      }
      fetchItems();
      resetForm();
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    }
  };

  const handleEdit = (item) => {
    setForm({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
    setEditingItemId(item.id);
    setError('');
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`http://localhost:8080/api/pooja-items/delete/${itemId}`);
      fetchItems();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <h2>Pooja Items Manager</h2>

      {/* Event Selector */}
      <div style={{ marginBottom: 20 }}>
        <label>Select Event: </label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Select an Event --</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name || `Event ${event.id}`}
            </option>
          ))}
        </select>
      </div>

      {selectedEventId && (
        <>
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              name="itemName"
              placeholder="Item Name"
              value={form.itemName}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={form.quantity}
              onChange={handleChange}
              min="1"
              required
            />
            <input
              type="number"
              name="unitPrice"
              placeholder="Unit Price"
              value={form.unitPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
            <button type="submit">{editingItemId ? 'Save' : 'Add'}</button>
            {editingItemId && (
              <button type="button" onClick={resetForm}>
                Cancel
              </button>
            )}
          </form>

          {/* Error Message */}
          {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

          {/* Items Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Item Name</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Qty</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Unit Price</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Subtotal</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                    No items found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.itemName}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.quantity}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.unitPrice}</td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                      <button onClick={() => handleEdit(item)}>Edit</button>{' '}
                      <button onClick={() => handleDelete(item.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PoojaItemsManager;
