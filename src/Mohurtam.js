import React, { useState, useEffect } from "react";
import "./Mohurtam.css"; // Import your CSS file for styling

const Mohurtam = () => {
    const [selectedValues, setSelectedValues] = useState([""]);
    const [displayValues, setDisplayValues] = useState([]);
    const [nakshatramData, setNakshatramData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false); // Track if "Find" button has been clicked

    const [options, setOptions] = useState([]);

    useEffect(() => {
        fetch("http://localhost:8080/api/nakshatram")
            .then(res => res.json())
            .then(data => {
                console.log("Fetched data from backend:", data); // ✅ Confirm the response
                setNakshatramData(data);
                const names = data.map(n => n.name);
                setOptions(names);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load Nakshatrams", err);
                setIsLoading(false);
            });
    }, []);
    

    const handleChange = (event, index) => {
        const newSelectedValues = [...selectedValues];
        newSelectedValues[index] = event.target.value;
        setSelectedValues(newSelectedValues);
    };

    const handleSubmit = () => {
        setSubmitted(true); // Set the submitted state to true when Find is clicked
        
        const allNextValues = selectedValues.map(selectedValue => {
            const indexInOptions = options.indexOf(selectedValue);
            if (indexInOptions === -1) return [];

            return [
                options[(indexInOptions + 1) % options.length],
                options[(indexInOptions + 3) % options.length],
                options[(indexInOptions + 5) % options.length],
                options[(indexInOptions + 7) % options.length],
                options[(indexInOptions + 8) % options.length],
                options[(indexInOptions + 10) % options.length],
                options[(indexInOptions + 12) % options.length],
                options[(indexInOptions + 14) % options.length],
                options[(indexInOptions + 16) % options.length],
                options[(indexInOptions + 17) % options.length],
                options[(indexInOptions + 19) % options.length],
                options[(indexInOptions + 21) % options.length],
                options[(indexInOptions + 23) % options.length],
                options[(indexInOptions + 25) % options.length],
                options[(indexInOptions + 26) % options.length]
            ];
        });

        const commonValues = allNextValues.reduce((acc, currentValues) =>
            acc.length === 0 ? currentValues : acc.filter(value => currentValues.includes(value)),
            []);

        console.log("Common values:", commonValues);
        setDisplayValues(commonValues);
    };

    const getSchedules = (nakshatramName) => {
        const nakshatram = nakshatramData.find(item => item.name === nakshatramName);
        return nakshatram ? nakshatram.schedules : [];
    };

    const addDropdown = () => {
        setSelectedValues(prev => [...prev, ""]);
    };

    const removeDropdown = () => {
        if (selectedValues.length > 1) {
            setSelectedValues(prev => prev.slice(0, prev.length - 1));
        }
    };

    if (isLoading) {
        return <div>Loading Nakshatram data...</div>;
    }

    return (
        <div className="mohurtam-container">
          {selectedValues.map((selectedValue, index) => (
            <div key={index} className="dropdown-group">
              <select
                value={selectedValue}
                onChange={(e) => handleChange(e, index)}
                className="dropdown"
              >
                <option value="">-- Choose Nakshatram --</option>
                {options.map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
      
              {index === selectedValues.length - 1 && (
                <div className="dropdown-actions">
                  <span className="action-btn" onClick={addDropdown}>
                    +
                  </span>
                  {selectedValues.length > 1 && (
                    <span className="action-btn" onClick={removeDropdown}>
                      -
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
      
          <button
            onClick={handleSubmit}
            disabled={selectedValues.includes("")}
            className="find-btn"
          >
            Find
          </button>
      
          {submitted && displayValues.length === 0 && selectedValues.some(val => val !== "") && (
            <div className="no-match">
              <p>No Match for the selected Nakshatrams.</p>
            </div>
          )}
      
          {displayValues.length > 0 && (
            <div className="results-section">
              <h3>Available Mohurtams:</h3>
              <div className="results-grid">
                {displayValues.map((value, index) => {
                  const schedules = getSchedules(value);
                  return (
                    <div key={index} className="result-card">
                      <h4>{value}</h4>
                      {schedules.length > 0 ? (
                        schedules.map((schedule, scheduleIndex) => (
                          <div key={scheduleIndex} className="schedule-info">
                            <p><strong>Date:</strong> {new Date(schedule.date).toLocaleDateString()}</p>
                            <p><strong>Time:</strong> {schedule.time}</p>
                          </div>
                        ))
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
