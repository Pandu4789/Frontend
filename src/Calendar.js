// src/Calendar.jsx
import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// --- Localizer setup ---
const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// --- Helpers to generate UI data ---
const generateTimeSlots = () => {
  const slots = [];
  const dt = new Date();
  dt.setHours(0,0,0,0);
  for (let i = 0; i < 48; i++) {
    slots.push(format(new Date(dt.getTime() + i*30*60000), 'hh:mm a'));
  }
  return slots;
};
const timeOptions = generateTimeSlots();
const months = Array.from({ length: 12 }, (_, i) => format(new Date(0, i), 'LLLL'));
const years  = Array.from({ length: 11 }, (_, i) => 2020 + i);

function Calendar() {
  // State
  const [events, setEvents] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState({ opts: true, events: true });
  const [isLoading, setIsLoading] = useState(true);
  const [viewDate, setViewDate]   = useState(new Date());
  const [viewMode, setViewMode]   = useState('month');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId]       = useState(null);
  const [formData, setFormData]   = useState({
    event:'', name:'', phone:'', date:new Date(), timeFrom:'', timeTo:'', address:''
  });

  // Fetch dropdown options
 useEffect(() => {
         fetch("http://localhost:8080/api/events")
             .then(res => res.json())
             .then(data => {
                 console.log("Fetched events from backend:", data); // ✅ Confirm the response
                 setEvents(data);
                 const names = data.map(n => n.name);
                 setOptions(names);
                 setIsLoading(false);
             })
             .catch(err => {
                 console.error("Failed to load events", err);
                 setIsLoading(false);
             });
     }, []);

  // Fetch calendar appointments
  const loadAppointments = async () => {
    try {
      const res = (await fetch("http://localhost:8080/api/appointments")
    );
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      setEvents(data.map(a => ({
        ...a,
        start: new Date(a.start),
        end: new Date(a.end),
        title: a.name,
      })));
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(ld => ({ ...ld, events: false }));
    }
  };
  useEffect(() => {
    loadAppointments();
  }, []);

  // Open & close modal
  const openAdd = () => {
    setEditId(null);
    setFormData({ event:'', name:'', phone:'', date:new Date(), timeFrom:'', timeTo:'', address:'' });
    setShowModal(true);
  };
  const openEdit = appt => {
    setEditId(appt.id);
    setFormData({
      event: appt.event,
      name: appt.name,
      phone: appt.phone,
      date: appt.start,
      timeFrom: format(appt.start,'hh:mm a'),
      timeTo: format(appt.end,'hh:mm a'),
      address: appt.address,
    });
    setShowModal(true);
  };
  const closeModal = () => setShowModal(false);

  // Form handlers
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };
  const handleDateChange = date => setFormData(fd => ({ ...fd, date }));

  // Convert date+time to ISO
  const toISO = (date, time) => {
    const [h,m] = time.split(':');
    const ampm = time.split(' ')[1];
    const dt = new Date(date);
    const hh = ampm==='am' ? Number(h)%12 : Number(h)%12 + 12;
    dt.setHours(hh, m==='30'?30:0);
    return dt.toISOString();
  };

  // Submit (add or edit)
  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...formData,
      start: toISO(formData.date, formData.timeFrom),
      end:   toISO(formData.date, formData.timeTo),
    };
    try {
      await fetch(`http://localhost:8080/api/appointments`, 
        {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      await loadAppointments();
      closeModal();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!editId) return;
    try {
      await fetch(`http://localhost:8080/api/appointments/${editId}`, { method: 'DELETE' });

      await loadAppointments();
      closeModal();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };


  return (
    <div style={{ padding:20 }}>
      <h2>Calendar</h2>

      {/* Month/Year selectors */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:15 }}>
        <div>
          <select
            value={viewDate.getMonth()}
            onChange={e => setViewDate(d => { const nd=new Date(d); nd.setMonth(+e.target.value); return nd; })}
            style={{ marginRight:10 }}
          >
            {months.map((m,i)=><option key={i} value={i}>{m}</option>)}
          </select>

          <select
            value={viewDate.getFullYear()}
            onChange={e => setViewDate(d => { const nd=new Date(d); nd.setFullYear(+e.target.value); return nd; })}
          >
            {years.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* View mode */}
        <div>
          {['day','week','month'].map(m => (
            <button
              key={m}
              onClick={()=>setViewMode(m)}
              style={buttonStyle(viewMode===m)}
            >
              {m[0].toUpperCase()+m.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <button onClick={openAdd} style={{ marginBottom:10 }}>Add New Appointment</button>

      {/* Calendar */}
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={viewDate}
        view={viewMode}
        onNavigate={setViewDate}
        onView={setViewMode}
        toolbar={false}
        style={{ height:'80vh' }}
        onSelectEvent={openEdit}
      />

      {/* Modal */}
      {showModal && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h3>{editId ? 'Edit' : 'Add'} Appointment</h3>
            <form onSubmit={handleSubmit}>
              {/* Event dropdown */}
              <label>
                Event:
                <select name="event" value={formData.event} onChange={handleFormChange} required>
                  <option value="">Select event</option>
                  {options.map((name, i) => (
                   <option key={i} value={name}>{name}</option>
            ))}

                </select>
              </label><br/>

              {/* Name, Phone */}
              <label>Name: <input name="name" value={formData.name} onChange={handleFormChange} required/></label><br/>
              <label>Phone:<input name="phone" value={formData.phone} onChange={handleFormChange} required/></label><br/>

              {/* Date picker */}
              <label>
                Date:
                <div style={{ marginTop:4 }}>
                  <DatePicker selected={formData.date} onChange={handleDateChange} dateFormat="yyyy-MM-dd"/>
                </div>
              </label><br/>

              {/* Time slots */}
              <label>From:
                <select name="timeFrom" value={formData.timeFrom} onChange={handleFormChange} required>
                  <option value="">From</option>
                  {timeOptions.map((t,i)=><option key={i} value={t}>{t}</option>)}
                </select>
              </label><br/>
              <label>To:
                <select name="timeTo" value={formData.timeTo} onChange={handleFormChange} required>
                  <option value="">To</option>
                  {timeOptions.map((t,i)=><option key={i} value={t}>{t}</option>)}
                </select>
              </label><br/>

              {/* Address */}
              <label>Address:
                <input name="address" value={formData.address} onChange={handleFormChange} required/>
              </label><br/>

              {/* Actions */}
              <div style={{ marginTop:10 }}>
                <button type="submit">Save</button>
                {editId && <button type="button" onClick={handleDelete} style={{ marginLeft:10 }}>Delete</button>}
                <button type="button" onClick={closeModal} style={{ marginLeft:10 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Styles
const buttonStyle = active => ({
  marginLeft:10, padding:'6px 12px',
  backgroundColor: active ? '#007bff' : '#e0e0e0',
  color: active ? '#fff' : '#000', border:'none', borderRadius:4, cursor:'pointer'
});
const modalStyle = {
  position:'fixed', top:0, left:0, width:'100%', height:'100%',
  backgroundColor:'rgba(0,0,0,0.5)', display:'flex',
  alignItems:'center', justifyContent:'center'
};
const modalContentStyle = {
  background:'#fff', padding:20, borderRadius:4,
  width:400, maxWidth:'90%'
};

export default Calendar;
