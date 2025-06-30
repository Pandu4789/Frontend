import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { FaChevronDown, FaUser, FaUserTie } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = "http://localhost:8080";

const ManageMuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRequestId, setExpandedRequestId] = useState(null); // To track which card is open

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/muhurtam/all`);
      // Sort by newest first
      const sortedData = (res.data || []).sort((a, b) => b.id - a.id);
      setRequests(sortedData);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewedToggle = async (id, viewed) => {
    try {
      await axios.put(`${API_BASE}/api/muhurtam/viewed/${id}`, { viewed });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, viewed } : r))
      );
      toast.success(`Marked as ${viewed ? "viewed" : "unread"}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleToggleExpand = (id) => {
    // If the clicked card is already open, close it. Otherwise, open it.
    setExpandedRequestId(expandedRequestId === id ? null : id);
  };

  const fallback = (val) => (val ? val : "-");

  return (
    <>
      <style>{`
        .manage-muhurtam-container { padding: 1rem; }
        .mmr-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .mmr-title { font-size: 1.8rem; font-weight: 700; color: var(--primary-dark); }
        
        .request-list { display: flex; flex-direction: column; gap: 1rem; }
        .request-card { background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; box-shadow: var(--shadow-sm); transition: box-shadow 0.2s ease; }
        .request-card:hover { box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        
        .card-summary { display: grid; grid-template-columns: 1fr 1fr auto auto; align-items: center; padding: 1rem 1.5rem; cursor: pointer; }
        .summary-item { display: flex; align-items: center; gap: 8px; font-size: 1rem; }
        .summary-item .icon { color: var(--text-light); }
        .summary-item strong { color: var(--text-dark); }
        
        .expand-icon { transition: transform 0.3s ease; }
        .expand-icon.expanded { transform: rotate(180deg); }
        
        .card-details {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-out, padding 0.4s ease-out;
          border-top: 1px solid var(--border-color);
          padding: 0 1.5rem;
        }
        .card-details.expanded {
          max-height: 500px; /* Adjust as needed */
          padding: 1.5rem 1.5rem;
        }
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
        .detail-item { background: var(--hover-bg); padding: 10px; border-radius: 6px; }
        .detail-item strong { display: block; font-size: 0.8rem; color: var(--text-light); margin-bottom: 4px; }
        .detail-item span { font-size: 1rem; color: var(--text-dark); }
        .detail-item.full-width { grid-column: 1 / -1; }
        
        /* Modern Toggle Switch CSS */
        .toggle-switch { position: relative; display: inline-block; width: 50px; height: 28px; }
        .toggle-switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 28px; }
        .slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: var(--success-color, #28a745); }
        input:checked + .slider:before { transform: translateX(22px); }
      `}</style>

      <div className="manage-muhurtam-container">
        <div className="mmr-header">
            <h2 className="mmr-title">Manage Muhurtam Requests</h2>
        </div>
        
        {loading ? <p className="loading-error-message">Loading requests...</p> : (
            <div className="request-list">
                {requests.map((r) => (
                    <div key={r.id} className="request-card">
                        <div className="card-summary" onClick={() => handleToggleExpand(r.id)}>
                            <div className="summary-item">
                                <FaUser className="icon" />
                                <strong>{fallback(r.name)}</strong>
                            </div>
                            <div className="summary-item">
                                <FaUserTie className="icon" />
                                <span>{fallback(r.priestUsername)}</span>
                            </div>
                            <div className="summary-item">
                                <label className="toggle-switch" onClick={(e) => e.stopPropagation()}>
                                    <input
                                        type="checkbox"
                                        checked={r.viewed || false}
                                        onChange={(e) => handleViewedToggle(r.id, e.target.checked)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                             <div className="summary-item">
                                <FaChevronDown className={`expand-icon ${expandedRequestId === r.id ? 'expanded' : ''}`} />
                            </div>
                        </div>
                        
                        <div className={`card-details ${expandedRequestId === r.id ? 'expanded' : ''}`}>
                            <div className="details-grid">
                                <div className="detail-item">
                                    <strong>Phone</strong>
                                    <span>{fallback(r.phone)}</span>
                                </div>
                                <div className="detail-item">
                                    <strong>Email</strong>
                                    <span>{fallback(r.email)}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <strong>Nakshatrams</strong>
                                    <span>{r.nakshatrams ? r.nakshatrams.join(', ') : '-'}</span>
                                </div>
                                <div className="detail-item full-width">
                                    <strong>Notes</strong>
                                    <span>{fallback(r.notes)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && <p className="loading-error-message">No requests found.</p>}
            </div>
        )}
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </>
  );
};

export default ManageMuhurtamRequests;