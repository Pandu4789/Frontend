import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:8080";

const initialFormState = {
  date: "",
  rahukalamStart: "", rahukalamEnd: "",
  yamagandamStart: "", yamagandamEnd: "",
  varjamStart: "", varjamEnd: "",
  durmohurtamStart: "", durmohurtamEnd: "",
};

const ManageDailyTimes = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [dailyTimesList, setDailyTimesList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [isFormVisible, setIsFormVisible] = useState(false); // ✅ To control form visibility

  useEffect(() => {
    fetchDailyTimes();
  }, []);

  const fetchDailyTimes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/daily-times`);
      // Sort by date, newest first
      const sortedData = (res.data || []).sort((a,b) => new Date(b.date) - new Date(a.date));
      setDailyTimesList(sortedData);
    } catch (err) {
      toast.error("Error fetching daily times.");
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const resetForm = () => {
    setFormData(initialFormState);
    setEditId(null);
    setIsFormVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE}/api/daily-times/${editId}`, formData);
        toast.success("Timings updated successfully!");
      } else {
        await axios.post(`${API_BASE}/api/daily-times`, formData);
        toast.success("Timings saved successfully!");
      }
      resetForm();
      fetchDailyTimes();
    } catch (error) {
      toast.error("Failed to save timings.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`${API_BASE}/api/daily-times/${id}`);
      toast.success("Entry deleted.");
      fetchDailyTimes();
    } catch (err) {
      toast.error("Error deleting entry.");
    }
  };

  const handleEdit = (item) => {
    // Ensure time values are in HH:mm format for the input fields
    const formattedItem = { ...item };
    for (const key in formattedItem) {
        if (key.includes('Start') || key.includes('End')) {
            if(formattedItem[key]) {
               formattedItem[key] = formattedItem[key].substring(0, 5);
            }
        }
    }
    setFormData(formattedItem);
    setEditId(item.id);
    setIsFormVisible(true);
    window.scrollTo(0, 0);
  };

  // Helper to render a pair of time inputs
  const renderTimeRow = (label, startName, endName) => (
    <div className="form-time-row">
      <label>{label}</label>
      <div className="time-inputs">
        <input type="time" name={startName} value={formData[startName]} onChange={handleChange} required />
        <span>to</span>
        <input type="time" name={endName} value={formData[endName]} onChange={handleChange} required />
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        .manage-dailytimes-container { padding: 1rem; }
        .mdt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .mdt-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        .mdt-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .mdt-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .mdt-form-card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: var(--shadow-sm); }
        .mdt-form-card h3 { font-size: 1.5rem; color: var(--primary-dark); margin-top: 0; margin-bottom: 1.5rem; }
        .form-date-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .form-date-row label { font-weight: 600; font-size: 1.1rem; }
        .form-date-row input { padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 1rem; }
        .form-time-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .form-time-row { background: var(--hover-bg); padding: 1rem; border-radius: 8px; }
        .form-time-row label { display: block; font-weight: 600; margin-bottom: 8px; }
        .time-inputs { display: flex; align-items: center; gap: 10px; }
        .time-inputs input { width: 100%; }
        .mdt-form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 1.5rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem; }
        
        .data-table-container { background-color: var(--card-bg); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); }
        .data-table { width: 100%; border-collapse: collapse; }
        .data-table th, .data-table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border-color); }
        .data-table thead th { background-color: #f9fafb; font-size: 0.8rem; color: var(--text-light); text-transform: uppercase; }
        .data-table tbody tr:hover { background-color: var(--hover-bg); }
        .data-table td.actions { text-align: right; }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 8px; }
        .action-btn.edit { color: #0d6efd; }
        .action-btn.delete { color: var(--danger-color); }
      `}</style>

      <div className="manage-dailytimes-container">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="mdt-header">
          <h1 className="mdt-title">Manage Daily Timings</h1>
          {!isFormVisible && (
            <button className="mdt-add-btn" onClick={() => { setEditId(null); setFormData(initialFormState); setIsFormVisible(true); }}>
              <FaPlus /> Add New Entry
            </button>
          )}
        </div>

        {isFormVisible && (
          <div className="mdt-form-card">
            <h3>{editId ? "Edit" : "Add New"} Daily Times</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-date-row">
                <label>Date:</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required />
              </div>
              <div className="form-time-grid">
                {renderTimeRow("Rahukalam", "rahukalamStart", "rahukalamEnd")}
                {renderTimeRow("Yamagandam", "yamagandamStart", "yamagandamEnd")}
                {renderTimeRow("Varjam", "varjamStart", "varjamEnd")}
                {renderTimeRow("Durmuhurtam", "durmohurtamStart", "durmohurtamEnd")}
              </div>
              <div className="mdt-form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? "Update" : "Save"}</button>
              </div>
            </form>
          </div>
        )}

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Rahukalam</th><th>Yamagandam</th><th>Varjam</th><th>Durmuhurtam</th><th className="actions">Actions</th></tr>
            </thead>
            <tbody>
              {dailyTimesList.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  <td>{item.rahukalamStart} - {item.rahukalamEnd}</td>
                  <td>{item.yamagandamStart} - {item.yamagandamEnd}</td>
                  <td>{item.varjamStart} - {item.varjamEnd}</td>
                  <td>{item.durmohurtamStart} - {item.durmohurtamEnd}</td>
                  <td className="actions">
                    <button className="action-btn edit" onClick={() => handleEdit(item)} title="Edit"><FaEdit /></button>
                    <button className="action-btn delete" onClick={() => handleDelete(item.id)} title="Delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
              {dailyTimesList.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ManageDailyTimes;