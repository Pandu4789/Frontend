import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import { FaUserPlus, FaUserEdit, FaTrash, FaTimes } from 'react-icons/fa';
// No need to import a separate CSS file

const API_BASE = "http://localhost:8080";

const emptyCustomer = {
  id: null,
  firstName: '',
  lastName: '',
  username: '', // email
  phone: '',
  address: '',
  password: '',
};

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/customers`);
      setCustomers(res.data);
    } catch (err) {
      toast.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentCustomer(emptyCustomer);
    setIsModalOpen(true);
  };

  const handleEdit = (customer) => {
    setIsEditing(true);
    const { password, ...customerToEdit } = customer;
    setCurrentCustomer(customerToEdit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  const handleInputChange = (e) => {
    setCurrentCustomer({ ...currentCustomer, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!currentCustomer.username || !currentCustomer.firstName) {
        toast.error("First name and username are required.");
        return;
    }
    try {
      if (isEditing) {
        await axios.put(`${API_BASE}/api/auth/customers/${currentCustomer.id}`, currentCustomer);
        toast.success("Customer updated successfully!");
      } else {
        if (!currentCustomer.password) {
            toast.error("Password is required for new customers.");
            return;
        }
        await axios.post(`${API_BASE}/api/auth/register-customer`, currentCustomer);
        toast.success("Customer created successfully!");
      }
      handleCloseModal();
      fetchCustomers();
    } catch (err) {
      toast.error("Failed to save customer.");
    }
  };

  const deleteCustomer = async (id) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
        try {
            await axios.delete(`${API_BASE}/api/auth/customers/${id}`);
            toast.success("Customer deleted successfully.");
            fetchCustomers();
        } catch (err) {
            toast.error("Failed to delete customer.");
        }
    }
  };

  return (
    <>
      {/* ✅ ALL STYLES ARE NOW INCLUDED DIRECTLY IN THE COMPONENT FILE */}
      <style>{`
        /* This file uses variables from your global index.css for theme consistency */
        .manage-customers-container {
            padding: 1rem;
        }
        .mc-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        .mc-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--primary-dark);
        }
        .mc-add-btn {
            background-color: var(--theme-heading);
            color: white;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            border: none;
            padding: 10px 18px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
        }
        .mc-add-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        /* Customer Card Grid */
        .customer-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 1.5rem;
        }
        .customer-info-card {
            background-color: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            display: flex;
            flex-direction: column;
        }
        .card-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid var(--border-color);
        }
        .card-header h3 {
            margin: 0;
            font-size: 1.25rem;
            color: var(--primary-dark);
        }
        .customer-username {
            font-size: 0.9rem;
            color: var(--text-light);
            font-family: monospace;
        }
        .card-body {
            padding: 1.25rem;
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .card-body p {
            margin: 0;
            font-size: 0.95rem;
            color: var(--text-dark);
        }
        .card-body p strong {
            color: var(--text-light);
            font-weight: 500;
            min-width: 80px;
            display: inline-block;
        }
        .card-footer {
            padding: 1rem 1.25rem;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            background-color: #f9fafb;
        }
        .btn-edit, .btn-delete {
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: opacity 0.2s;
        }
        .btn-edit:hover, .btn-delete:hover {
            opacity: 0.8;
        }
        .btn-edit {
            background-color: var(--hover-bg);
            color: var(--theme-heading);
        }
        .btn-delete {
            background-color: var(--danger-color);
            color: white;
        }

        /* Modal Styles */
        .modal-overlay { position: fixed; inset: 0; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: var(--card-bg); padding: 1.5rem; border-radius: 12px; width: 90%; max-width: 600px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; margin-bottom: 1.5rem; }
        .modal-header h3 { margin: 0; font-size: 1.5rem; color: var(--primary-dark); }
        .close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-light); }
        .modal-body .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .modal-body .col-span-2 { grid-column: span 2 / span 2; }
        .modal-footer { padding-top: 1.5rem; margin-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 1rem; }
      `}</style>
      
      <div className="manage-customers-container">
        <div className="mc-header">
          <h2 className="mc-title">Manage Customers</h2>
          <button className="mc-add-btn" onClick={handleAddNew}>
            <FaUserPlus /> Add New Customer
          </button>
        </div>

        <div className="customer-grid">
          {customers.map((c) => (
            <div key={c.id} className="customer-info-card">
              <div className="card-header">
                <h3>{c.firstName} {c.lastName}</h3>
                <span className="customer-username">{c.username}</span>
              </div>
              <div className="card-body">
                <p><strong>Phone:</strong> {c.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {c.address || 'N/A'}</p>
              </div>
              <div className="card-footer">
                <button className="btn-edit" onClick={() => handleEdit(c)}><FaUserEdit /> Edit</button>
                <button className="btn-delete" onClick={() => deleteCustomer(c.id)}><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
          {customers.length === 0 && <p className="loading-error-message">No customers found.</p>}
        </div>

        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{isEditing ? 'Edit Customer' : 'Create New Customer'}</h3>
                <button onClick={handleCloseModal} className="close-button"><FaTimes /></button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <input className="form-input" name="firstName" value={currentCustomer.firstName} onChange={handleInputChange} placeholder="First Name" />
                  <input className="form-input" name="lastName" value={currentCustomer.lastName} onChange={handleInputChange} placeholder="Last Name" />
                  <input className="form-input" name="username" value={currentCustomer.username} onChange={handleInputChange} placeholder="Username (Email)" />
                  <input className="form-input" name="phone" value={currentCustomer.phone} onChange={handleInputChange} placeholder="Phone Number" />
                  <input className="form-input col-span-2" name="address" value={currentCustomer.address} onChange={handleInputChange} placeholder="Address" />
                  {!isEditing && (
                      <input className="form-input col-span-2" name="password" type="password" onChange={handleInputChange} placeholder="Set Initial Password" />
                  )}
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

export default ManageCustomers;