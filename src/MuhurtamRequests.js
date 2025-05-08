import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MuhurtamRequests.css';

const MuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [viewedIds, setViewedIds] = useState(new Set());

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/muhurtam/all');
      setRequests(response.data);
      setPendingCount(response.data.length);
    } catch (error) {
      console.error('Failed to fetch muhurtam requests:', error);
      toast.error('Failed to load requests');
    }
  };

  const handleViewRequest = (id) => {
    setViewedIds(prev => new Set(prev).add(id));
    setPendingCount(prev => Math.max(prev - 1, 0));
    toast.info(`Viewed request #${id}`);
  };

  return (
    <div className="muhurtam-requests-container">
      <h1>Muhurtam Requests</h1>

      <div className="notification-bar">
        <span className="notification-badge">
          🔔 Pending Requests: {pendingCount}
        </span>
      </div>

      <div className="requests-list">
        {requests.length === 0 ? (
          <p>No requests available.</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Nakshatram</th>
                <th>Date</th>
                <th>Time</th>
                <th>Place</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email ID</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className={viewedIds.has(req.id) ? 'viewed-row' : ''}>
                  <td>{req.id}</td>
                  <td>{req.name}</td>
                  <td>{req.nakshatram || '-'}</td>
                  <td>{req.date || '-'}</td>
                  <td>{req.time || '-'}</td>
                  <td>{req.place || '-'}</td>
                    <td>{req.address || '-'}</td>
                    <td>{req.phone || '-'}</td>
                    <td>{req.email || '-'}</td>
                
                  <td>
                    {!viewedIds.has(req.id) ? (
                      <button onClick={() => handleViewRequest(req.id)}>View</button>
                    ) : (
                      <span>✅ Viewed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default MuhurtamRequests;
