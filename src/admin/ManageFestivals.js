import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'http://localhost:8080';

const initialFormState = { id: null, name: '', date: '' };

const ManageFestivals = () => {
  const [festivals, setFestivals] = useState([]);
  const [currentFestival, setCurrentFestival] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [filterMonth, setFilterMonth] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/festivals`);
      // Sort by date, most recent first
      const sortedData = (res.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setFestivals(sortedData);
    } catch (err) {
      toast.error('Failed to fetch festivals.');
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentFestival(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (festival) => {
    setIsEditing(true);
    setCurrentFestival({ ...festival, date: format(parseISO(festival.date), 'yyyy-MM-dd') });
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFestival(null);
  };

  const handleInputChange = (e) => {
    setCurrentFestival({ ...currentFestival, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, date } = currentFestival;
    if (!name || !date) {
      toast.warn('Please enter both festival name and date.');
      return;
    }

    const url = isEditing
      ? `${API_BASE}/api/festivals/${currentFestival.id}`
      : `${API_BASE}/api/festivals`;
    const method = isEditing ? 'put' : 'post';

    try {
      await axios[method](url, { name, date });
      toast.success(`Festival ${isEditing ? 'updated' : 'added'} successfully!`);
      handleCloseModal();
      fetchFestivals();
    } catch (err) {
      toast.error('Error saving festival.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this festival?')) return;
    try {
      await axios.delete(`${API_BASE}/api/festivals/${id}`);
      toast.success('Festival deleted.');
      fetchFestivals();
    } catch (err) {
      toast.error('Failed to delete festival.');
    }
  };

  const filteredFestivals = festivals.filter((f) => {
    if (filterMonth === 'all') return true;
    // getMonth() is 0-indexed, which matches the value from our select dropdown
    const festivalMonth = new Date(f.date + 'T00:00:00').getMonth();
    return festivalMonth === parseInt(filterMonth);
  });

  return (
    <>
      <style>{`
        /* Styles for ManageFestivals Component */
        .manage-festivals-container { padding: 1rem; }
        .mf-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .mf-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        .mf-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .mf-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .filter-bar { margin-bottom: 1.5rem; background: var(--card-bg); padding: 1rem; border-radius: 8px; box-shadow: var(--shadow-sm); display: flex; align-items: center; gap: 10px; }
        .filter-bar label { font-weight: 600; color: var(--text-dark); }
        .filter-bar select { padding: 8px; border-radius: 6px; border: 1px solid var(--border-color); }
        
        .festival-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
        .festival-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; }
        .festival-info { display: flex; flex-direction: column; }
        .festival-name { font-size: 1.1rem; font-weight: 600; color: var(--primary-dark); }
        .festival-date { font-size: 0.9rem; color: var(--text-light); }
        .festival-actions { display: flex; gap: 0.75rem; }
        .action-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: 8px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
        .action-btn.edit { color: #0d6efd; }
        .action-btn.delete { color: var(--danger-color); }
        .action-btn:hover { background-color: var(--hover-bg); }

        /* Reusable Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: var(--card-bg); padding: 1.5rem; border-radius: 12px; width: 90%; max-width: 500px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .modal-header h3 { margin: 0; font-size: 1.5rem; color: var(--primary-dark); }
        .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body { display: flex; flex-direction: column; gap: 1rem; }
        .modal-footer { padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; }
      `}</style>
      
      <div className="manage-festivals-container">
        <ToastContainer position="bottom-right" autoClose={3000} />
        <div className="mf-header">
          <h1 className="mf-title">Manage Festivals</h1>
          <button className="mf-add-btn" onClick={handleAddNew}><FaPlus /> Add New Festival</button>
        </div>

        <div className="filter-bar">
            <label htmlFor="month-filter">Filter by Month:</label>
            <select id="month-filter" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                <option value="all">All Months</option>
                {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i} value={i}>
                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </option>
                ))}
            </select>
        </div>

        {isLoading ? <p className="loading-error-message">Loading festivals...</p> : (
            <ul className="festival-list">
                {filteredFestivals.map((f) => (
                    <li key={f.id} className="festival-item">
                        <div className="festival-info">
                            <span className="festival-name">{f.name}</span>
                            <span className="festival-date">{format(parseISO(f.date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                        <div className="festival-actions">
                            <button className="action-btn edit" onClick={() => handleEdit(f)} title="Edit"><FaEdit /></button>
                            <button className="action-btn delete" onClick={() => handleDelete(f.id)} title="Delete"><FaTrash /></button>
                        </div>
                    </li>
                ))}
                {filteredFestivals.length === 0 && <li className="loading-error-message">No festivals found for the selected month.</li>}
            </ul>
        )}

        {isModalOpen && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <div className="modal-header">
                        <h3>{isEditing ? 'Edit Festival' : 'Add New Festival'}</h3>
                        <button onClick={handleCloseModal} className="close-button"><FaTimes /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="modal-body">
                        <input
                            className="form-input"
                            type="text"
                            name="name"
                            placeholder="Festival Name"
                            value={currentFestival.name}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            className="form-input"
                            type="date"
                            name="date"
                            value={currentFestival.date}
                            onChange={handleInputChange}
                            required
                        />
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="submit" className="btn btn-primary">{isEditing ? 'Update Festival' : 'Add Festival'}</button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </>
  );
};

export default ManageFestivals;