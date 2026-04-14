import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus, FaTrash, FaSearch, FaStar, FaHistory, FaCalendarCheck } from 'react-icons/fa';
import './Mohurtam.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const Mohurtam = () => {
  const [nakshatramList, setNakshatramList] = useState([]);
  const [selectedNakshatrams, setSelectedNakshatrams] = useState(['']);
  const [favorableNakshatrams, setFavorableNakshatrams] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const staticNakshatrams = [
      "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
      "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
      "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
      "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
      "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
    ];
    setNakshatramList(staticNakshatrams);
  }, []);

  const handleNakshatramChange = (e, index) => {
    const updated = [...selectedNakshatrams];
    updated[index] = e.target.value;
    setSelectedNakshatrams(updated);
  };

  const addNakshatram = () => setSelectedNakshatrams(prev => [...prev, '']);
  const removeNakshatram = (index) => setSelectedNakshatrams(prev => prev.filter((_, i) => i !== index));

  const handleFind = async () => {
    if (selectedNakshatrams.some(n => n === '')) {
      toast.error("Please select a Nakshatram for each person.");
      return;
    }
    setIsLoading(true);
    setSubmitted(true);
    try {
      const payload = { nakshatrams: selectedNakshatrams.filter(n => n) };
      const response = await axios.post(`${API_BASE}/api/muhurtam/find`, payload);
      if (response.data) {
        setResults(response.data.dailyResults || []);
        setFavorableNakshatrams(Array.from(response.data.favorableNakshatrams || []).sort());
      }
    } catch (error) {
      toast.error("Failed to sync celestial data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="moh-viewport">
      <ToastContainer position="bottom-right" theme="colored" />
      
      <div className="moh-app-shell">
        <header className="moh-header">
          <h1>Seek Auspicious Time</h1>
          <p>Tara Balam & Panchangam Alignment Analysis</p>
        </header>

        {/* Input Section */}
        <div className="moh-input-card">
          <div className="moh-input-grid">
            {selectedNakshatrams.map((value, index) => (
              <div key={index} className="moh-dropdown-wrapper">
                <label>Person {index + 1}</label>
                <div className="moh-select-group">
                  <select value={value} onChange={(e) => handleNakshatramChange(e, index)}>
                    <option value="">Select Nakshatram...</option>
                    {nakshatramList.map(name => <option key={name} value={name}>{name}</option>)}
                  </select>
                  {selectedNakshatrams.length > 1 && (
                    <button className="moh-remove-btn" onClick={() => removeNakshatram(index)}><FaTrash /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="moh-action-bar">
            <button className="moh-add-person" onClick={addNakshatram}><FaPlus /> Add Member</button>
            <button className="moh-find-btn" onClick={handleFind} disabled={isLoading}>
              <FaSearch /> {isLoading ? 'Calculating...' : 'Find Muhurtams'}
            </button>
          </div>
        </div>

        {submitted && !isLoading && (
          <div className="moh-results-layout">
            {/* Left Sidebar: Tara Balam */}
            <aside className="moh-sidebar">
              <div className="moh-tara-card">
                <h3><FaStar /> Tara Balam</h3>
                <p className="moh-side-hint">Common favorable birth stars for members:</p>
                {favorableNakshatrams.length > 0 ? (
                  <div className="moh-tag-container">
                    {favorableNakshatrams.map(n => <span key={n} className="moh-tag">{n}</span>)}
                  </div>
                ) : (
                  <div className="moh-empty-side">No common matches found.</div>
                )}
              </div>
            </aside>

            {/* Right Side: Recommended Muhurtams */}
            <main className="moh-main-results">
              <div className="moh-results-header">
                <h3><FaCalendarCheck /> Recommended Muhurtams</h3>
              </div>
              {results.length > 0 ? (
                <div className="moh-results-grid">
                  {results.map((res, idx) => (
                    <div key={idx} className={`moh-result-card border-${(res.status || 'gray').toLowerCase()}`}>
                      <div className="moh-card-date">
                        {new Date(res.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="moh-card-body">
                        <div className="moh-data-row"><label>TITHI</label><strong>{res.tithi}</strong></div>
                        <div className="moh-data-row"><label>STAR</label><strong>{res.nakshatram}</strong></div>
                        <div className="moh-data-row"><label>LAGNA</label><strong>{res.muhurtamLagna}</strong></div>
                        <div className="moh-time-box">
                          <label>{res.status === 'orange' ? 'SUGGESTED TIME' : 'MUHURTAM TIME'}</label>
                          <p>{res.status === 'orange' ? res.alternateTime : res.muhurtamTime}</p>
                        </div>
                        {res.notes && <div className="moh-notes">"{res.notes}"</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="moh-no-data">
                  <FaHistory />
                  <p>No suitable Muhurtams found in this interval.</p>
                </div>
              )}
            </main>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mohurtam;