// Filename: src/ManagePoojaServices.js - FULLY REDESIGNED
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaTag, FaClock, FaDollarSign } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:8080";

const initialFormState = {
  id: null,
  name: '',
  description: '',
  category: '',
  duration: '',
  estimatedPrice: ''
};

const ManagePoojaServices = () => {
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState(initialFormState);

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/events`);
      setServices(response.data);
    } catch (error) {
      toast.error("Failed to fetch services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentService(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentService(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setIsEditing(true);
    setCurrentService(service);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentService(initialFormState);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(`${API_BASE}/api/events/${serviceId}`);
        toast.success("Service deleted successfully!");
        fetchServices();
      } catch (error) {
        toast.error("Failed to delete service.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentService.name || !currentService.description) {
        toast.warn("Service Name and Description are required.");
        return;
    }
    
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/api/events/${currentService.id}`, currentService);
        toast.success(`Service "${currentService.name}" updated!`);
      } else {
        await axios.post(`${API_BASE}/api/events`, currentService);
        toast.success(`Service "${currentService.name}" created!`);
      }
      handleCloseModal();
      fetchServices();
    } catch (error) {
      toast.error("Failed to save service.");
    }
  };
  
  return (
    <>
      <style>{`
        /* Styles for ManagePoojaServices Component */
        .manage-services-container { padding: 1rem; }
        .ms-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .ms-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        .ms-add-btn { background-color: var(--theme-heading); color: white; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
        .ms-add-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        
        .service-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        .service-card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); display: flex; flex-direction: column; }
        .service-card-header { padding: 1rem 1.25rem; }
        .service-card-header h3 { margin: 0; font-size: 1.25rem; color: var(--primary-dark); }
        .service-card-body { padding: 1.25rem; flex-grow: 1; display: flex; flex-direction: column; gap: 1rem; }
        .service-detail-item { display: flex; align-items: center; gap: 10px; font-size: 0.95rem; color: var(--text-dark); }
        .service-detail-item .icon { color: var(--theme-heading); font-size: 0.9rem; }
        .service-description { font-style: italic; color: var(--text-light); border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 0.5rem; }
        .service-card-footer { padding: 1rem 1.25rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 0.75rem; background-color: #f9fafb; }
        .btn-edit-service, .btn-delete-service { border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .btn-edit-service { background-color: var(--hover-bg); color: var(--theme-heading); }
        .btn-delete-service { background-color: var(--danger-color); color: white; }

        /* Reusable Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: var(--card-bg); padding: 1.5rem; border-radius: 12px; width: 90%; max-width: 600px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .modal-header h2 { margin: 0; font-size: 1.5rem; color: var(--primary-dark); }
        .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-body .col-span-2 { grid-column: span 2 / span 2; }
        .modal-footer { padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; }
      `}</style>
      <div className="manage-services-container">
        <ToastContainer position="bottom-right" autoClose={3000} theme="colored"/>
        <div className="ms-header">
          <h1 className="ms-title">Manage Pooja Services</h1>
          {!isModalOpen && (
            <button className="ms-add-btn" onClick={handleAddNew}>
              <FaPlus /> Add New Service
            </button>
          )}
        </div>

        <div className="service-list-grid">
          {isLoading ? <p className="loading-error-message">Loading services...</p> : services.map(event => (
            <div className="service-card" key={event.id}>
              <div className="service-card-header">
                <h3>{event.name}</h3>
              </div>
              <div className="service-card-body">
                <div className="service-detail-item">
                  <FaTag className="icon"/> <strong>Category:</strong> {event.category || 'N/A'}
                </div>
                <div className="service-detail-item">
                  <FaClock className="icon"/> <strong>Duration:</strong> {event.duration || 'N/A'}
                </div>
                <div className="service-detail-item">
                  <FaDollarSign className="icon"/> <strong>Price:</strong> {event.estimatedPrice || 'N/A'}
                </div>
                <p className="service-description">{event.description || 'No description provided.'}</p>
              </div>
              <div className="service-card-footer">
                <button className="btn-edit-service" onClick={() => handleEdit(event)}><FaEdit /> Edit</button>
                <button className="btn-delete-service" onClick={() => handleDelete(event.id)}><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>{isEditing ? 'Edit Service' : 'Create New Service'}</h2>
                <button onClick={handleCloseModal} className="close-button"><FaTimes /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-body">
                <div className="form-grid">
                  <input className="form-input col-span-2" name="name" value={currentService.name} onChange={handleInputChange} placeholder="Service Name (e.g., Griha Pravesh)" required />
                  <input className="form-input" name="category" value={currentService.category} onChange={handleInputChange} placeholder="Category (e.g., Lifecycle Events)" />
                  <input className="form-input" name="duration" value={currentService.duration} onChange={handleInputChange} placeholder="Duration (e.g., 2 - 3 hours)" />
                  <input className="form-input col-span-2" name="estimatedPrice" value={currentService.estimatedPrice} onChange={handleInputChange} placeholder="Estimated Price (e.g., $351)" />
                  <textarea className="form-input col-span-2" name="description" value={currentService.description} onChange={handleInputChange} placeholder="A brief description of the service..." required />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{isEditing ? 'Update Service' : 'Create Service'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ManagePoojaServices;