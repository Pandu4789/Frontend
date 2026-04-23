import React, { useState, useEffect } from "react";
import axios from "axios";
import Calendar from "react-calendar";
import { format, parseISO, getMonth, getYear } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import {
  FaPlus,
  FaTrash,
  FaStar,
  FaCalendarCheck,
  FaSun,
  FaMoon,
  FaOm,
  FaRegClock,
  FaHandsHelping,
  FaRegCalendarCheck,
} from "react-icons/fa";
import "react-calendar/dist/Calendar.css";
import "./Mohurtam.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

const Mohurtam = () => {
  const [selectedNakshatrams, setSelectedNakshatrams] = useState([""]);
  const [favorableNakshatrams, setFavorableNakshatrams] = useState([]);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Panchangam & Sidebar Data
  const [panchangDate, setPanchangDate] = useState(new Date());
  const [dailyPanchang, setDailyPanchang] = useState(null);
  const [sunTimes, setSunTimes] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [festivals, setFestivals] = useState([]);

  const priestId = localStorage.getItem("userId");

  const nakshatramList = [
    "Ashwini",
    "Bharani",
    "Krittika",
    "Rohini",
    "Mrigashira",
    "Ardra",
    "Punarvasu",
    "Pushya",
    "Ashlesha",
    "Magha",
    "Purva Phalguni",
    "Uttara Phalguni",
    "Hasta",
    "Chitra",
    "Swati",
    "Vishakha",
    "Anuradha",
    "Jyeshtha",
    "Mula",
    "Purva Ashadha",
    "Uttara Ashadha",
    "Shravana",
    "Dhanishta",
    "Shatabhisha",
    "Purva Bhadrapada",
    "Uttara Bhadrapada",
    "Revati",
  ];

  // Fetch Rituals & Festivals for the Sidebar
  useEffect(() => {
    if (!priestId) return;
    const year = getYear(panchangDate);
    const month = getMonth(panchangDate) + 1;

    const fetchSidebarData = async () => {
      try {
        const [bookingRes, apptRes, festRes] = await Promise.all([
          axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
          axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
          axios.get(
            `${API_BASE}/api/festivals/month?year=${year}&month=${month}`,
          ),
        ]);

        const combinedAppts = [
          ...(bookingRes.data || []).map((b) => ({
            ...b,
            type: "Ritual",
            date: b.date,
          })),
          ...(apptRes.data || []).map((a) => ({
            ...a,
            type: "Manual",
            date: a.start,
          })),
        ];

        setAppointments(combinedAppts);
        setFestivals(festRes.data || []);
      } catch (e) {
        console.error("Sidebar sync error");
      }
    };
    fetchSidebarData();
  }, [priestId, panchangDate]);

  // --- UPDATED: FETCH DAY PANCHANG WITH DYNAMIC LOCATION ---
  useEffect(() => {
    const ds = format(panchangDate, "yyyy-MM-dd");

    // Retrieve location data stored during login
    const lat = localStorage.getItem("userLat") || "32.7767";
    const lon = localStorage.getItem("userLon") || "-96.7970";
    const tz = localStorage.getItem("userTimeZone") || "America/Chicago";

    const fetchDayData = async () => {
      try {
        // We use the /calculate endpoint for daily-times to get on-the-fly Lagna/Rahu results
        const [pRes, sRes] = await Promise.all([
          fetch(
            `${API_BASE}/api/daily-times/calculate?date=${ds}&lat=${lat}&lon=${lon}&tz=${tz}`,
          ).then((r) => r.json()),
          fetch(
            `${API_BASE}/api/sun?date=${ds}&lat=${lat}&lon=${lon}&tz=${tz}`,
          ).then((r) => r.json()),
        ]);
        setDailyPanchang(pRes);
        setSunTimes(sRes);
      } catch (e) {
        console.error("Panchang sync error", e);
      }
    };
    fetchDayData();
  }, [panchangDate]);

  const handleFind = async () => {
    if (selectedNakshatrams.some((n) => n === ""))
      return toast.error("Select all Nakshatrams");
    setIsLoading(true);

    const lat = localStorage.getItem("userLat") || "32.7767";
    const lon = localStorage.getItem("userLon") || "-96.7970";
    const tz = localStorage.getItem("userTimeZone") || "America/Chicago";

    try {
      const response = await axios.post(`${API_BASE}/api/muhurtam/find`, {
        nakshatrams: selectedNakshatrams,
        lat: lat,
        lon: lon,
        tz: tz,
      });
      setResults(response.data.dailyResults || []);
      setFavorableNakshatrams(
        Array.from(response.data.favorableNakshatrams || []).sort(),
      );
    } catch (e) {
      toast.error("Calculation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime12 = (t) => {
    if (!t) return "--:--";
    const [h, m] = t.split(":");
    const hrs = parseInt(h);
    return `${hrs % 12 || 12}:${m} ${hrs >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="moh-v2-viewport">
      <ToastContainer position="bottom-right" theme="colored" />

      <div className="moh-v2-top-panel">
        <div className="moh-v2-header">
          <FaOm className="moh-om-icon" />
          <div>
            <h1>Muhurtam Command Center</h1>
            <p>Integrated Astrology & Schedule Analysis</p>
          </div>
        </div>

        <div className="moh-v2-input-row">
          {selectedNakshatrams.map((val, idx) => (
            <div key={idx} className="moh-v2-input-group">
              <select
                value={val}
                onChange={(e) => {
                  const u = [...selectedNakshatrams];
                  u[idx] = e.target.value;
                  setSelectedNakshatrams(u);
                }}
              >
                <option value="">Select Star...</option>
                {nakshatramList.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {selectedNakshatrams.length > 1 && (
                <button
                  className="remove-btn"
                  onClick={() =>
                    setSelectedNakshatrams(
                      selectedNakshatrams.filter((_, i) => i !== idx),
                    )
                  }
                >
                  <FaTrash />
                </button>
              )}
            </div>
          ))}
          <button
            className="btn-add"
            onClick={() => setSelectedNakshatrams([...selectedNakshatrams, ""])}
          >
            <FaPlus />
          </button>
          <button
            className="btn-search"
            onClick={handleFind}
            disabled={isLoading}
          >
            {isLoading ? "Syncing..." : "Find Muhurtams"}
          </button>
        </div>
      </div>

      <div className="moh-v2-grid">
        <aside className="moh-v2-col col-left">
          <div className="moh-v2-sticky-card tara-balam-section">
            <h3>
              <FaStar /> Tara Balam
            </h3>
            <div className="moh-v2-tags">
              {favorableNakshatrams.length > 0 ? (
                favorableNakshatrams.map((n) => (
                  <span key={n} className="tara-tag">
                    {n}
                  </span>
                ))
              ) : (
                <span className="empty-msg">No search results.</span>
              )}
            </div>
          </div>

          <div className="moh-v2-sticky-card side-list-section">
            <h3>
              <FaHandsHelping /> My Rituals
            </h3>
            <div className="mini-scroll-list">
              {appointments.filter(
                (a) =>
                  format(parseISO(a.date.split("T")[0]), "yyyy-MM-dd") ===
                  format(panchangDate, "yyyy-MM-dd"),
              ).length > 0 ? (
                appointments
                  .filter(
                    (a) =>
                      format(parseISO(a.date.split("T")[0]), "yyyy-MM-dd") ===
                      format(panchangDate, "yyyy-MM-dd"),
                  )
                  .map((a, i) => (
                    <div key={i} className="mini-item ritual">
                      <strong>{a.eventName || "Sacred Ritual"}</strong>
                      <span>with {a.name}</span>
                    </div>
                  ))
              ) : (
                <div className="empty-msg">Clear schedule for this day.</div>
              )}
            </div>
          </div>

          <div className="moh-v2-sticky-card side-list-section">
            <h3>
              <FaRegCalendarCheck /> {format(panchangDate, "MMMM")} Festivals
            </h3>
            <div className="mini-scroll-list">
              {festivals.length > 0 ? (
                festivals.map((f, i) => (
                  <div key={i} className="mini-item fest">
                    <span className="fest-date">
                      {format(parseISO(f.date), "dd")}
                    </span>
                    <strong>{f.name}</strong>
                  </div>
                ))
              ) : (
                <div className="empty-msg">No festivals this month.</div>
              )}
            </div>
          </div>
        </aside>

        <main className="moh-v2-col col-center">
          <div className="center-scroll-wrapper">
            <div className="results-list">
              {results.length > 0 ? (
                results.map((res, i) => (
                  <div
                    key={i}
                    className={`muhurtam-card-v2 status-${res.status}`}
                  >
                    <div className="card-v2-header">
                      <h4>{format(parseISO(res.date), "EEEE, MMMM do")}</h4>
                      <span className={`badge badge-${res.status}`}>
                        {res.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="card-v2-body">
                      <div className="info-pill">
                        <span>Tithi</span>
                        <strong>{res.tithi}</strong>
                      </div>
                      <div className="info-pill">
                        <span>Star</span>
                        <strong>{res.nakshatram}</strong>
                      </div>
                      <div className="info-pill">
                        <span>Lagna</span>
                        <strong>{res.muhurtamLagna}</strong>
                      </div>
                    </div>
                    <div className="card-v2-time">
                      <label>
                        {res.status === "orange"
                          ? "SUGGESTED TIME"
                          : "MUHURTAM WINDOW"}
                      </label>
                      <p>
                        {res.status === "orange"
                          ? res.alternateTime
                          : res.muhurtamTime}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="center-empty">
                  <FaCalendarCheck className="empty-icon" />
                  <h3>No Search Results</h3>
                  <p>Enter members' birth stars above to begin analysis.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="moh-v2-col col-right">
          <div className="moh-v2-sticky-card panch-card">
            <h3>
              <FaSun /> Day Panchang
            </h3>
            <div className="panch-calendar-mini">
              <Calendar onChange={setPanchangDate} value={panchangDate} />
            </div>
            <div className="panch-details-mini">
              <div className="panch-item">
                <label>
                  <FaSun /> Sunrise
                </label>
                <strong>{formatTime12(sunTimes?.sunrise)}</strong>
              </div>
              <div className="panch-item">
                <label>
                  <FaMoon /> Sunset
                </label>
                <strong>{formatTime12(sunTimes?.sunset)}</strong>
              </div>
              <div className="panch-item inauspicious">
                <label>
                  <FaRegClock /> Rahu Kalam
                </label>
                <p>
                  {dailyPanchang
                    ? `${formatTime12(dailyPanchang.rahukalamStart)} - ${formatTime12(dailyPanchang.rahukalamEnd)}`
                    : "--:--"}
                </p>
              </div>
              <div className="panch-item inauspicious">
                <label>
                  <FaRegClock /> Yamagandam
                </label>
                <p>
                  {dailyPanchang
                    ? `${formatTime12(dailyPanchang.yamagandamStart)} - ${formatTime12(dailyPanchang.yamagandamEnd)}`
                    : "--:--"}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Mohurtam;
