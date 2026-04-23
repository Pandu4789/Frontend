import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { format, parseISO } from "date-fns";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaImage,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaSpinner,
} from "react-icons/fa";
import "./ManageEventsPage.css";
import "react-toastify/dist/ReactToastify.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const initialFormState = {
  id: null,
  title: "",
  date: "",
  eventTime: "",
  location: "",
  description: "",
  imageUrl: "",
};

// ✅ 1. ADDED: New reusable component for truncating text.
const TruncatedDescription = ({ text, maxLength = 100 }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text || text.length <= maxLength) {
    return <p className="event-card-description">{text}</p>;
  }

  const toggleIsExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <p className="event-card-description">
        {isExpanded ? text : `${text.substring(0, maxLength)}...`}
      </p>
      <button onClick={toggleIsExpanded} className="show-more-btn">
        {isExpanded ? "Show Less" : "Show More"}
      </button>
    </div>
  );
};

const ManageEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const [view, setView] = useState("upcoming");
  const priestId = localStorage.getItem("userId");

  const fetchEvents = async () => {
    if (!priestId) {
      setIsLoading(false);
      toast.warn("You must be logged in as a priest to manage events.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(
        buildApiUrl(API_ENDPOINTS.DASHBOARD.GET_PRIEST_EVENTS(priestId)),
      );
      setEvents(response.data || []);
    } catch (error) {
      toast.error("Failed to fetch your events.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [priestId]);

  const handleInputChange = (e) =>
    setCurrentEvent((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setIsFormVisible(false);
    setIsEditing(false);
    setCurrentEvent(initialFormState);
    setImageFile(null);
    setImagePreview("");
  };

  const handleAddNewClick = () => {
    if (!priestId) {
      toast.error("Please log in to add events.");
      return;
    }
    resetForm();
    setIsFormVisible(true);
  };

  const handleEditClick = (event) => {
    setIsEditing(true);
    const eventData = {
      ...event,
      date: format(parseISO(event.date), "yyyy-MM-dd"),
    };
    setCurrentEvent(eventData);
    setImagePreview(event.imageUrl || "");
    setImageFile(null);
    setIsFormVisible(true);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(
          buildApiUrl(API_ENDPOINTS.DASHBOARD.DELETE_EVENT(eventId)),
        );
        toast.success("Event deleted!");
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
      } catch (error) {
        toast.error("Failed to delete event.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let payload = { ...currentEvent, priestId: parseInt(priestId) };
    if (imageFile) {
      payload.imageUrl =
        "https://via.placeholder.com/400x200/FDF5E6/B74F2F?text=Event+Image";
    }

    try {
      const endpoint = isEditing
        ? buildApiUrl(API_ENDPOINTS.DASHBOARD.UPDATE_EVENT(currentEvent.id))
        : buildApiUrl(API_ENDPOINTS.DASHBOARD.CREATE_EVENT);
      const method = isEditing ? "put" : "post";
      await axios[method](endpoint, payload);
      toast.success(
        `Event "${currentEvent.title}" ${isEditing ? "updated" : "created"}!`,
      );

      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error("Failed to save event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingEvents = events
    .filter((event) => new Date(event.date) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const pastEvents = events
    .filter((event) => new Date(event.date) < today)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const displayedEvents = view === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="manage-events-page">
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="colored"
      />
      <div className="em-page-header">
        <h1 className="em-page-title">Manage Your Events</h1>
        {!isFormVisible && (
          <button
            className="em-add-btn"
            onClick={handleAddNewClick}
            disabled={!priestId}
          >
            <FaPlus /> Announce New Event
          </button>
        )}
      </div>

      {isFormVisible && (
        <div className="em-form-card">
          <h2>{isEditing ? "Edit Event" : "Announce New Event"}</h2>
          <form onSubmit={handleSubmit} className="em-form">
            <div className="form-row">
              <div className="form-fields">
                <input
                  className="form-input"
                  type="text"
                  name="title"
                  placeholder="Event Title"
                  value={currentEvent.title}
                  onChange={handleInputChange}
                  required
                />
                <div className="em-form .form-grid-half">
                  <input
                    className="form-input"
                    type="date"
                    name="date"
                    value={currentEvent.date}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    className="form-input"
                    type="time"
                    name="eventTime"
                    value={currentEvent.eventTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <input
                  className="form-input"
                  type="text"
                  name="location"
                  placeholder="Location (e.g., Main Prayer Hall)"
                  value={currentEvent.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="image-uploader">
                <div
                  className="image-preview"
                  onClick={() => fileInputRef.current.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Event Preview" />
                  ) : (
                    <div className="image-placeholder">
                      <FaImage />
                      <p>Click to upload image</p>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>
            </div>
            <textarea
              className="form-input"
              name="description"
              placeholder="Brief description of the event..."
              value={currentEvent.description}
              onChange={handleInputChange}
              required
              rows="4"
            />
            <div className="em-form-actions">
              <button
                type="button"
                className="em-cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="em-save-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <FaSpinner className="spinner" />
                ) : isEditing ? (
                  "Update Event"
                ) : (
                  "Announce Event"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="em-view-toggle">
        <button
          className={`toggle-btn ${view === "upcoming" ? "active" : ""}`}
          onClick={() => setView("upcoming")}
        >
          Upcoming Events ({upcomingEvents.length})
        </button>
        <button
          className={`toggle-btn ${view === "past" ? "active" : ""}`}
          onClick={() => setView("past")}
        >
          Past Events ({pastEvents.length})
        </button>
      </div>

      <div className="event-list-grid">
        {isLoading ? (
          <p>Loading Your Events...</p>
        ) : displayedEvents.length > 0 ? (
          displayedEvents.map((event) => (
            <div key={event.id} className="event-card">
              <div
                className="event-image-banner"
                style={{
                  backgroundImage: `url(${event.imageUrl || "https://via.placeholder.com/400x200/FDF5E6/B74F2F?text=Temple+Event"})`,
                }}
              >
                <div className="event-card-actions">
                  <button onClick={() => handleEditClick(event)}>
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(event.id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
              <div className="event-card-content">
                <h3 className="event-card-title">{event.title}</h3>
                <div className="event-card-details">
                  <p>
                    <FaCalendarAlt />{" "}
                    {format(parseISO(event.date), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p>
                    <FaClock /> {event.eventTime}
                  </p>
                  <p>
                    <FaMapMarkerAlt /> {event.location}
                  </p>
                </div>
                {/* ✅ 2. CHANGED: Replaced the simple <p> tag with our new component. */}
                <TruncatedDescription text={event.description} />
              </div>
            </div>
          ))
        ) : (
          <p>
            {priestId
              ? `You have no ${view} events.`
              : "Please log in to manage your events."}
          </p>
        )}
      </div>
    </div>
  );
};

export default ManageEventsPage;
