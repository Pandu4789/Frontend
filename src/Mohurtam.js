import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaPlus, FaTrash, FaSearch } from 'react-icons/fa';
import './Mohurtam.css';

const API_BASE = "http://localhost:8080";

const Mohurtam = () => {
  const [nakshatramList, setNakshatramList] = useState([]);
  const [selectedNakshatrams, setSelectedNakshatrams] = useState(['']);
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
    setResults([]);
    try {
      const payload = { nakshatrams: selectedNakshatrams.filter(n => n) };
      const response = await axios.post(`${API_BASE}/api/muhurtam/find`, payload);
      setResults(response.data);
    } catch (error) {
      toast.error("Failed to find Muhurtams. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mohurtam-page-container">
      <ToastContainer position="bottom-right" autoClose={3000} theme="colored" />
      <h1 className="mohurtam-page-title">Auspicious Time Finder (Muhurtam)</h1>
      <p className="mohurtam-page-description">Enter the birth stars (Nakshatram) of the key individuals to find a list of astrologically favorable dates and times.</p>

      <div className="mohurtam-input-section">
        <div className="form-group">
          <label>Enter Birth Nakshatrams</label>
          {selectedNakshatrams.map((value, index) => (
            <div key={index} className="dropdown-group">
              <select
                className="themed-select"
                value={value}
                onChange={(e) => handleNakshatramChange(e, index)}
              >
                <option value="">-- Person {index + 1} Nakshatram --</option>
                {nakshatramList.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              {selectedNakshatrams.length > 1 && (
                <button className="action-btn remove" onClick={() => removeNakshatram(index)}><FaTrash /></button>
              )}
            </div>
          ))}
          <button className="action-btn add" onClick={addNakshatram}><FaPlus /> Add another person</button>
        </div>
        <button onClick={handleFind} disabled={isLoading} className="find-btn">
          <FaSearch /> {isLoading ? 'Searching...' : 'Find Auspicious Dates'}
        </button>
      </div>

      {submitted && !isLoading && (
        <div className="results-section">
          <h2 className="results-section-title">Recommended Muhurtams</h2>
          {results.length > 0 ? (
            <div className="results-grid">
              {results.map((res, idx) => (
                <div key={idx} className={`result-card status-${(res.status || '').toLowerCase()}`}>
                  <h4>{new Date(res.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</h4>
                  <p><strong>Tithi:</strong> {res.tithi}</p>
                  <p><strong>Nakshatram:</strong> {res.nakshatram}</p>
                  <div className="auspicious-times">
                    <strong>{res.status === 'orange' ? 'Suggested Time:' : 'Muhurtam Time:'}</strong>
                    <p className="muhurtam-time-display">
                      {res.status === 'orange' && res.alternateTime ? res.alternateTime : res.muhurtamTime}
                    </p>
                    <p className="muhurtam-lagna-display"><strong>Lagna:</strong> {res.muhurtamLagna}</p>
                    <p className="muhurtam-notes-disply"><strong>Notes:</strong> {res.notes}</p>
                    <p className="muhurtam-status-disply"><strong>Status:</strong> {res.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-match-message">
              <p>No suitable dates found in the next 90 days. Please try a different combination.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mohurtam;