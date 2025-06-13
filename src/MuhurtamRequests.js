// Filename: MuhurtamRequests.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MuhurtamRequests.css';
import { FaBell, FaCalendarCheck } from 'react-icons/fa';

const API_BASE = "http://localhost:8080";

const MuhurtamRequests = () => {
  const [activeTab, setActiveTab] = useState('muhurtam');
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const priestId = localStorage.getItem('userId');

  const fetchData = async () => {
    if (!priestId) {
      toast.error('Priest ID not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const [muhurtamRes, appointmentRes, eventsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/muhurtam/priest/${priestId}`),
        axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
        axios.get(`${API_BASE}/api/events`)
      ]);

      setRequests((muhurtamRes.data || []).sort((a, b) => a.viewed - b.viewed));
      setAppointments((appointmentRes.data || []).sort((a, b) => {
        const order = { PENDING: 0, ACCEPTED: 1, REJECTED: 2 };
        return order[a.status] - order[b.status];
      }));
      setEvents(eventsRes.data || []);

    } catch (err) {
      setError('Failed to load requests. Please try again later.');
      toast.error('Failed to load requests.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [priestId]);

  const getEventNameById = (id) => {
    const match = events.find(e => e.id === id);
    return match ? match.name : 'Unknown Event';
  };

  const handleViewRequest = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/muhurtam/${id}/viewed`, { viewed: true });
      setRequests(prev => {
        const updated = prev.map(req =>
          req.id === id ? { ...req, viewed: true } : req
        );
        return updated.sort((a, b) => a.viewed - b.viewed);
      });
      toast.info(`Request #${id} marked as viewed.`);
    } catch {
      toast.error('Failed to update request status.');
    }
  };

  const handleAcceptAppointment = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/booking/accept/${id}`);
      setAppointments(prev => {
        const updated = prev.map(app =>
          app.id === id ? { ...app, status: 'ACCEPTED' } : app
        );
        return updated.sort((a, b) => {
          const order = { PENDING: 0, ACCEPTED: 1, REJECTED: 2 };
          return order[a.status] - order[b.status];
        });
      });
      toast.success('Appointment accepted!');
    } catch {
      toast.error('Failed to accept the appointment.');
    }
  };

  const handleRejectAppointment = async (id) => {
    try {
      await axios.put(`${API_BASE}/api/booking/reject/${id}`);
      setAppointments(prev => {
        const updated = prev.map(app =>
          app.id === id ? { ...app, status: 'REJECTED' } : app
        );
        return updated.sort((a, b) => {
          const order = { PENDING: 0, ACCEPTED: 1, REJECTED: 2 };
          return order[a.status] - order[b.status];
        });
      });
      toast.warn('Appointment rejected.');
    } catch {
      toast.error('Failed to reject the appointment.');
    }
  };

  const pendingMuhurtamCount = requests.filter(req => !req.viewed).length;
  const pendingAppointmentCount = appointments.filter(app => app.status?.toUpperCase() === 'PENDING').length;

  const filteredData = (activeTab === 'muhurtam' ? requests : appointments).filter(item =>
    item.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="requests-page-container">
      <h1 className="requests-page-title">Requests Inbox</h1>
      <div className="requests-tabs">
        <button className={`tab-btn ${activeTab === 'muhurtam' ? 'active' : ''}`} onClick={() => setActiveTab('muhurtam')}>
          <FaBell /> Muhurtam Requests
          {pendingMuhurtamCount > 0 && <span className="notification-badge">{pendingMuhurtamCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'appointment' ? 'active' : ''}`} onClick={() => setActiveTab('appointment')}>
          <FaCalendarCheck /> Appointment Requests
          {pendingAppointmentCount > 0 && <span className="notification-badge">{pendingAppointmentCount}</span>}
        </button>
      </div>
      <div className="requests-content">
        <div className="filter-container">
          <input type="text" placeholder="Search by name..." value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-input" />
        </div>
        <div className="requests-list">
          {isLoading ? (
            <p className="loading-text">Loading requests...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : filteredData.length === 0 ? (
            <p className="no-requests-message">No requests found in this category.</p>
          ) : activeTab === 'muhurtam' ? (
            filteredData.map(req => (
              <MuhurtamCard key={req.id} request={req} onView={handleViewRequest} getEventName={getEventNameById} />
            ))
          ) : (
            filteredData.map(app => (
              <AppointmentCard key={app.id} appointment={app} onAccept={handleAcceptAppointment} onReject={handleRejectAppointment} />
            ))
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </div>
  );
};

// --- Card Components ---
const MuhurtamCard = ({ request, onView, getEventName }) => {
  return (
    <div className={`request-card ${request.viewed ? 'viewed' : 'new'}`}>
      <div className="card-header"> <h3>{request.name}</h3> </div>
      <div className="card-body">
        {request.eventName && <p><strong>Event:</strong> {request.eventName}</p>}
        {request.nakshatram && <p><strong>Nakshatram:</strong> {request.nakshatram}</p>}
        {request.date && <p><strong>Birth Date:</strong> {request.date}</p>}
        {request.time && <p><strong>Birth Time:</strong> {request.time}</p>}
        {request.place && <p><strong>Birth Place:</strong> {request.place}</p>}
        {request.phone && <p><strong>Phone:</strong> {request.phone}</p>}
        {request.email && <p><strong>Email:</strong> {request.email}</p>}
        {request.note && <p><strong>Notes:</strong> {request.note}</p>}

      </div>
      <div className="card-actions">
        {!request.viewed ? (
          <button className="action-btn view" onClick={() => onView(request.id)}>Mark As Viewed</button>
        ) : (
          <span className="status-text viewed">✅ Viewed</span>
        )}
      </div>
    </div>
  );
};


const AppointmentCard = ({ appointment, onAccept, onReject }) => {
  const status = appointment.status?.toUpperCase();
  return (
    <div className={`request-card ${status !== 'PENDING' ? 'viewed' : 'new'}`}>
      <div className="card-header"> <h3>{appointment.eventName || 'Event Booking'}</h3> </div>
      <div className="card-body">
        <p><strong>Requester:</strong> {appointment.name}</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.start} - {appointment.end}</p>
        <p><strong>Address:</strong> {appointment.address}</p>
        <p><strong>Notes:</strong> {appointment.note}</p>

      </div>
      <div className="card-actions">
        {status === 'PENDING' ? (
          <>
            <button className="action-btn reject" onClick={() => onReject(appointment.id)}>Reject</button>
            <button className="action-btn accept" onClick={() => onAccept(appointment.id)}>Accept</button>
          </>
        ) : status === 'ACCEPTED' ? (
          <span className="status-text accepted">✅ Accepted</span>
        ) : (
          <span className="status-text rejected">❌ Rejected</span>
        )}
      </div>
    </div>
  );
};

export default MuhurtamRequests;
