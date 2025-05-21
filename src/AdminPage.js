import React, { useState } from "react";
import ManagePriests from "./admin/ManagePriests";
import ManageCustomers from "./admin/ManageCustomers";
import ManageAppointments from "./admin/ManageAppointments";
import ManagePoojaServices from "./admin/ManagePoojaServices";
import ManageEvents from "./admin/ManageEvents";
import ManageMuhurtamRequests from "./admin/ManageMuhurtamRequests";
import ManagePoojaItems from "./admin/ManagePoojaItems";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("priests");

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
      default:
        return <ManagePriests />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Dashboard</h1>
      <div className="flex gap-3 flex-wrap justify-center mb-6">
        <button onClick={() => setActiveTab("priests")} className="btn">Priests</button>
        <button onClick={() => setActiveTab("customers")} className="btn">Customers</button>
        <button onClick={() => setActiveTab("appointments")} className="btn">Appointments</button>
        <button onClick={() => setActiveTab("pooja")} className="btn">Pooja Services</button>
        <button onClick={() => setActiveTab("events")} className="btn">Events</button>
        <button onClick={() => setActiveTab("muhurtam")} className="btn">Muhurtam Requests</button>
        <button onClick={() => setActiveTab("pooja-items")} className="btn">Pooja Items</button>
      </div>
      <div className="bg-white shadow-md rounded p-4">{renderComponent()}</div>
    </div>
  );
};

export default AdminPage;
