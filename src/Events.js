import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaPrayingHands,
  FaUtensils,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaSun,
  FaMoon,
  FaOm,
  FaClock,
  FaDharmachakra,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";
import { format } from "date-fns";
import DashboardEventsDisplay from "./DashboardEventsDisplay";
import "./CustomerDashboard.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const formatTime12Hour = (timeString) => {
  if (!timeString || typeof timeString !== "string") return null;
  const [hours, minutes] = timeString.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, "0")}:${minutes} ${ampm}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [userName, setFirstName] = useState("Devotee");
  const [carouselImages, setCarouselImages] = useState([]);
  const [todayTimings, setTodayTimings] = useState(null);
  const [isTimingsLoading, setIsTimingsLoading] = useState(true);

  const nextImage = () =>
    carouselImages.length > 0 &&
    setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
  const prevImage = () =>
    carouselImages.length > 0 &&
    setCurrentImageIndex(
      (prev) => (prev - 1 + carouselImages.length) % carouselImages.length,
    );

  useEffect(() => {
    setFirstName(localStorage.getItem("firstName") || "Devotee");
    const todayStr = new Date().toISOString().split("T")[0];

    // --- NEW: RETRIEVE LOCATION DATA FROM LOCALSTORAGE ---
    const lat = localStorage.getItem("userLat") || "32.7767";
    const lon = localStorage.getItem("userLon") || "-96.7970";
    const tz = localStorage.getItem("userTimeZone") || "America/Chicago";

    // --- UPDATED: FETCH PANCHANG WITH DYNAMIC PARAMS ---
    const fetchPanchang = async () => {
      try {
        const [sunRes, dailyRes] = await Promise.all([
          fetch(
            `${buildApiUrl(API_ENDPOINTS.PANCHANG.SUN_TIMES)}?date=${todayStr}&lat=${lat}&lon=${lon}&tz=${tz}`,
          ).then((res) => res.json()),
          fetch(
            `${buildApiUrl(API_ENDPOINTS.PANCHANG.DAILY_TIMES)}?date=${todayStr}&lat=${lat}&lon=${lon}&tz=${tz}`,
          ).then((res) => res.json()),
        ]);
        setTodayTimings({ ...sunRes, ...dailyRes });
        setIsTimingsLoading(false);
      } catch (error) {
        console.error("Dashboard timing sync error:", error);
        setIsTimingsLoading(false);
      }
    };

    fetchPanchang();

    fetch(buildApiUrl(API_ENDPOINTS.GALLERY.GET_ALL_RANDOM))
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((img) => ({
          imageUrl: `${buildApiUrl(img.imageUrl)}`,
          title: img.caption,
        }));
        setCarouselImages(
          normalized.length > 0
            ? normalized
            : [
                {
                  imageUrl:
                    "https://images.unsplash.com/photo-1604318721473-cb7223b37803?q=80&w=2070",
                  title: "Sacred Tradition",
                },
              ],
        );
      });
  }, []);

  return (
    <div className="db-page-wrapper">
      <section className="db-hero">
        <div className="db-hero-content">
          <h1>Namaste, {userName}</h1>
          <p>
            Your gateway to traditional Vedic services and auspicious timings.
          </p>
        </div>
      </section>

      <div className="db-main-container">
        <div className="db-grid-layout">
          {/* LEFT COLUMN: EVENTS */}
          <aside className="db-column">
            <div className="db-content-card">
              <div className="db-card-head">
                <FaDharmachakra /> <h2>Events</h2>
              </div>
              <DashboardEventsDisplay isLoading={false} />
            </div>
          </aside>

          {/* CENTER COLUMN: DESIGNED 180x180 TILES */}
          <main className="db-column">
            <div className="db-tile-row">
              <div
                className="db-tile db-saffron"
                onClick={() => navigate("/book-priest")}
              >
                <FaUserTie className="db-tile-icon" />
                <h3>Book a Priest</h3>
                <p>Qualified scholars for home pooja and ceremonies.</p>
                <FaArrowRight className="db-tile-go" />
              </div>

              <div
                className="db-tile db-gold"
                onClick={() => navigate("/pooja-items")}
              >
                <FaPrayingHands className="db-tile-icon" />
                <h3>Pooja Guide</h3>
                <p>Explore ritual items, samagri and significance.</p>
                <FaArrowRight className="db-tile-go" />
              </div>

              <div
                className="db-tile db-charcoal"
                onClick={() => navigate("/prasadam")}
              >
                <FaUtensils className="db-tile-icon" />
                <h3>Blessed Food</h3>
                <p>Authentic temple prasadam delivered to you.</p>
                <FaArrowRight className="db-tile-go" />
              </div>
            </div>

            <div className="db-promo-card">
              <img
                src={carouselImages[currentImageIndex]?.imageUrl}
                alt="Sacred"
              />
              <div className="db-promo-overlay">
                <h4>Sacred Tradition</h4>
                <div className="db-promo-nav">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevImage();
                    }}
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextImage();
                    }}
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* RIGHT COLUMN: PANCHANG */}
          <aside className="db-column">
            <div className="db-panchang-card">
              <div className="db-p-header">
                <h3>Panchang Today</h3>
                <span>{format(new Date(), "EEEE, MMM do")}</span>
              </div>

              <div className="db-p-body">
                <div className="db-sun-row">
                  <div className="db-p-unit">
                    <label>SUNRISE</label>
                    <strong>
                      {formatTime12Hour(todayTimings?.sunrise) || "---"}
                    </strong>
                  </div>
                  <div className="db-p-unit">
                    <label>SUNSET</label>
                    <strong>
                      {formatTime12Hour(todayTimings?.sunset) || "---"}
                    </strong>
                  </div>
                </div>

                <div className="db-astro-row">
                  <div className="db-astro-item">
                    <label>
                      <FaStar /> NAKSHATRAM
                    </label>
                    <p>{todayTimings?.nakshatram || "---"}</p>
                  </div>
                  <div className="db-astro-item">
                    <label>
                      <FaOm /> TITHI
                    </label>
                    <p>{todayTimings?.tithi || "---"}</p>
                  </div>
                </div>

                <div className="db-kalam-box">
                  <div className="db-k-row">
                    <label>RAHU KALAM</label>
                    <p>
                      {todayTimings?.rahukalamStart
                        ? `${formatTime12Hour(todayTimings.rahukalamStart)} - ${formatTime12Hour(todayTimings.rahukalamEnd)}`
                        : "--- : ---"}
                    </p>
                  </div>
                  <div className="db-k-row">
                    <label>YAMAGANDAM</label>
                    <p>
                      {todayTimings?.yamagandamStart
                        ? `${formatTime12Hour(todayTimings.yamagandamStart)} - ${formatTime12Hour(todayTimings.yamagandamEnd)}`
                        : "--- : ---"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
