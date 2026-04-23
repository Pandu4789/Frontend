import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { format, isValid, isBefore, startOfDay } from "date-fns";
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaUserAlt,
  FaCalendarAlt,
  FaInbox,
  FaChevronLeft,
  FaChevronRight,
  FaArrowLeft,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaPhoneAlt,
  FaEnvelope,
  FaBaby,
  FaFilter,
  FaBan,
  FaSearch,
} from "react-icons/fa";
import "./YourBookings.css";
import { API_ENDPOINTS, buildApiUrl } from "./config/apiConfig";

const YourBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("bookings");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [appointmentBookings, setAppointmentBookings] = useState([]);
  const [muhurtamRequests, setMuhurtamRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const itemsPerPage = 6;

  // --- SIDEBAR SYNC LOGIC ---
  useEffect(() => {
    if (location.state) {
      const { filter, tab } = location.state;

      // Switch tab (bookings or requests)
      if (tab) setActiveTab(tab);

      // Apply status filter
      if (filter) setStatusFilter(filter);

      setCurrentPage(1);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchUserBookings = async () => {
      const customerId = localStorage.getItem("userId");
      if (!customerId) {
        setIsLoading(false);
        return;
      }

      try {
        const [bookingRes, muhurtamRes] = await Promise.all([
          axios.get(buildApiUrl(`/api/booking/customer/${customerId}`)),
          axios.get(buildApiUrl(`/api/muhurtam/customer/${customerId}`)),
        ]);
        const sortFn = (a, b) => b.id - a.id;
        setAppointmentBookings((bookingRes.data || []).sort(sortFn));
        setMuhurtamRequests((muhurtamRes.data || []).sort(sortFn));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserBookings();
  }, []);

  // --- LOGIC HELPERS ---
  const isPast = (dateStr) => {
    if (!dateStr) return false;
    return isBefore(new Date(dateStr), startOfDay(new Date()));
  };

  const getStatusMeta = (item) => {
    const rawStatus = (item.status || "").toUpperCase();
    const isExpired = activeTab === "bookings" && isPast(item.date);

    // 1. If date passed and it was still PENDING or NO STATUS
    if (isExpired && (!rawStatus || rawStatus === "PENDING")) {
      return { cls: "expired", icon: <FaBan />, label: "No Longer Available" };
    }

    // 2. Standard Statuses
    if (rawStatus.includes("ACCEPT"))
      return { cls: "confirmed", icon: <FaCheckCircle />, label: "Accepted" };
    if (rawStatus.includes("REJECT"))
      return { cls: "rejected", icon: <FaTimesCircle />, label: "Rejected" };

    // 3. Acknowledged (Uses 'viewed' cls for consistent blue styling)
    if (item.viewed && !rawStatus)
      return { cls: "viewed", icon: <FaInfoCircle />, label: "Acknowledged" };

    return { cls: "pending", icon: <FaExclamationCircle />, label: "Pending" };
  };

  // --- COUNT LOGIC ---
  const counts = useMemo(() => {
    const data =
      activeTab === "bookings" ? appointmentBookings : muhurtamRequests;
    if (activeTab === "bookings") {
      return {
        all: data.length,
        upcoming: data.filter((item) => !isPast(item.date)).length,
        pending: data.filter(
          (item) =>
            !isPast(item.date) &&
            (!item.status || item.status.toUpperCase() === "PENDING") &&
            !item.viewed,
        ).length,
        accepted: data.filter((item) =>
          item.status?.toUpperCase().includes("ACCEPT"),
        ).length,
        rejected: data.filter((item) =>
          item.status?.toUpperCase().includes("REJECT"),
        ).length,
        expired: data.filter(
          (item) =>
            isPast(item.date) &&
            (!item.status || item.status.toUpperCase() === "PENDING"),
        ).length,
      };
    } else {
      return {
        all: data.length,
        pending: data.filter((item) => !item.viewed).length,
        acknowledged: data.filter((item) => item.viewed).length,
      };
    }
  }, [activeTab, appointmentBookings, muhurtamRequests]);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    const rawData =
      activeTab === "bookings" ? appointmentBookings : muhurtamRequests;
    let filtered = rawData;

    // Status filter
    if (statusFilter === "ALL") {
      // No status filter
    } else if (statusFilter === "UPCOMING") {
      filtered = filtered.filter((item) => !isPast(item.date));
    } else if (statusFilter === "EXPIRED") {
      filtered = filtered.filter(
        (item) =>
          isPast(item.date) &&
          (!item.status || item.status.toUpperCase() === "PENDING"),
      );
    } else {
      filtered = filtered.filter((item) => {
        const status = (item.status || "").toUpperCase();
        if (statusFilter === "PENDING")
          return (
            (status === "PENDING" || status === "") &&
            !item.viewed &&
            !isPast(item.date)
          );
        if (statusFilter === "ACKNOWLEDGED")
          return (
            item.viewed === true && (status === "" || status === "ACKNOWLEDGED")
          );
        return status.includes(statusFilter);
      });
    }

    // Date filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= fromDate;
      });
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate <= toDate;
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.priestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nakshatram?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  }, [
    activeTab,
    appointmentBookings,
    muhurtamRequests,
    statusFilter,
    dateFrom,
    dateTo,
    searchTerm,
  ]);

  const visibleData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="yb-container">
      {/* Modern Header */}
      {/* <div className="yb-header">
                <div className="yb-header-content">
                    <div className="yb-header-text">
                        <h1 className="yb-title">My Spiritual Journey</h1>
                        <p className="yb-subtitle">Manage your sacred ceremonies and divine connections</p>
                    </div>
                </div>
                <div className="yb-header-stats">
                    <div className="yb-stat-card">
                        <div className="yb-stat-number">{appointmentBookings.length}</div>
                        <div className="yb-stat-label">Total Bookings</div>
                    </div>
                    <div className="yb-stat-card">
                        <div className="yb-stat-number">{muhurtamRequests.length}</div>
                        <div className="yb-stat-label">Muhurtam Requests</div>
                    </div>
                </div>
            </div> */}

      {/* Main Content */}
      <div className="yb-main-content">
        {/* Enhanced Tab Navigation */}
        <div className="yb-tabs">
          <button
            className={`yb-tab ${activeTab === "bookings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("bookings");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
          >
            <div className="yb-tab-icon">
              <FaCalendarAlt />
            </div>
            <div className="yb-tab-content">
              <div className="yb-tab-title">Ritual Bookings</div>
              <div className="yb-tab-count">{appointmentBookings.length}</div>
            </div>
          </button>
          <button
            className={`yb-tab ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("requests");
              setStatusFilter("ALL");
              setCurrentPage(1);
            }}
          >
            <div className="yb-tab-icon">
              <FaBaby />
            </div>
            <div className="yb-tab-content">
              <div className="yb-tab-title">Muhurtam Requests</div>
              <div className="yb-tab-count">{muhurtamRequests.length}</div>
            </div>
          </button>
        </div>

        {/* Advanced Filters */}
        <div className="yb-filters-section">
          <div className="yb-filters-header">
            <h3 className="yb-filters-title">
              <FaFilter /> Filters & Search
            </h3>
            <div className="yb-active-filters">
              {searchTerm && (
                <span className="yb-filter-tag">Search: "{searchTerm}"</span>
              )}
              {dateFrom && (
                <span className="yb-filter-tag">
                  From: {format(new Date(dateFrom), "MMM dd, yyyy")}
                </span>
              )}
              {dateTo && (
                <span className="yb-filter-tag">
                  To: {format(new Date(dateTo), "MMM dd, yyyy")}
                </span>
              )}
              {(searchTerm || dateFrom || dateTo) && (
                <button
                  className="yb-clear-all-filters"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFrom("");
                    setDateTo("");
                    setStatusFilter("ALL");
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="yb-filters-grid">
            {/* Search */}
            <div className="yb-filter-group">
              <label className="yb-filter-label">Search</label>
              <div className="yb-search-wrapper">
                <FaSearch className="yb-search-icon" />
                <input
                  type="text"
                  placeholder="Search by priest, event, or nakshatram..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="yb-search-input"
                />
              </div>
            </div>

            {/* Date Range */}
            <div className="yb-filter-group">
              <label className="yb-filter-label">Date Range</label>
              <div className="yb-date-range">
                <div className="yb-date-input-wrapper">
                  <span className="yb-date-label">From</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="yb-date-input"
                  />
                </div>
                <div className="yb-date-input-wrapper">
                  <span className="yb-date-label">To</span>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="yb-date-input"
                  />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div className="yb-filter-group">
              <label className="yb-filter-label">Status</label>
              <div className="yb-status-chips">
                <button
                  className={`yb-status-chip ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  All (
                  {activeTab === "bookings"
                    ? appointmentBookings.length
                    : muhurtamRequests.length}
                  )
                </button>

                {activeTab === "bookings" ? (
                  <>
                    <button
                      className={`yb-status-chip upcoming ${statusFilter === "UPCOMING" ? "active" : ""}`}
                      onClick={() => setStatusFilter("UPCOMING")}
                    >
                      Upcoming ({counts.upcoming})
                    </button>
                    <button
                      className={`yb-status-chip pending ${statusFilter === "PENDING" ? "active" : ""}`}
                      onClick={() => setStatusFilter("PENDING")}
                    >
                      Pending ({counts.pending})
                    </button>
                    <button
                      className={`yb-status-chip confirmed ${statusFilter === "ACCEPTED" ? "active" : ""}`}
                      onClick={() => setStatusFilter("ACCEPTED")}
                    >
                      Accepted ({counts.accepted})
                    </button>
                    <button
                      className={`yb-status-chip rejected ${statusFilter === "REJECTED" ? "active" : ""}`}
                      onClick={() => setStatusFilter("REJECTED")}
                    >
                      Rejected ({counts.rejected})
                    </button>
                    {counts.expired > 0 && (
                      <button
                        className={`yb-status-chip expired ${statusFilter === "EXPIRED" ? "active" : ""}`}
                        onClick={() => setStatusFilter("EXPIRED")}
                      >
                        Expired ({counts.expired})
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      className={`yb-status-chip pending ${statusFilter === "PENDING" ? "active" : ""}`}
                      onClick={() => setStatusFilter("PENDING")}
                    >
                      Pending ({counts.pending})
                    </button>
                    <button
                      className={`yb-status-chip viewed ${statusFilter === "ACKNOWLEDGED" ? "active" : ""}`}
                      onClick={() => setStatusFilter("ACKNOWLEDGED")}
                    >
                      Acknowledged ({counts.acknowledged})
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="yb-results-summary">
          <div className="yb-results-count">
            Showing {visibleData.length} of {filteredData.length}{" "}
            {activeTab === "bookings" ? "bookings" : "requests"}
          </div>
          {filteredData.length > itemsPerPage && (
            <div className="yb-pagination-info">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="yb-content-area">
          {isLoading ? (
            <div className="yb-loading-state">
              <div className="yb-loading-spinner"></div>
              <p>Organizing your sacred schedule...</p>
            </div>
          ) : visibleData.length > 0 ? (
            <div className="yb-cards-grid">
              {visibleData.map((item) => {
                const meta = getStatusMeta(item);
                return (
                  <div
                    key={`${activeTab}-${item.id}`}
                    className={`yb-card ${meta.cls}`}
                  >
                    <div className="yb-card-header">
                      <div className="yb-card-id">#{item.id}</div>
                      <div className={`yb-card-status ${meta.cls}`}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </div>
                    </div>

                    <div className="yb-card-body">
                      <h3 className="yb-card-title">
                        {item.eventName || "Ritual Service"}
                      </h3>

                      <div className="yb-card-details">
                        <div className="yb-detail-item">
                          <FaUserAlt className="yb-detail-icon" />
                          <div className="yb-detail-content">
                            <div className="yb-detail-label">Priest</div>
                            <div className="yb-detail-value">
                              {item.priestName}
                            </div>
                          </div>
                        </div>

                        <div className="yb-detail-item">
                          <FaCalendarAlt className="yb-detail-icon" />
                          <div className="yb-detail-content">
                            <div className="yb-detail-label">
                              {activeTab === "requests" && !item.nakshatram
                                ? "Birth Info"
                                : activeTab === "requests"
                                  ? "Nakshatram"
                                  : "Schedule"}
                            </div>
                            <div className="yb-detail-value">
                              {activeTab === "requests"
                                ? item.nakshatram ||
                                  `${item.date} | ${item.time}`
                                : item.date && isValid(new Date(item.date))
                                  ? format(new Date(item.date), "MMM dd, yyyy")
                                  : "TBD"}
                              {activeTab === "bookings" && item.start
                                ? ` at ${item.start}`
                                : ""}
                            </div>
                          </div>
                        </div>

                        {activeTab === "bookings" && item.address && (
                          <div className="yb-detail-item">
                            <FaMapMarkerAlt className="yb-detail-icon" />
                            <div className="yb-detail-content">
                              <div className="yb-detail-label">Location</div>
                              <div className="yb-detail-value">
                                {item.address}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="yb-card-footer">
                      <button
                        className="yb-view-details-btn"
                        onClick={() => setSelectedItem(item)}
                      >
                        <FaExternalLinkAlt />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="yb-empty-state">
              <div className="yb-empty-icon">
                <FaInbox />
              </div>
              <h3 className="yb-empty-title">No results found</h3>
              <p className="yb-empty-description">
                Try adjusting your filters or search terms to find what you're
                looking for.
              </p>
              {(searchTerm || dateFrom || dateTo || statusFilter !== "ALL") && (
                <button
                  className="yb-reset-filters-btn"
                  onClick={() => {
                    setSearchTerm("");
                    setDateFrom("");
                    setDateTo("");
                    setStatusFilter("ALL");
                  }}
                >
                  Reset All Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="yb-pagination">
            <button
              className="yb-pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <FaChevronLeft />
              Previous
            </button>

            <div className="yb-pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    className={`yb-pagination-page ${pageNum === currentPage ? "active" : ""}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="yb-pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>

      {selectedItem && (
        <div
          className="yb-drawer-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div className="yb-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="yb-drawer-header">
              <h2>Service Summary</h2>
              <button
                className="yb-close-btn"
                onClick={() => setSelectedItem(null)}
              >
                &times;
              </button>
            </div>
            <div className="yb-drawer-body">
              <div
                className={`yb-drawer-status banner-${getStatusMeta(selectedItem).cls}`}
              >
                {getStatusMeta(selectedItem).label}
              </div>
              <section className="yb-drawer-section">
                <h3>
                  <FaUserAlt /> Priest Contact
                </h3>
                <div className="yb-drawer-info">
                  <p className="yb-drawer-priest-name">
                    {selectedItem.priestName}
                  </p>
                  <div className="yb-contact-item">
                    <FaPhoneAlt className="yb-contact-icon" />{" "}
                    <span>{selectedItem.priestPhone || "Not Provided"}</span>
                  </div>
                  <div className="yb-contact-item">
                    <FaEnvelope className="yb-contact-icon" />{" "}
                    <span>{selectedItem.priestEmail || "Not Provided"}</span>
                  </div>
                </div>
              </section>
              <section className="yb-drawer-section">
                <h3>
                  {activeTab === "requests" ? <FaBaby /> : <FaCalendarAlt />}{" "}
                  Service Details
                </h3>
                <div className="yb-drawer-info">
                  <p>
                    <strong>Ritual:</strong> {selectedItem.eventName}
                  </p>
                  {activeTab === "requests" ? (
                    selectedItem.nakshatram ? (
                      <p>
                        <strong>Nakshatram:</strong> {selectedItem.nakshatram}
                      </p>
                    ) : (
                      <>
                        <p>
                          <strong>Birth Date:</strong> {selectedItem.date}
                        </p>
                        <p>
                          <strong>Birth Time:</strong> {selectedItem.time}
                        </p>
                        <p>
                          <strong>Birth Place:</strong>{" "}
                          {selectedItem.place || "N/A"}
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <p>
                        <strong>Date:</strong>{" "}
                        {selectedItem.date &&
                        isValid(new Date(selectedItem.date))
                          ? format(new Date(selectedItem.date), "PPPP")
                          : "To be determined"}
                      </p>
                      <p>
                        <strong>Time:</strong>{" "}
                        {selectedItem.start || "To be determined"}
                      </p>
                    </>
                  )}
                </div>
              </section>
              {activeTab === "bookings" && selectedItem.address && (
                <section className="yb-drawer-section">
                  <h3>
                    <FaMapMarkerAlt /> Venue Location
                  </h3>
                  <p className="yb-drawer-address">{selectedItem.address}</p>
                </section>
              )}
              {selectedItem.note && (
                <section className="yb-drawer-section">
                  <h3>
                    <FaInfoCircle /> Instructions
                  </h3>
                  <p className="yb-drawer-note">"{selectedItem.note}"</p>
                </section>
              )}
            </div>
            <div className="yb-drawer-footer">
              <button
                className="yb-btn-close-full"
                onClick={() => setSelectedItem(null)}
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourBookings;
