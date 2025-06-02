import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("priests");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const renderComponent = () => {
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
      default:
        return <ManagePriests />;
    }
  };

  return (
    <>
      <style>{`
        .admin-container {
          min-height: 100vh;
          background-color: #f9fafb;
          padding: 24px;
          font-family: Arial, sans-serif;
        }
        .header {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 24px;
        }
        .admin-heading {
          color: black;
          font-size: 32px;
          font-weight: bold;
          margin: 0;
        }
        .button-group {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          position: relative;
          padding-right: 140px; /* reserve space for logout button */
          margin-bottom: 24px;
          justify-content: flex-start;
        }
        .btn {
          color: black;
          font-size: 18px;
          font-weight: 600;
          padding: 10px 22px;
          border: 1px solid #ccc;
          border-radius: 6px;
          background-color: white;
          cursor: pointer;
          transition: background-color 0.2s ease;
          user-select: none;
          white-space: nowrap;
        }
        .btn:hover {
          background-color: #e5e7eb; /* light gray */
        }
        .btn:focus {
          outline: 2px solid #2563eb; /* blue outline for accessibility */
          outline-offset: 2px;
        }
        .btn-logout {
          position: absolute;
          top: 0;
          right: 0;
          background-color: #dc2626;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          font-weight: 600;
          transition: background-color 0.2s ease;
          cursor: pointer;
          height: 42px;
          line-height: 22px;
        }
        .btn-logout:hover {
          background-color: #b91c1c;
        }
        .content {
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          padding: 24px;
        }
      `}</style>

      <div className="admin-container">
        <div className="header">
          <h1 className="admin-heading">Admin Dashboard</h1>
        </div>

        <div className="button-group">
          <button className="btn" onClick={() => setActiveTab("priests")}>Priests</button>
          <button className="btn" onClick={() => setActiveTab("customers")}>Customers</button>
          <button className="btn" onClick={() => setActiveTab("appointments")}>Appointments</button>
          <button className="btn" onClick={() => setActiveTab("pooja")}>Pooja Services</button>
          <button className="btn" onClick={() => setActiveTab("events")}>Events</button>
          <button className="btn" onClick={() => setActiveTab("muhurtam")}>Muhurtam Requests</button>
          <button className="btn" onClick={() => setActiveTab("pooja-items")}>Pooja Items</button>
          <button className="btn" onClick={() => setActiveTab("prasadam")}>Prasadam</button>
          <button className="btn" onClick={() => setActiveTab("festivals")}>Festivals</button>
          <button className="btn" onClick={() => setActiveTab("daily-times")}>Daily Times</button>

          {/* add more buttons here if needed */}

          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>

        <div className="content">{renderComponent()}</div>
      </div>
    </>
  );
};

export default AdminPage;
