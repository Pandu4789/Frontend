import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MuhurtamRequests.css';

const MuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [appointmentPendingCount, setAppointmentPendingCount] = useState(0);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const [requestFilter, setRequestFilter] = useState('');
  const [appointmentFilter, setAppointmentFilter] = useState('');

  const priestId = localStorage.getItem('userId');

  useEffect(() => {
    if (priestId) {
      fetchRequests();
      fetchAppointments();
    } else {
      toast.error('Priest ID not found. Please login again.');
    }
  }, [priestId]);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://localhost:8080/api/muhurtam/priest/${priestId}`);
      const data = (response.data || []).sort((a, b) => b.id - a.id);
      setRequests(data);
      const pending = data.filter(req => !req.viewed).length;
      setPendingCount(pending);
    } catch (err) {
      setError('Failed to load muhurtam requests');
      toast.error('Failed to load muhurtam requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    setLoading(true);
    setAppointmentError('');
    try {
      const response = await axios.get(`http://localhost:8080/api/booking/priest/${priestId}`);
      const data = (response.data || []).sort((a, b) => b.id - a.id);
      setAppointments(data);
      const pending = data.filter(app => {
        const status = app.status?.toUpperCase();
        return status !== 'ACCEPTED' && status !== 'REJECTED';
      }).length;
      setAppointmentPendingCount(pending);
    } catch (err) {
      setAppointmentError('Failed to load appointment requests');
      toast.error('Failed to load appointment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/muhurtam/view/${id}`);
      setViewedIds(prev => new Set(prev).add(id));
      setRequests(prev => prev.map(req => req.id === id ? { ...req, viewed: true } : req));
      setPendingCount(prev => Math.max(prev - 1, 0));
      toast.info(`Marked request #${id} as viewed`);
    } catch {
      toast.error('Failed to update request status');
    }
  };

  const handleAcceptAppointment = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/booking/accept/${id}`);
      if (response.status === 200) {
        setAppointments(prev => prev.map(app =>
          app.id === id ? { ...app, status: 'ACCEPTED' } : app
        ));
        setAppointmentPendingCount(prev => Math.max(prev - 1, 0));
        toast.success('Appointment accepted');
      }
    } catch {
      toast.error('Failed to accept the appointment');
    }
  };

  const handleRejectAppointment = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/booking/reject/${id}`);
      if (response.status === 200) {
        setAppointments(prev => prev.map(app =>
          app.id === id ? { ...app, status: 'REJECTED' } : app
        ));
        setAppointmentPendingCount(prev => Math.max(prev - 1, 0));
        toast.success('Appointment rejected');
      }
    } catch {
      toast.error('Failed to reject the appointment');
    }
  };

  const fallback = (value) =>
    value === undefined || value === null || String(value).trim() === '' ? '-' : value;

  const filteredRequests = requests.filter(req =>
    req.name?.toLowerCase().includes(requestFilter.toLowerCase())
  );

  const filteredAppointments = appointments.filter(app =>
    app.name?.toLowerCase().includes(appointmentFilter.toLowerCase())
  );

  return (
    <div className="muhurtam-requests-container">
      {/* Muhurtam Requests */}
      <div className="muhurtam-section">
        <div className="section-header">
          <h2>Muhurtam Requests</h2>
          <span className="notification-badge">🔔 {pendingCount} pending</span>
        </div>
        <input
          type="text"
          placeholder="Search by name"
          value={requestFilter}
          onChange={(e) => setRequestFilter(e.target.value)}
          className="filter-input"
        />
        {loading ? (
          <p>Loading muhurtam requests...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : filteredRequests.length === 0 ? (
          <p>No muhurtam requests found.</p>
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
              {filteredRequests.map((req, index) => {
                const isViewed = req.viewed || viewedIds.has(req.id);
                return (
                  <tr key={req.id} className={isViewed ? 'viewed-row' : ''}>
                    <td>{index + 1}</td>
                    <td>{fallback(req.name)}</td>
                    <td>{fallback(req.nakshatram)}</td>
                    <td>{fallback(req.date)}</td>
                    <td>{fallback(req.time)}</td>
                    <td>{fallback(req.place)}</td>
                    <td>{fallback(req.address)}</td>
                    <td>{fallback(req.phone)}</td>
                    <td>{fallback(req.email)}</td>
                    <td>
                      {!isViewed ? (
                        <button onClick={() => handleViewRequest(req.id)}>Mark As Viewed</button>
                      ) : (
                        <span>✅ Viewed</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Appointment Requests */}
      <div className="muhurtam-section">
        <div className="section-header">
          <h2>Appointment Requests</h2>
          <span className="notification-badge">📅 {appointmentPendingCount} pending</span>
        </div>
        <input
          type="text"
          placeholder="Search by name"
          value={appointmentFilter}
          onChange={(e) => setAppointmentFilter(e.target.value)}
          className="filter-input"
        />
        {loading ? (
          <p>Loading appointment requests...</p>
        ) : appointmentError ? (
          <p className="error-message">{appointmentError}</p>
        ) : filteredAppointments.length === 0 ? (
          <p>No appointment requests found.</p>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Event</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Place</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((app, index) => {
                const status = app.status?.toUpperCase();
                return (
                  <tr key={app.id}>
                    <td>{index + 1}</td>
                    <td>{fallback(app.name)}</td>
                    <td>{fallback(app.event)}</td>
                    <td>{fallback(app.date)}</td>
                    <td>{fallback(app.start)}</td>
                    <td>{fallback(app.end)}</td>
                    <td>{fallback(app.address)}</td>
                    <td>
                      {status === 'ACCEPTED' ? (
                        <span>✅ Accepted</span>
                      ) : status === 'REJECTED' ? (
                        <span>❌ Rejected</span>
                      ) : (
                        <>
                          <button onClick={() => handleAcceptAppointment(app.id)}>Accept</button>
                          <button onClick={() => handleRejectAppointment(app.id)}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default MuhurtamRequests;
