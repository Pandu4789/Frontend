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
    fetch("http://localhost:8080/api/nakshatram")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch nakshatram data.");
        return res.json();
      })
      .then((data) => {
        setAvailableNakshatrams(data.map((item) => item.name));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load Nakshatram data. Please try again.");
        setLoading(false);
      });
  }, []);

  const handleDropdownChange = (e, index) => {
    const updated = [...selectedNakshatrams];
    updated[index] = e.target.value;
    setSelectedNakshatrams(updated);
  };

  const addDropdown = () => setSelectedNakshatrams((prev) => [...prev, ""]);
  const removeDropdown = () =>
    setSelectedNakshatrams((prev) =>
      prev.length > 1 ? prev.slice(0, prev.length - 1) : prev
    );

  const computeNextNakshatrams = (selected) => {
    const idx = availableNakshatrams.indexOf(selected);
    if (idx === -1) return [];

    const offsets = [1, 3, 5, 7, 8, 10, 12, 14, 16, 17, 19, 21, 23, 25, 26];
    return offsets
      .map((offset) => availableNakshatrams[(idx + offset) % availableNakshatrams.length])
      .filter(Boolean);
  };

  const findCommonNakshatrams = () => {
    const allComputed = selectedNakshatrams.map(computeNextNakshatrams);
    const intersection = allComputed.reduce((acc, curr) =>
      acc.length === 0 ? curr : acc.filter((x) => curr.includes(x))
    , []);
    return intersection;
  };

  const handleFind = () => {
    setSubmitted(true);
    const common = findCommonNakshatrams();
    setResultNakshatrams(common);

    common.forEach((nakshatram) => {
      fetch(`http://localhost:8080/api/panchangam/by-nakshatram/${nakshatram}`)
        .then((res) => res.json())
        .then((panchangamData) => {
          // Store initial panchangam
          setSchedules((prevSchedules) => ({
            ...prevSchedules,
            [nakshatram]: { panchangam: panchangamData },
          }));

          // For each panchangam entry, fetch dailyTimes by date
          panchangamData.forEach((sch, i) => {
            fetch(`http://localhost:8080/api/daily-times/by-date/${sch.date}`)
              .then((res) => {
                if (!res.ok) {
                  return res.json().then((err) => { throw new Error(err.error); });
                }
                return res.json();
              })
              .then((dailyTimesData) => {
                setSchedules((prevSchedules) => ({
                  ...prevSchedules,
                  [nakshatram]: {
                    ...prevSchedules[nakshatram],
                    [`dailyTimes_${i}`]: dailyTimesData
                  }
                }));
              })
              .catch((err) => {
                console.error("Error fetching daily times:", err);
                // Optionally store null to indicate missing dailyTimes
                setSchedules((prevSchedules) => ({
                  ...prevSchedules,
                  [nakshatram]: {
                    ...prevSchedules[nakshatram],
                    [`dailyTimes_${i}`]: null
                  }
                }));
              });
          });
        })
        .catch((err) => {
          console.error("Error fetching schedules:", err);
        });
    });
  };

  if (loading) return <div>Loading Nakshatram data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Main container for dropdowns and button */}
      <div className="mohurtam-container">
        {selectedNakshatrams.map((value, index) => (
          <div key={index} className="dropdown-group">
            <select
              value={value}
              onChange={(e) => handleDropdownChange(e, index)}
              className="dropdown"
            >
              <option value="">-- Choose Nakshatram --</option>
              {availableNakshatrams.map((option, idx) => (
                <option key={idx} value={option}>
                  {option}
                </option>
              ))}
            </select>
  
            {index === selectedNakshatrams.length - 1 && (
              <div className="dropdown-actions">
                <span className="action-btn" onClick={addDropdown}>+</span>
                {selectedNakshatrams.length > 1 && (
                  <span className="action-btn" onClick={removeDropdown}>-</span>
                )}
              </div>
            )}
          </div>
        ))}
  
        <button
          onClick={handleFind}
          disabled={selectedNakshatrams.includes("")}
          className="find-btn"
        >
          Find
        </button>
  
        {submitted && resultNakshatrams.length === 0 && (
          <div className="no-match">
            <p>No common Mohurtam found for the selected Nakshatrams.</p>
          </div>
        )}
      </div>
  
      {/* Results section displayed outside the main container */}
      {resultNakshatrams.length > 0 && (
        <div className="results-section">
          <h3>Available Mohurtams:</h3>
          <div className="results-grid">
            {resultNakshatrams.map((name, idx) => {
              const scheduleData = schedules[name];
              const panchangamData = scheduleData?.panchangam || [];
  
              return (
                <div key={idx} className="result-card">
                  <h4>{name}</h4>
                  {panchangamData.length > 0 ? (
                    panchangamData.map((sch, i) => {
                      const dailyTimes = scheduleData[`dailyTimes_${i}`];
                      return (
                        <div key={i} className="schedule-info">
                          <p><strong>Date:</strong> {new Date(sch.date).toLocaleDateString()}</p>
                          <p><strong>Paksha:</strong> {sch.paksha}</p>
                          <p><strong>Tithi:</strong> {sch.tithi}</p>
                          <p><strong>Vaaram:</strong> {sch.vaaram}</p>
                          <p><strong>Lagnam:</strong> {sch.lagnam}</p>
                          <p><strong>Mohurtam:</strong> {sch.mohurtam}</p>
                          <p><strong>Time:</strong> {sch.time}</p>
                          <p><strong>Notes:</strong> {sch.notes}</p>
  
                          {dailyTimes ? (
                            <div className="daily-times">
                              <p><strong>Rahukalam:</strong> {dailyTimes.rahukalam}</p>
                              <p><strong>Yamagandam:</strong> {dailyTimes.yamagandam}</p>
                              <p><strong>Varjam:</strong> {dailyTimes.varjam}</p>
                              <p><strong>Durmohurtam:</strong> {dailyTimes.durmohurtam}</p>
                            </div>
                          ) : (
                            <p className="no-daily-times">No daily times found for this date.</p>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="no-schedule">No schedule available for this Nakshatram.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
  
};

export default Mohurtam;
