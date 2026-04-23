import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Select from "react-select";
import { toast, ToastContainer } from "react-toastify";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const initialFormState = {
  itemName: "",
  quantity: 1,
  unitPrice: 0,
  unit: "count",
};

const PoojaItemsManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
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
        toast.error("Error fetching events.");
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      const fetchItems = async () => {
        try {
          const res = await axios.get(
            `${API_BASE}/api/pooja-items/event/${selectedEvent.value}`,
          );
          setItems(res.data);
        } catch (err) {
          console.error(err);
          setItems([]);
        }
      };
      fetchItems();
      resetForm();
    } else {
      setItems([]);
    }
  }, [selectedEvent]);

  // --- Form and API Handlers ---
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const resetForm = () => {
    setForm(initialFormState);
    setEditingItemId(null);
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemName || form.itemName.trim() === "") {
      toast.error("Item name is required.");
      return;
    }
    if (form.quantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (form.unitPrice < 0) {
      toast.error("Unit price cannot be negative.");
      return;
    }

    const payload = {
      ...form,
      quantity: parseInt(form.quantity),
      unitPrice: parseFloat(form.unitPrice),
      eventId: selectedEvent.value,
    };

    try {
      if (editingItemId) {
        await axios.put(
          `${API_BASE}/api/pooja-items/update/${editingItemId}`,
          payload,
        );
        toast.success("Item updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/pooja-items/add`, payload);
        toast.success("Item added successfully!");
      }
      const res = await axios.get(
        `${API_BASE}/api/pooja-items/event/${selectedEvent.value}`,
      );
      setItems(res.data);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data || "Failed to save item.");
    }
  };

  const handleEdit = (item) => {
    setForm({
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      unit: item.unit || "count",
    });
    setEditingItemId(item.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await axios.delete(`${API_BASE}/api/pooja-items/delete/${itemId}`);
        setItems((prev) => prev.filter((item) => item.id !== itemId));
        toast.success("Item deleted.");
      } catch (err) {
        toast.error("Delete failed");
      }
    }
  };

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => total + item.unitPrice, 0);
  }, [items]);

  const eventOptions = events.map((event) => ({
    value: event.id,
    label: event.name || `Event ${event.id}`,
  }));

  return (
    <>
      <style>{`
                .pooja-items-manager { padding: 1rem; font-family: 'Inter', sans-serif; }
                .pim-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
                .pim-title { font-size: 1.8rem; font-weight: 700; color: #4A2000; }
                .selector-bar { display: grid; grid-template-columns: 1fr auto; gap: 1rem; align-items: center; margin-bottom: 1.5rem; background: #fff; padding: 1rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .react-select-container { flex-grow: 1; }
                .pim-add-btn { background-color: #B74F2F; color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .pim-add-btn:hover { transform: translateY(-2px); }
                .pim-form-card { background-color: #FEF3E4; border: 1px solid #EEE0CB; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
                .pim-form { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-end; }
                .pim-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
                .pim-form-group label { font-size: 0.8rem; font-weight: 500; color: #555; }
                .pim-form-group.item-name { flex: 2; min-width: 180px; }
                .pim-form-group.quantity, .pim-form-group.unit, .pim-form-group.unit-price { flex: 1; min-width: 90px; }
                .pim-form input, .pim-form select { padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; width: 100%; box-sizing: border-box; font-family: 'Inter', sans-serif; }
                .pim-form-actions { display: flex; gap: 0.5rem; padding-bottom: 2px; }
                .items-table-container { background-color: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #EEE0CB; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .items-table { width: 100%; border-collapse: collapse; }
                .items-table th, .items-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #EEE0CB; }
                .items-table thead th { background-color: #f9fafb; font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
                .items-table tbody tr:hover { background-color: #FEF3E4; }
                .items-table td.actions { text-align: right; }
                .action-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 8px; }
                .action-btn.edit { color: #0d6efd; }
                .action-btn.delete { color: #dc3545; }
                .items-table tfoot td { font-weight: 700; font-size: 1.1rem; color: #4A2000; }
                .total-label { text-align: right; }
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
            <button
              className="pim-add-btn"
              onClick={() => {
                setIsFormVisible(true);
                setEditingItemId(null);
                setForm(initialFormState);
              }}
            >
              <FaPlus /> Add New Item
            </button>
          )}
        </div>

        {selectedEvent && isFormVisible && (
          <div className="pim-form-card">
            <form onSubmit={handleSubmit} className="pim-form">
              <div className="pim-form-group item-name">
                <label htmlFor="itemName">Item Name</label>
                <input
                  id="itemName"
                  type="text"
                  name="itemName"
                  value={form.itemName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="pim-form-group quantity">
                <label htmlFor="quantity">Quantity</label>
                <input
                  id="quantity"
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>
              <div className="pim-form-group unit">
                <label htmlFor="unit">Unit</label>
                <select
                  id="unit"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                >
                  <option value="count">count</option>
                  <option value="grams">grams</option>
                  <option value="ml">ml</option>
                  <option value="piece">piece</option>
                  <option value="packet">packet</option>
                  <option value="bunch">bunch</option>
                </select>
              </div>
              <div className="pim-form-group unit-price">
                <label htmlFor="unitPrice">Unit Price ($)</label>
                <input
                  id="unitPrice"
                  type="number"
                  name="unitPrice"
                  value={form.unitPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div className="pim-form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingItemId ? "Save Changes" : "Add Item"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedEvent && (
          <div className="items-table-container">
            <table className="items-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  {/* ✅ 1. REMOVED: Subtotal header is gone. */}
                  <th className="actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemName}</td>
                      <td>{`${item.quantity} ${item.unit || ""}`}</td>
                      <td>${item.unitPrice.toFixed(2)}</td>
                      {/* ✅ 2. REMOVED: Subtotal data cell is gone. */}
                      <td className="actions">
                        <button
                          className="action-btn edit"
                          onClick={() => handleEdit(item)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="action-btn delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  // ✅ 3. CHANGED: Updated colSpan from 5 to 4.
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No items found for this event. Click 'Add New Item' to
                      begin.
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr>
                  {/* ✅ 4. CHANGED: Updated colSpan from 3 to 2 to maintain alignment. */}
                  <td colSpan="2" className="total-label">
                    Total Estimated Price:
                  </td>
                  <td colSpan="2">${totalPrice.toFixed(2)}</td>
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
