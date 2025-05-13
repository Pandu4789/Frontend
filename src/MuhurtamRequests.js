import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MuhurtamRequests.css';

const MuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appointmentError, setAppointmentError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchAppointments();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('http://localhost:8080/api/muhurtam/all');
      setRequests(response.data);
      const pending = response.data.filter(req => !req.viewed).length;
      setPendingCount(pending || response.data.length);
    } catch (err) {
      console.error('Failed to fetch muhurtam requests:', err);
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
      const response = await axios.get('http://localhost:8080/api/booking/all');
      setAppointments(response.data);
    } catch (err) {
      console.error('Failed to fetch appointment requests:', err);
      setAppointmentError('Failed to load appointment requests');
      toast.error('Failed to load appointment requests');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRequest = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/muhurtam/view/${id}`);
      console.log(`Marked request ${id} as viewed on backend`);
      fetchRequests();
      setViewedIds(prev => new Set(prev).add(id));
      setPendingCount(prev => Math.max(prev - 1, 0));
      toast.info(`Viewed request #${id}`);
    } catch (err) {
      console.error(`Failed to mark request ${id} as viewed`, err);
    }
  };

  const handleAcceptAppointment = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/booking/accept/${id}`);
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app.id === id ? { ...app, status: 'ACCEPTED' } : app
          )
        );
        toast.success('Appointment accepted');
      }
    } catch (err) {
      console.error('Failed to accept the appointment', err);
      toast.error('Failed to accept the appointment');
    }
  };

  const handleRejectAppointment = async (id) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/booking/reject/${id}`);
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.map(app =>
            app.id === id ? { ...app, status: 'REJECTED' } : app
          )
        );
        toast.success('Appointment rejected');
      }
    } catch (err) {
      console.error('Failed to reject the appointment', err);
      toast.error('Failed to reject the appointment');
    }
  };

  const fallback = (value) => {
    return value === undefined || value === null || String(value).trim() === '' ? '-' : value;
  };

  return (
    <div className="muhurtam-requests-container">
      <h1>Muhurtam Requests and Appointment Requests</h1>

      <div className="notification-bar">
        <span className="notification-badge">
          🔔 Pending Muhurtam Requests: {pendingCount}
        </span>
      </div>

      {/* Muhurtam Requests Section */}
      <div className="muhurtam-section">
        <h2>Muhurtam Requests</h2>

        {loading ? (
          <p>Loading muhurtam requests...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : requests.length === 0 ? (
          <p>No muhurtam requests available.</p>
        ) : (
          <div className="requests-list">
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
                {requests.map((req, index) => {
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
                          <button onClick={() => handleViewRequest(req.id)}>
                            Mark As Viewed
                          </button>
                        ) : (
                          <span>✅ Viewed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Appointment Requests Section */}
      <div className="muhurtam-section">
        <h2>Appointment Requests</h2>

        {loading ? (
          <p>Loading appointment requests...</p>
        ) : appointmentError ? (
          <p className="error-message">{appointmentError}</p>
        ) : appointments.length === 0 ? (
          <p>No appointment requests available.</p>
        ) : (
          <div className="requests-list">
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
                {appointments.map((app, index) => {
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
                            <button
                              onClick={() => handleAcceptAppointment(app.id)}
                              disabled={['ACCEPTED', 'REJECTED'].includes(status)}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRejectAppointment(app.id)}
                              disabled={['ACCEPTED', 'REJECTED'].includes(status)}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default MuhurtamRequests;
