import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parse,
  isBefore,
  startOfDay,
  parseISO,
} from "date-fns";
import {
  FaChevronLeft,
  FaChevronRight,
  FaRegClock,
  FaArrowLeft,
  FaExclamationTriangle,
} from "react-icons/fa";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "./AvailabilityManager.css";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

// --- Helper Functions ---
const generateTimeSlots = () => {
  const slots = {};
  for (let i = 3; i <= 23; i++) {
    const time = `${String(i).padStart(2, "0")}:00`;
    slots[time] = "Available";
  }
  return slots;
};
const allPossibleSlots = Object.keys(generateTimeSlots());

// --- Solid Confirmation Modal ---
const ConfirmationModal = ({ onConfirm, onCancel, message }) => (
  <div className="am-modal-backdrop">
    <div className="am-modal-content warning-state">
      <div className="am-modal-icon-warn">
        <FaExclamationTriangle />
      </div>
      <h3 className="am-modal-title">Confirm Availability Override</h3>
      <p className="am-modal-message">{message}</p>
      <div className="am-modal-footer">
        <button className="am-modal-btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="am-modal-btn-primary danger-action"
          onClick={onConfirm}
        >
          Yes, Make Available
        </button>
      </div>
    </div>
  </div>
);

const AvailabilityManager = ({ activeView }) => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isShaking, setIsShaking] = useState(false);

  // REF for Auto-Scroll
  const timeSlotsRef = useRef(null);

  const refreshAvailability = async () => {
    const priestId = localStorage.getItem("userId");
    if (!priestId) return;

    setIsLoading(true);
    try {
      const [bookingRes, manualRes, availabilityRes] = await Promise.all([
        axios.get(`${API_BASE}/api/booking/priest/${priestId}`),
        axios.get(`${API_BASE}/api/appointments/priest/${priestId}`),
        axios.get(`${API_BASE}/api/availability/${priestId}`),
      ]);

      const newMap = {};
      (availabilityRes.data || []).forEach((slot) => {
        const dateStr = format(parseISO(slot.slotDate), "yyyy-MM-dd");
        const timeStr = slot.slotTime.substring(0, 5);
        if (!newMap[dateStr]) newMap[dateStr] = generateTimeSlots();
        newMap[dateStr][timeStr] = "Unavailable";
      });

      (bookingRes.data || []).forEach((b) => {
        if (
          (b.status?.toUpperCase() === "ACCEPTED" ||
            b.status?.toUpperCase() === "CONFIRMED") &&
          b.date
        ) {
          if (!newMap[b.date]) newMap[b.date] = generateTimeSlots();
          newMap[b.date][b.start] = "Booked";
        }
      });

      (manualRes.data || []).forEach((a) => {
        if (a.start) {
          const dt = parseISO(a.start);
          const dStr = format(dt, "yyyy-MM-dd");
          const tStr = format(dt, "HH:mm");
          if (!newMap[dStr]) newMap[dStr] = generateTimeSlots();
          newMap[dStr][tStr] = "Booked";
        }
      });
      setAvailability(newMap);
    } catch (error) {
      toast.error("Failed to sync data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAvailability();
  }, []);

  // --- Sub-components ---
  const CalendarHeader = () => (
    <div className="am-calendar-header">
      <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
        <FaChevronLeft />
      </button>
      <span>{format(currentDate, "MMMM yyyy")}</span>
      <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
        <FaChevronRight />
      </button>
    </div>
  );

  const CalendarGrid = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const today = startOfDay(new Date());

    const handleDateClick = (day) => {
      const isPast = isBefore(day, today);
      if (isPast) return;

      if (!isSameMonth(day, monthStart)) {
        setCurrentDate(startOfMonth(day));
      }
      setSelectedDate(day);

      // AUTO SCROLL LOGIC
      if (timeSlotsRef.current) {
        timeSlotsRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    };

    return (
      <div className="am-calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div className="am-day-name" key={d}>
            {d}
          </div>
        ))}
        {days.map((day) => {
          const isPast = isBefore(day, today);
          const isOtherMonth = !isSameMonth(day, monthStart);
          const isSel = isSameDay(day, selectedDate);
          return (
            <div
              key={day.toString()}
              className={`am-day-cell 
                                ${isOtherMonth ? "other-month" : ""} 
                                ${isSameDay(day, today) ? "today" : ""} 
                                ${isSel ? "selected" : ""} 
                                ${isPast ? "past-day" : ""}`}
              onClick={() => handleDateClick(day)}
            >
              <span>{format(day, "d")}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const DayTimeSlots = ({ onSave }) => {
    const [draftSlots, setDraftSlots] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [template, setTemplate] = useState({
      start: "09:00",
      end: "17:00",
      breaks: ["12:00"],
    });
    const [overrideSlot, setOverrideSlot] = useState(null);

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const originalSlots = availability[dateStr] || generateTimeSlots();
    const isPast = isBefore(selectedDate, startOfDay(new Date()));

    useEffect(() => {
      setDraftSlots(null);
    }, [selectedDate]);

    const handleSlotClick = (time, status) => {
      if (isPast) return;
      if (status === "Booked") {
        setOverrideSlot(time);
        return;
      }
      const current = draftSlots || { ...originalSlots };
      const nextStatus =
        current[time] === "Available" ? "Unavailable" : "Available";
      setDraftSlots({ ...current, [time]: nextStatus });
    };

    const handleSaveChanges = async () => {
      if (!draftSlots) return;
      const priestId = localStorage.getItem("userId");
      const unavailable = Object.entries(draftSlots)
        .filter(([, s]) => s === "Unavailable")
        .map(([t]) => t);

      try {
        await axios.post(`${API_BASE}/api/availability`, {
          priestId,
          date: dateStr,
          unavailableSlots: unavailable,
        });
        toast.success("Schedule Updated!");
        setDraftSlots(null);
        onSave();
      } catch (e) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        toast.error("Update Failed.");
      }
    };

    const applyTemplate = () => {
      let newSlots = { ...originalSlots };
      const sH = parseInt(template.start.split(":")[0]);
      const eH = parseInt(template.end.split(":")[0]);
      Object.keys(newSlots).forEach((t) => {
        const h = parseInt(t.split(":")[0]);
        if (newSlots[t] !== "Booked") {
          newSlots[t] =
            h >= sH && h <= eH && !template.breaks.includes(t)
              ? "Available"
              : "Unavailable";
        }
      });
      setDraftSlots(newSlots);
      setShowSettings(false);
    };

    const slots = draftSlots || originalSlots;

    return (
      <div
        ref={timeSlotsRef}
        className={`am-timeslot-panel ${isShaking ? "error-shaking" : ""}`}
      >
        {overrideSlot && (
          <ConfirmationModal
            message="This slot has a confirmed booking. Overriding will mark it as available for others."
            onConfirm={() => {
              setDraftSlots({
                ...(draftSlots || originalSlots),
                [overrideSlot]: "Available",
              });
              setOverrideSlot(null);
            }}
            onCancel={() => setOverrideSlot(null)}
          />
        )}

        <button
          className="am-edit-template-btn"
          onClick={() => setShowSettings(!showSettings)}
        >
          <FaRegClock /> {showSettings ? "Close Settings" : "Workday Settings"}
        </button>

        {showSettings && (
          <div className="template-settings">
            <div className="time-select-group">
              <label>Start of Day</label>
              <select
                value={template.start}
                onChange={(e) =>
                  setTemplate({ ...template, start: e.target.value })
                }
              >
                {allPossibleSlots.map((t) => (
                  <option key={t} value={t}>
                    {format(parse(t, "HH:mm", new Date()), "h:mm a")}
                  </option>
                ))}
              </select>
            </div>
            <div className="time-select-group">
              <label>End of Day</label>
              <select
                value={template.end}
                onChange={(e) =>
                  setTemplate({ ...template, end: e.target.value })
                }
              >
                {allPossibleSlots.map((t) => (
                  <option key={t} value={t}>
                    {format(parse(t, "HH:mm", new Date()), "h:mm a")}
                  </option>
                ))}
              </select>
            </div>
            <div className="break-settings">
              <label>Breaks / Lunch</label>
              <div className="break-slots-grid">
                {allPossibleSlots
                  .filter((t) => {
                    const h = parseInt(t.split(":")[0]);
                    return (
                      h >= parseInt(template.start.split(":")[0]) &&
                      h <= parseInt(template.end.split(":")[0])
                    );
                  })
                  .map((t) => (
                    <button
                      key={t}
                      className={`break-slot-btn ${template.breaks.includes(t) ? "is-break" : ""}`}
                      onClick={() =>
                        setTemplate({
                          ...template,
                          breaks: template.breaks.includes(t)
                            ? template.breaks.filter((b) => b !== t)
                            : [...template.breaks, t],
                        })
                      }
                    >
                      {format(parse(t, "HH:mm", new Date()), "ha")}
                    </button>
                  ))}
              </div>
            </div>
            <button className="am-apply-template-btn" onClick={applyTemplate}>
              Apply Template
            </button>
          </div>
        )}

        <div className="am-panel-header-info">
          <h3 className="am-panel-subtitle">Availability for</h3>
          <h2 className="am-panel-title-date">
            {format(selectedDate, "EEEE, MMM d")}
          </h2>
        </div>

        {isPast && (
          <div className="am-past-day-notice">
            Past dates cannot be modified.
          </div>
        )}

        {draftSlots && (
          <div className="am-save-actions">
            <span>Unsaved Changes</span>
            <div className="am-action-btns">
              <button
                className="am-cancel-btn"
                onClick={() => setDraftSlots(null)}
              >
                Discard
              </button>
              <button className="am-save-btn" onClick={handleSaveChanges}>
                Save Changes
              </button>
            </div>
          </div>
        )}

        <div className="am-timeslot-grid">
          {Object.entries(slots).map(([time, status]) => (
            <button
              key={time}
              className={`am-slot-btn status-${status.toLowerCase()}`}
              onClick={() => handleSlotClick(time, status)}
              disabled={isPast}
            >
              {format(parse(time, "HH:mm", new Date()), "h:mm a")}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading && Object.keys(availability).length === 0)
    return <div className="loading-container">Syncing Divine Calendar...</div>;

  return (
    <div
      className={
        activeView === "availability"
          ? "am-dashboard-widget"
          : "availability-page-container"
      }
    >
      <ToastContainer position="bottom-right" theme="colored" />

      {activeView !== "availability" && (
        <>
          <div className="availability-page-header">
            <h1 className="availability-page-title">Manage Availability</h1>
            <button
              className="am-back-to-dashboard-btn"
              onClick={() => navigate("/dashboard")}
            >
              <FaArrowLeft /> Dashboard
            </button>
          </div>
          <p className="availability-page-description">
            Click slots to toggle Availability. Use "Workday Settings" to apply
            a standard schedule to specific days.
          </p>
        </>
      )}

      <div className="availability-manager-component">
        <div className="am-calendar-view">
          <CalendarHeader />
          <CalendarGrid />
        </div>
        <DayTimeSlots onSave={refreshAvailability} />
      </div>
    </div>
  );
};

export default AvailabilityManager;
