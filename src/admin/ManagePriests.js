import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import { toast } from 'react-toastify';
import { FaUserPlus, FaUserEdit, FaTrash, FaTimes } from 'react-icons/fa';
// Note: You no longer need to import './ManagePriests.css'

const API_BASE = "http://localhost:8080";

const emptyPriest = {
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  password: '',
  poojas: [] // Should be servicesOffered based on your entity
};

const ManagePriests = () => {
  const [priests, setPriests] = useState([]);
  const [currentPriest, setCurrentPriest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [servicesList, setServicesList] = useState([]);

  // --- Data Fetching ---
  const fetchPriests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/priests`);
      setPriests(res.data);
    } catch (err) { toast.error("Failed to fetch priests"); }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events`);
      setServicesList(res.data.map(s => ({ label: s.name, value: s.name })));
    } catch (err) { toast.error("Failed to fetch services"); }
  };

  useEffect(() => {
    fetchPriests();
    fetchServices();
  }, []);

  // --- Modal and Form Handlers ---
  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentPriest(emptyPriest);
    setIsModalOpen(true);
  };

  const handleEdit = (priest) => {
    setIsEditing(true);
    const { password, ...priestToEdit } = priest;
    setCurrentPriest({
      ...priestToEdit,
      // Ensure the services are in the format react-select expects
      poojas: (priestToEdit.poojas || []).map(s => ({ label: s, value: s }))
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPriest(null);
  };

  const handleInputChange = (e) => {
    setCurrentPriest({ ...currentPriest, [e.target.name]: e.target.value });
  };

  const handleServiceChange = (selectedOptions) => {
    const selectedServices = selectedOptions ? selectedOptions.map(opt => opt.value) : [];
    setCurrentPriest({ ...currentPriest, poojas: selectedServices });
  };

  // --- API Actions ---
  const handleSave = async () => {
    if (!currentPriest.username) {
        toast.error("Username is required.");
        return;
    }
    // Convert services back to a simple array of strings before sending
    const payload = { ...currentPriest, poojas: currentPriest.poojas.map(s => s.value || s) };
    
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/api/auth/priests/${payload.id}`, payload);
        toast.success("Priest updated successfully!");
      } else {
        if (!payload.password) {
            toast.error("Password is required for new priests.");
            return;
        }
        await axios.post(`${API_BASE}/api/auth/register-priest`, payload); // Assuming a specific registration endpoint
        toast.success("Priest created successfully!");
      }
      handleCloseModal();
      fetchPriests();
    } catch (err) {
      toast.error("Failed to save priest.");
      console.error("Save error:", err);
    }
  };

  const deletePriest = async (id) => {
    if (window.confirm("Are you sure you want to delete this priest?")) {
        try {
            await axios.delete(`${API_BASE}/api/auth/priests/${id}`);
            toast.success("Priest deleted successfully.");
            fetchPriests();
        } catch (err) { toast.error("Failed to delete priest."); }
    }
  };

  return (
    <>
      {/* ✅ ALL STYLES ARE NOW INCLUDED DIRECTLY IN THE COMPONENT FILE */}
      <style>{`
        /* Uses variables from your global index.css */
        .manage-priests-container { padding: 1rem; }
        .mp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .mp-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        .mp-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .mp-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

        /* Priest Card Grid */
        .priest-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .priest-info-card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
        .card-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-color); }
        .card-header h3 { margin: 0; font-size: 1.25rem; color: var(--primary-dark); }
        .priest-username { font-size: 0.9rem; color: var(--text-light); }
        .card-body { padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column; gap: 0.75rem; }
        .card-body p { margin: 0; font-size: 0.95rem; color: var(--text-dark); }
        .card-body p strong { color: var(--text-light); font-weight: 500; min-width: 80px; display: inline-block; }
        .services-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
        .card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.75rem; }
        .btn-edit, .btn-delete { border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .btn-edit { background-color: var(--hover-bg); color: var(--theme-heading); }
        .btn-delete { background-color: var(--danger-color); color: white; }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: var(--card-bg); padding: 1.5rem; border-radius: 12px; width: 90%; max-width: 600px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .modal-header h3 { margin: 0; font-size: 1.5rem; color: var(--primary-dark); }
        .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-body .col-span-2 { grid-column: span 2 / span 2; }
        .modal-body input { /* Uses global .form-input style */ }
        .modal-body label { font-weight: 600; margin-bottom: 4px; display: block; }
        .modal-footer { padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; }
        
        /* React-Select Customization */
        .react-select__control { border-color: var(--border-color) !important; }
        .react-select__control--is-focused { border-color: var(--theme-heading) !important; box-shadow: 0 0 0 1px var(--theme-heading) !important; }
        .react-select__multi-value { background-color: var(--hover-bg) !important; }
        .react-select__multi-value__label { color: var(--primary-dark) !important; }
        .react-select__multi-value__remove { color: var(--theme-heading) !important; }
        .react-select__multi-value__remove:hover { background-color: var(--theme-heading) !important; color: white !important; }
      `}</style>

      <div className="manage-priests-container">
        <div className="mp-header">
          <h2 className="mp-title">Manage Priests</h2>
          <button className="mp-add-btn" onClick={handleAddNew}>
            <FaUserPlus /> Add New Priest
          </button>
        </div>

        <div className="priest-grid">
          {priests.map((p) => (
            <div key={p.id} className="priest-info-card">
              <div className="card-header">
                <h3>{p.firstName} {p.lastName}</h3>
                <span className="priest-username">@{p.username}</span>
              </div>
              <div className="card-body">
                <p><strong>Phone:</strong> {p.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {p.address || 'N/A'}</p>
                <div>
                  <strong>Services:</strong>
                  <div className="services-tags">
                      {(p.poojas || []).length > 0 ? p.poojas.map(s => <span key={s} className="tag">{s}</span>) : 'None'}
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn-edit" onClick={() => handleEdit(p)}><FaUserEdit /> Edit</button>
                <button className="btn-delete" onClick={() => deletePriest(p.id)}><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
          {priests.length === 0 && <p className="loading-error-message">No priests found.</p>}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{isEditing ? 'Edit Priest' : 'Create New Priest'}</h3>
                <button onClick={handleCloseModal} className="close-button"><FaTimes /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <input className="form-input" name="firstName" value={currentPriest.firstName} onChange={handleInputChange} placeholder="First Name" />
                  <input className="form-input" name="lastName" value={currentPriest.lastName} onChange={handleInputChange} placeholder="Last Name" />
                  <input className="form-input" name="username" value={currentPriest.username} onChange={handleInputChange} placeholder="Username (Email)" />
                  <input className="form-input" name="phone" value={currentPriest.phone} onChange={handleInputChange} placeholder="Phone Number" />
                  <input className="form-input col-span-2" name="address" value={currentPriest.address} onChange={handleInputChange} placeholder="Address" />
                  {!isEditing && (
                      <input className="form-input col-span-2" name="password" type="password" onChange={handleInputChange} placeholder="Set Initial Password" />
                  )}
                  <div className="col-span-2">
                      <label>Services Offered</label>
                      <Select
                          isMulti
                          options={servicesList}
                          value={currentPriest.poojas}
                          onChange={handleServiceChange}
                          classNamePrefix="react-select"
                      />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagePriests;