import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const modalStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const modalContentStyle = {
  background: '#ffffff',
  padding: '24px 30px',
  borderRadius: '10px',
  width: '100%',
  maxWidth: '480px',
  maxHeight: '70vh',
  overflowY: 'auto',
  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  fontFamily: 'Arial, sans-serif',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc'
};

const btnStyle = {
  padding: '8px 16px',
  marginRight: 10,
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer'
};

export default function AppointmentModal({
  showModal,
  editId,
  formData,
  handleFormChange,
  handleDateChange,
  handleSubmit,
  handleDelete,
  closeModal,
  options,
  filteredTimeOptions,
  toTimeOptions
}) {
  if (!showModal) return null;

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h3 style={{ marginBottom: 20 }}>{editId ? 'Edit' : 'Add'} Appointment</h3>
        <form onSubmit={handleSubmit}>
          {['event', 'name', 'phone', 'address'].map(field => (
            <div key={field} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </label>
              {field === 'event' ? (
                <select name="event" value={formData.event} onChange={handleFormChange} required style={inputStyle}>
                  <option value="">Select event</option>
                  {options.map((name, i) => (
                    <option key={i} value={name}>{name}</option>
                  ))}
                </select>
              ) : (
                <input name={field} value={formData[field]} onChange={handleFormChange} required style={inputStyle} />
              )}
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>Date:</label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              style={inputStyle}
            />
          </div>
          {['timeFrom', 'timeTo'].map(timeField => (
            <div key={timeField} style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 'bold' }}>
                {timeField === 'timeFrom' ? 'From' : 'To'}:
              </label>
              <select
                name={timeField}
                value={formData[timeField]}
                onChange={handleFormChange}
                required
                style={inputStyle}
              >
                <option value="">{timeField === 'timeFrom' ? 'From' : 'To'}</option>
                {(timeField === 'timeFrom' ? filteredTimeOptions : toTimeOptions).map((t, i) => (
                  <option key={i} value={t}>{t}</option>
                ))}
              </select>
            </div>
          ))}
          <div style={{ marginTop: 20 }}>
            <button type="submit" style={btnStyle}>Save</button>
            {editId && <button type="button" onClick={handleDelete} style={{ ...btnStyle, backgroundColor: '#dc3545' }}>Delete</button>}
            <button type="button" onClick={closeModal} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
