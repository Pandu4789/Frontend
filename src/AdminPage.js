import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagePriests from "./admin/ManagePriests";
import ManageCustomers from "./admin/ManageCustomers";
import ManageAppointments from "./admin/ManageAppointments";
import ManagePoojaServices from "./admin/ManagePoojaServices";
import ManageEvents from "./admin/ManageEvents";
import ManageMuhurtamRequests from "./admin/ManageMuhurtamRequests";
import ManagePoojaItems from "./admin/ManagePoojaItems";
import ManagePrasadams from "./admin/ManagePrasadams";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("priests");
  const navigate = useNavigate(); // for redirection

  const handleLogout = () => {
    // Clear auth-related data
    localStorage.removeItem("token"); // or sessionStorage.clear() if using sessionStorage
    localStorage.removeItem("role");  // optional
    // Redirect to login page
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
      default:
        return <ManagePriests />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center w-full">Admin Dashboard</h1>
      </div>
      <div className="flex gap-3 flex-wrap justify-center mb-6">
        <button onClick={() => setActiveTab("priests")} className="btn">Priests</button>
        <button onClick={() => setActiveTab("customers")} className="btn">Customers</button>
        <button onClick={() => setActiveTab("appointments")} className="btn">Appointments</button>
        <button onClick={() => setActiveTab("pooja")} className="btn">Pooja Services</button>
        <button onClick={() => setActiveTab("events")} className="btn">Events</button>
        <button onClick={() => setActiveTab("muhurtam")} className="btn">Muhurtam Requests</button>
        <button onClick={() => setActiveTab("pooja-items")} className="btn">Pooja Items</button>
        <button onClick={() => setActiveTab("prasadam")} className="btn">Prasadam</button>
        <button
          onClick={handleLogout}
          className="absolute top-6 right-6 bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <div className="bg-white shadow-md rounded p-4">{renderComponent()}</div>
    </div>
  );
};

export default AdminPage;