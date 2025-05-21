import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageAppointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios.get("/api/booking").then((res) => setAppointments(res.data));
  }, []);

  const updateStatus = async (id, status) => {
    await axios.put(`/api/appointments//all`, { status });
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Appointments</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Pooja</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} className="border-t">
              <td>{a.name}</td>
              <td>{a.pooja}</td>
              <td>{a.date}</td>
              <td>{a.status}</td>
              <td>
                <button onClick={() => updateStatus(a.id, "APPROVED")} className="text-green-600 mr-2">Approve</button>
                <button onClick={() => updateStatus(a.id, "REJECTED")} className="text-red-600">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageAppointments;
