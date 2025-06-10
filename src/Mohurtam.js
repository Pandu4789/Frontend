// Filename: Mohurtam.js - UPDATED with new page structure
import React, { useState, useEffect } from "react";
import "./Mohurtam.css";

const Mohurtam = () => {
  const [selectedNakshatrams, setSelectedNakshatrams] = useState([""]);
  const [availableNakshatrams, setAvailableNakshatrams] = useState([]);
  const [resultNakshatrams, setResultNakshatrams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    // This is a placeholder. Replace with your actual API endpoint.
    const nakshatramList = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
    setAvailableNakshatrams(nakshatramList);
    setLoading(false);
  }, []);

  const handleDropdownChange = (e, index) => {
    const updated = [...selectedNakshatrams];
    updated[index] = e.target.value;
    setSelectedNakshatrams(updated);
    setSubmitted(false); // Reset on change
  };

  const addDropdown = () => setSelectedNakshatrams((prev) => [...prev, ""]);
  const removeDropdown = (index) => setSelectedNakshatrams((prev) => prev.filter((_, i) => i !== index));

  const computeNextNakshatrams = (selected) => {
    const idx = availableNakshatrams.indexOf(selected);
    if (idx === -1) return [];
    const offsets = [1, 3, 5, 7, 8, 10, 12, 14, 16, 17, 19, 21, 23, 25, 26];
    return offsets.map((offset) => availableNakshatrams[(idx + offset) % availableNakshatrams.length]).filter(Boolean);
  };

  const findCommonNakshatrams = () => {
    const validSelections = selectedNakshatrams.filter(s => s !== "");
    if (validSelections.length === 0) return [];
    const allComputed = validSelections.map(computeNextNakshatrams);
    const intersection = allComputed.reduce((acc, curr) => acc.filter((x) => curr.includes(x)));
    return [...new Set(intersection)]; // Ensure unique results
  };

  const handleFind = () => {
    setSubmitted(true);
    setResultNakshatrams([]); // Clear previous results
    const common = findCommonNakshatrams();
    setResultNakshatrams(common);
    // In a real app, you would fetch schedule data here for the 'common' nakshatrams
  };

  if (loading) return <div className="loading-message">Loading Nakshatram data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="mohurtam-page-container">
      <h1 className="mohurtam-page-title">Mohurtam Finder</h1>
      <p className="mohurtam-page-description">
        Select one or more birth Nakshatrams (for the bride, groom, etc.) to find common auspicious dates for important events.
      </p>
      
      <div className="mohurtam-input-section">
        <h2 className="input-section-title">Select Birth Nakshatrams</h2>
        {selectedNakshatrams.map((value, index) => (
          <div key={index} className="dropdown-group">
            <select
              value={value}
              onChange={(e) => handleDropdownChange(e, index)}
              className="nakshatram-dropdown"
            >
              <option value="">-- Choose Nakshatram --</option>
              {availableNakshatrams.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {selectedNakshatrams.length > 1 && (
                <button className="action-btn remove" onClick={() => removeDropdown(index)}>−</button>
            )}
          </div>
        ))}
        <div className="add-action-container">
            <button className="action-btn add" onClick={addDropdown}>+ Add Person</button>
        </div>
        <button
          onClick={handleFind}
          disabled={selectedNakshatrams.some((val) => val === "")}
          className="find-btn"
        >
          Find Common Mohurtams
        </button>
      </div>
  
      {submitted && (
        <div className="results-section">
          <h2 className="results-section-title">Auspicious Results</h2>
          {resultNakshatrams.length > 0 ? (
            <div className="results-grid">
              {resultNakshatrams.map((name, idx) => (
                <div key={idx} className="result-card">
                  <h4>{name}</h4>
                  <p className="mock-data-notice">
                    No available dates and times for '{name}' .
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-match-message">
              <p>No common Mohurtam found for the selected Nakshatrams.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Mohurtam;