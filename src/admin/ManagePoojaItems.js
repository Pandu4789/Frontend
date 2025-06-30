import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Select from 'react-select'; // ✅ Using the enhanced select component
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:8080';

const initialFormState = { itemName: '', quantity: 1, unitPrice: 0 };

const PoojaItemsManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null); // Use object for react-select
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingItemId, setEditingItemId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/events`);
        setEvents(res.data);
      } catch (err) {
        toast.error('Error fetching events.');
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const fetchItems = async () => {
        try {
          const res = await axios.get(`${API_BASE}/api/pooja-items/event/${selectedEvent.value}`);
          setItems(res.data);
        } catch (err) {
          console.error(err);
          setItems([]); // Clear items on error
        }
      };
      fetchItems();
      resetForm();
    } else {
      setItems([]);
    }
  }, [selectedEvent]);

  // --- Form and API Handlers ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => { setForm(initialFormState); setEditingItemId(null); setIsFormVisible(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, quantity: parseInt(form.quantity), unitPrice: parseFloat(form.unitPrice), eventId: selectedEvent.value };
    try {
      if (editingItemId) {
        await axios.put(`${API_BASE}/api/pooja-items/update/${editingItemId}`, payload);
        toast.success("Item updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/pooja-items/add`, payload);
        toast.success("Item added successfully!");
      }
      setItems(prev => editingItemId ? prev.map(item => item.id === editingItemId ? { ...item, ...payload } : item) : [...prev, {id: Date.now(), ...payload}]); // Optimistic update
      resetForm();
    } catch (err) {
      toast.error(err.response?.data || 'Failed to save item.');
    }
  };

  const handleEdit = (item) => {
    setForm({ itemName: item.itemName, quantity: item.quantity, unitPrice: item.unitPrice });
    setEditingItemId(item.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_BASE}/api/pooja-items/delete/${itemId}`);
        setItems(prev => prev.filter(item => item.id !== itemId)); // Optimistic update
        toast.success("Item deleted.");
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  // --- Calculations ---
  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
  }, [items]);

  const eventOptions = events.map(event => ({ value: event.id, label: event.name || `Event ${event.id}` }));

  return (
    <>
      <style>{`
        /* Styles for PoojaItemsManager Component */
        .pooja-items-manager { padding: 1rem; font-family: 'Inter', sans-serif; }
        .pim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .pim-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        
        .selector-bar { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: var(--card-bg); padding: 1rem; border-radius: 8px; box-shadow: var(--shadow-sm); }
        .react-select-container { flex-grow: 1; }
        .pim-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .pim-add-btn:hover { transform: translateY(-2px); }

        /* Form Card Styles */
        .pim-form-card { background-color: var(--hover-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .pim-form { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
        .pim-form input { padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
        .pim-form-actions { display: flex; gap: 0.5rem; }
        .pim-form-actions button { /* Uses global .btn styles */ }

        /* Items Table */
        .items-table-container { background-color: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th, .items-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border-color); }
        .items-table thead th { background-color: #f9fafb; font-size: 0.8rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.5px; }
        .items-table tbody tr:hover { background-color: var(--hover-bg); }
        .items-table td.actions { text-align: right; }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 8px; }
        .action-btn.edit { color: #0d6efd; }
        .action-btn.delete { color: var(--danger-color); }

        /* Table Footer for Total */
        .items-table tfoot td { font-weight: 700; font-size: 1.1rem; color: var(--primary-dark); }
        .total-label { text-align: right; }
        .total-value { text-align: left; }
      `}</style>
      <div className="pooja-items-manager">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="pim-header">
          <h1 className="pim-title">Pooja Items Manager</h1>
        </div>

        <div className="selector-bar">
          <Select
            options={eventOptions}
            value={selectedEvent}
            onChange={setSelectedEvent}
            placeholder="-- Select an Event to Manage Its Items --"
            className="react-select-container"
            classNamePrefix="react-select"
            isClearable
          />
          {selectedEvent && !isFormVisible && (
             <button className="pim-add-btn" onClick={() => { setIsFormVisible(true); setEditingItemId(null); setForm(initialFormState); }}>
                <FaPlus /> Add New Item
            </button>
          )}
        </div>

        {selectedEvent && isFormVisible && (
          <div className="pim-form-card">
            <form onSubmit={handleSubmit} className="pim-form">
              <input type="text" name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required />
              <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} min="1" required />
              <input type="number" name="unitPrice" placeholder="Unit Price" value={form.unitPrice} onChange={handleChange} min="0" step="0.01" required />
              <div className="pim-form-actions">
                <button type="submit" className="btn btn-primary">{editingItemId ? 'Save Changes' : 'Add Item'}</button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {selectedEvent && (
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr><th>Item Name</th><th>Quantity</th><th>Unit Price</th><th>Subtotal</th><th className="actions">Actions</th></tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{item.quantity}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                      <td className="actions">
                        <button className="action-btn edit" onClick={() => handleEdit(item)}><FaEdit /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(item.id)}><FaTrash /></button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No items found for this event.</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                    <td colSpan="3" className="total-label">Total Estimated Price:</td>
                    <td colSpan="2" className="total-value">${totalPrice.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default PoojaItemsManager;