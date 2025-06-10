// Filename: MuhurtamRequests.js - REDESIGNED CARDS
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MuhurtamRequests.css';
import { FaBell, FaCalendarCheck } from 'react-icons/fa';

// --- Sample Data ---
const getMockData = () => ({
  muhurtamRequests: [
    { id: 1, name: 'Karthik Varma', nakshatram: 'Rohini', date: '2025-07-15', time: 'Morning', place: 'Dallas, TX', phone: '111-222-3333', email: 'k.varma@email.com', viewed: false },
    { id: 2, name: 'Priya Desai', nakshatram: 'Swati', date: '2025-08-01', time: 'Any auspicious time', place: 'Irving, TX', phone: '222-333-4444', email: 'priya.d@email.com', viewed: true },
  ],
  appointmentRequests: [
    { id: 101, name: 'Ananya Rao', event: { name: 'Griha Pravesh' }, date: '2025-07-20', start: '09:00', end: '11:00', address: '123 Main St, Frisco, TX', status: 'PENDING' },
    { id: 102, name: 'Rohan Sharma', event: { name: 'Satyanarayan Puja' }, date: '2025-07-22', start: '17:00', end: '19:00', address: '456 Oak Ln, Plano, TX', status: 'PENDING' },
    { id: 103, name: 'Sunita Patel', event: { name: 'Wedding Ceremony' }, date: '2025-08-10', start: '10:00', end: '13:00', address: '789 Pine Rd, Coppell, TX', status: 'ACCEPTED' },
    { id: 104, name: 'Vikram Singh', event: { name: 'Birthday Havan' }, date: '2025-08-12', start: '08:00', end: '09:00', address: '101 Maple Ave, Southlake, TX', status: 'REJECTED' },
  ]
});

const MuhurtamRequests = () => {
  const [activeTab, setActiveTab] = useState('muhurtam');
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [viewedIds, setViewedIds] = useState(new Set());
  const [filter, setFilter] = useState('');

  const priestId = localStorage.getItem('userId');

  useEffect(() => {
    const mockData = getMockData();
    setRequests(mockData.muhurtamRequests);
    setAppointments(mockData.appointmentRequests);
  }, [priestId]);
  
  const handleViewRequest = (id) => { toast.info(`Marked request #${id} as viewed`); };
  const handleAcceptAppointment = (id) => { toast.success('Appointment accepted'); };
  const handleRejectAppointment = (id) => { toast.error('Appointment rejected'); };

  const pendingMuhurtamCount = requests.filter(req => !req.viewed && !viewedIds.has(req.id)).length;
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
          {filteredData.length === 0 ? (
            <p className="no-requests-message">No requests found.</p>
          ) : activeTab === 'muhurtam' ? (
            filteredData.map(req => <MuhurtamCard key={req.id} request={req} onView={handleViewRequest} viewedIds={viewedIds} />)
          ) : (
            filteredData.map(app => <AppointmentCard key={app.id} appointment={app} onAccept={handleAcceptAppointment} onReject={handleRejectAppointment} />)
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
    </div>
  );
};

// --- Card Components ---

const MuhurtamCard = ({ request, onView, viewedIds }) => {
    const isViewed = request.viewed || viewedIds.has(request.id);
    return (
        <div className={`request-card ${isViewed ? 'viewed' : 'new'}`}>
            <div className="card-header">
                <h3>{request.name}</h3>
            </div>
            <div className="card-body">
                {/* Nakshatram is now in the body */}
                <p><strong>Nakshatram:</strong> {request.nakshatram}</p>
                <p><strong>Date:</strong> {request.date}</p>
                <p><strong>Time:</strong> {request.time}</p>
                <p><strong>Place:</strong> {request.place}</p>
                <p><strong>Phone:</strong> {request.phone}</p>
                <p><strong>Email:</strong> {request.email}</p>
            </div>
            <div className="card-actions">
                {!isViewed ? (
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
            <div className="card-header">
                {/* Event name is now the main title */}
                <h3>{appointment.event?.name}</h3>
            </div>
            <div className="card-body">
                 {/* Requester name is now in the body */}
                <p><strong>Requester:</strong> {appointment.name}</p>
                <p><strong>Date:</strong> {appointment.date}</p>
                <p><strong>Time:</strong> {appointment.start} - {appointment.end}</p>
                <p><strong>Address:</strong> {appointment.address}</p>
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