import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie,
  FaUsers,
  FaCalendarCheck,
  FaPray,
  FaCalendarAlt,
  FaQuestionCircle,
  FaShoppingBasket,
  FaGift,
  FaBookOpen,
  FaClock,
  FaSignOutAlt,
  FaOm,
  FaBell,
} from "react-icons/fa";
import "./AdminPage.css";

// --- Management Component Imports ---
import ManagePriests from "./admin/ManagePriests";
import ManageCustomers from "./admin/ManageCustomers";
import ManageAppointments from "./admin/ManageAppointments";
import ManagePoojaServices from "./admin/ManagePoojaServices";
import ManageEvents from "./admin/ManageEvents";
import ManageMuhurtamRequests from "./admin/ManageMuhurtamRequests";
import ManagePoojaItems from "./admin/ManagePoojaItems";
import ManageFestivals from "./admin/ManageFestivals";
import ManagePrasadams from "./admin/ManagePrasadams";
import ManageDailyTimes from "./admin/ManageDailyTimes";
import ManagePanchangam from "./admin/ManagePanchangam";

const AdminPage = () => {
  const navLinks = [
    { key: "priests", label: "Priests", icon: <FaUserTie /> },
    { key: "customers", label: "Customers", icon: <FaUsers /> },
    { key: "appointments", label: "Appointments", icon: <FaCalendarCheck /> },
    { key: "muhurtam", label: "Muhurtam Req.", icon: <FaQuestionCircle /> },
    { key: "pooja", label: "Pooja Services", icon: <FaPray /> },
    { key: "events", label: "Events", icon: <FaCalendarAlt /> },
    { key: "festivals", label: "Festivals", icon: <FaGift /> },
    { key: "prasadam", label: "Prasadam", icon: <FaShoppingBasket /> },
    { key: "pooja-items", label: "Pooja Items", icon: <FaShoppingBasket /> },
    { key: "panchangam", label: "Panchangam", icon: <FaBookOpen /> },
    { key: "daily-times", label: "Daily Times", icon: <FaClock /> },
  ];

  const [activeTab, setActiveTab] = useState(navLinks[0].key);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const activeLabel =
    navLinks.find((link) => link.key === activeTab)?.label || "Dashboard";

  // Helper function to render the correct sub-component
  const renderTabContent = () => {
    switch (activeTab) {
      case "priests":
        return <ManagePriests />;
      case "customers":
        return <ManageCustomers />;
      case "appointments":
        return <ManageAppointments />;
      case "pooja":
        return <ManagePoojaServices />;
      case "events":
        return <ManageEvents />;
      case "muhurtam":
        return <ManageMuhurtamRequests />;
      case "pooja-items":
        return <ManagePoojaItems />;
      case "prasadam":
        return <ManagePrasadams />;
      case "festivals":
        return <ManageFestivals />;
      case "daily-times":
        return <ManageDailyTimes />;
      case "panchangam":
        return <ManagePanchangam />;
      default:
        return <ManagePriests />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* --- Sidebar Navigation --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <FaOm className="sidebar-logo-icon" />
          <h1 className="sidebar-title">PRIESTify</h1>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <button
              key={link.key}
              className={`sidebar-link ${activeTab === link.key ? "active" : ""}`}
              onClick={() => setActiveTab(link.key)}
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-label-text">{link.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link logout" onClick={handleLogout}>
            <span className="sidebar-icon">
              <FaSignOutAlt />
            </span>
            <span className="sidebar-label-text">Logout</span>
          </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="admin-main-content">
        <header className="content-header">
          <div className="header-title-box">
            <p className="breadcrumb-text">Admin Management Portal</p>
            <h2>{activeLabel}</h2>
          </div>

          <div className="header-profile-actions">
            <button className="icon-action-btn">
              <FaBell />
            </button>
            <div className="admin-user-pill">
              <div className="admin-avatar">A</div>
              <span className="admin-name">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="content-card-wrapper">{renderTabContent()}</div>
      </main>
    </div>
  );
};

export default AdminPage;
