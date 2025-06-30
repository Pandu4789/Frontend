// Filename: AdminPage.js - FULLY REDESIGNED
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserTie, FaUsers, FaCalendarCheck, FaPray, FaCalendarAlt,
  FaQuestionCircle, FaShoppingBasket, FaGift, FaBookOpen, FaClock, FaSignOutAlt, FaOm
} from 'react-icons/fa';
import './AdminPage.css'; // We will create this new CSS file

// Import your management components
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
  // ✅ Navigation is now driven by this array, making it easy to add/remove items
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

  const [activeTab, setActiveTab] = useState(navLinks[0].key); // Default to the first item
  const navigate = useNavigate();

  const handleLogout = () => {
    // We can add a confirmation modal here later if needed
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const renderComponent = () => {
    switch (activeTab) {
      case "priests": return <ManagePriests />;
      case "customers": return <ManageCustomers />;
      case "appointments": return <ManageAppointments />;
      case "pooja": return <ManagePoojaServices />;
      case "events": return <ManageEvents />;
      case "muhurtam": return <ManageMuhurtamRequests />;
      case "pooja-items": return <ManagePoojaItems />;
      case "prasadam": return <ManagePrasadams />;
      case "festivals": return <ManageFestivals />;
      case "daily-times": return <ManageDailyTimes />;
      case "panchangam": return <ManagePanchangam />;
      default: return <ManagePriests />;
    }
  };
  
  // Find the label of the current active tab to display in the header
  const activeLabel = navLinks.find(link => link.key === activeTab)?.label || 'Dashboard';

  return (
    <div className="admin-dashboard">
      {/* --- Sidebar Navigation --- */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <FaOm className="sidebar-logo-icon" />
          <h1 className="sidebar-title">PRIESTify Admin</h1>
        </div>
        <nav className="sidebar-nav">
          {navLinks.map(link => (
            <button
              key={link.key}
              className={`sidebar-link ${activeTab === link.key ? 'active' : ''}`}
              onClick={() => setActiveTab(link.key)}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
            <button className="sidebar-link logout" onClick={handleLogout}>
                <span className="sidebar-icon"><FaSignOutAlt /></span>
                Logout
            </button>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="admin-main-content">
        <header className="content-header">
          <h2>{activeLabel}</h2>
        </header>
        <div className="content-card">
          {renderComponent()}
        </div>
      </main>
    </div>
  );
};

export default AdminPage;