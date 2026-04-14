import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import { format, parseISO } from 'date-fns';
import { toast, ToastContainer } from 'react-toastify';
import { 
    FaPlus, FaTrash, FaSearch, FaStar, 
    FaCalendarCheck, FaSun, FaMoon, FaOm, FaRegClock 
} from 'react-icons/fa';
import 'react-calendar/dist/Calendar.css';
import './Mohurtam.css';

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

const Mohurtam = () => {
  const [selectedNakshatrams, setSelectedNakshatrams] = useState(['']);
  const [favorableNakshatrams, setFavorableNakshatrams] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [panchangDate, setPanchangDate] = useState(new Date());
  const [dailyPanchang, setDailyPanchang] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);

  const nakshatramList = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula",
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
  ];

  const formatTime12 = (t) => {
    if (!t) return '--:--';
    const [h, m] = t.split(':');
    const hrs = parseInt(h);
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    return `${hrs % 12 || 12}:${m} ${ampm}`;
  };

  useEffect(() => {
    const ds = format(panchangDate, 'yyyy-MM-dd');
    const fetchPanchang = async () => {
        try {
            const [pRes, sRes] = await Promise.all([
                fetch(`${API_BASE}/api/daily-times/by-date/${ds}`).then(r => r.json()),
                fetch(`${API_BASE}/api/sun?date=${ds}`).then(r => r.json())
            ]);
            setDailyPanchang(pRes);
            setSunTimes(sRes);
        } catch (e) { console.error("Panchang sync error"); }
    };
    fetchPanchang();
  }, [panchangDate]);

  const handleFind = async () => {
    if (selectedNakshatrams.some(n => n === '')) return toast.error("Select all Nakshatrams");
    setIsLoading(true);
    setSubmitted(true);
    try {
      const response = await axios.post(`${API_BASE}/api/muhurtam/find`, { 
        nakshatrams: selectedNakshatrams 
      });
      setResults(response.data.dailyResults || []);
      setFavorableNakshatrams(Array.from(response.data.favorableNakshatrams || []).sort());
    } catch (e) {
      toast.error("Celestial sync failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="moh-v2-viewport">
      <ToastContainer position="bottom-right" theme="colored" />
      
      {/* Top Input Bar */}
      <div className="moh-v2-top-panel">
        <div className="moh-v2-header">
          <FaOm className="moh-om-icon" />
          <div>
            <h1>Muhurtam Command Center</h1>
            <p>Precise Vedic Timing Analysis</p>
          </div>
        </div>
        
        <div className="moh-v2-input-row">
          {selectedNakshatrams.map((val, idx) => (
            <div key={idx} className="moh-v2-input-group">
              <select value={val} onChange={(e) => {
                const u = [...selectedNakshatrams]; u[idx] = e.target.value; setSelectedNakshatrams(u);
              }}>
                <option value="">Select Star...</option>
                {nakshatramList.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              {selectedNakshatrams.length > 1 && (
                <button className="remove-btn" onClick={() => setSelectedNakshatrams(selectedNakshatrams.filter((_, i) => i !== idx))}><FaTrash /></button>
              )}
            </div>
          ))}
          <button className="btn-add" onClick={() => setSelectedNakshatrams([...selectedNakshatrams, ''])}><FaPlus /></button>
          <button className="btn-search" onClick={handleFind} disabled={isLoading}>
            {isLoading ? 'Searching...' : <><FaSearch /> Find Muhurtams</>}
          </button>
        </div>
      </div>

      <div className="moh-v2-grid">
        {/* LEFT COLUMN: TARA BALAM */}
        <aside className="moh-v2-col col-left">
          <div className="moh-v2-sticky-card">
            <h3><FaStar /> Tara Balam</h3>
            <p className="side-label">Compatible stars for members:</p>
            <div className="moh-v2-tags">
              {favorableNakshatrams.length > 0 ? favorableNakshatrams.map(n => (
                <span key={n} className="tara-tag">{n}</span>
              )) : <span className="empty-msg">No Search Performed</span>}
            </div>
          </div>
        </aside>

        {/* CENTER COLUMN: RESULTS */}
        <main className="moh-v2-col col-center">
          <div className="results-list">
            {results.length > 0 ? results.map((res, i) => (
              <div key={i} className={`muhurtam-card-v2 status-${res.status}`}>
                <div className="card-v2-header">
                    <h4>{format(parseISO(res.date), 'EEEE, MMM do')}</h4>
                    <span className={`badge badge-${res.status}`}>{res.status.toUpperCase()}</span>
                </div>
                <div className="card-v2-body">
                    <div className="info-pill"><span>Tithi</span><strong>{res.tithi}</strong></div>
                    <div className="info-pill"><span>Star</span><strong>{res.nakshatram}</strong></div>
                    <div className="info-pill"><span>Lagna</span><strong>{res.muhurtamLagna}</strong></div>
                </div>
                <div className="card-v2-time">
                    <label>{res.status === 'orange' ? 'SUGGESTED TIME' : 'MUHURTAM WINDOW'}</label>
                    <p>{res.status === 'orange' ? res.alternateTime : res.muhurtamTime}</p>
                </div>
                {res.notes && <div className="card-v2-notes">"{res.notes}"</div>}
              </div>
            )) : (
              <div className="center-empty">
                <FaCalendarCheck className="empty-icon" />
                <h3>No Results Yet</h3>
                <p>Input stars and start your search.</p>
              </div>
            )}
          </div>
        </main>

        {/* RIGHT COLUMN: PANCHANGAM */}
        <aside className="moh-v2-col col-right">
          <div className="moh-v2-sticky-card panch-card">
            <h3><FaSun /> Day Panchang</h3>
            <div className="panch-calendar-mini">
                <Calendar onChange={setPanchangDate} value={panchangDate} />
            </div>
            <div className="panch-details-mini">
                <div className="panch-item">
                    <label><FaSun /> Sunrise</label>
                    <strong>{formatTime12(sunTimes?.sunrise)}</strong>
                </div>
                <div className="panch-item">
                    <label><FaMoon /> Sunset</label>
                    <strong>{formatTime12(sunTimes?.sunset)}</strong>
                </div>
                <div className="panch-item inauspicious">
                    <label><FaRegClock /> Rahu Kalam</label>
                    <p>{dailyPanchang ? `${formatTime12(dailyPanchang.rahukalamStart)} - ${formatTime12(dailyPanchang.rahukalamEnd)}` : '--:--'}</p>
                </div>
                <div className="panch-item inauspicious">
                    <label><FaRegClock /> Yamagandam</label>
                    <p>{dailyPanchang ? `${formatTime12(dailyPanchang.yamagandamStart)} - ${formatTime12(dailyPanchang.yamagandamEnd)}` : '--:--'}</p>
                </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Mohurtam;