import React, { useState, useEffect } from 'react';

export default function ManageFestivals() {
  const [festivals, setFestivals] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    fetchFestivals();
  }, []);

  const fetchFestivals = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/festivals');
      const data = await res.json();
      setFestivals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch festivals:', err);
      setFestivals([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !date) return alert('Please enter both name and date.');
    const payload = { name, date };

    const url = editId
      ? `http://localhost:8080/api/festivals/${editId}`
      : 'http://localhost:8080/api/festivals';
    const method = editId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setName('');
        setDate('');
        setEditId(null);
        fetchFestivals();
      } else {
        alert('Error saving festival');
      }
    } catch (err) {
      console.error('Failed to save festival:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this festival?')) return;
    try {
      await fetch(`http://localhost:8080/api/festivals/${id}`, { method: 'DELETE' });
      fetchFestivals();
    } catch (err) {
      console.error('Failed to delete festival:', err);
    }
  };

  const handleEdit = (festival) => {
    setName(festival.name);
    setDate(festival.date);
    setEditId(festival.id);
  };

  const filteredFestivals = festivals.filter((f) => {
    if (filterMonth === 'all') return true;
    const festivalMonth = new Date(f.date).getMonth();
    return festivalMonth === parseInt(filterMonth);
  });

  return (
    <div style={{ display: 'flex', gap: '2rem', padding: '1rem' }}>
      {/* Left: Form Card */}
      <div style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>{editId ? 'Edit Festival' : 'Add Festival'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="Festival Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button type="submit">{editId ? 'Update' : 'Add'}</button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setName('');
                setDate('');
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Right: List Card */}
      <div style={{ flex: 1, padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>Festival List</h3>

        {/* Filter Dropdown */}
        <label>
          Filter by Month:{' '}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            style={{ marginLeft: '0.5rem' }}
          >
            <option value="all">All</option>
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </label>

        {/* Festival Items */}
        <ul style={{ marginTop: '1rem', listStyle: 'none', paddingLeft: 0 }}>
          {filteredFestivals.map((f) => (
            <li key={f.id} style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid #eee' }}>
              <strong>{f.name}</strong> – {new Date(f.date).toLocaleDateString()}
              <div style={{ marginTop: '0.3rem' }}>
                <button onClick={() => handleEdit(f)}>Edit</button>
                <button onClick={() => handleDelete(f.id)} style={{ marginLeft: '0.5rem' }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
          {filteredFestivals.length === 0 && <li>No festivals for selected month.</li>}
        </ul>
      </div>
    </div>
  );
}
