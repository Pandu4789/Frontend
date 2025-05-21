import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageMuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/muhurtam").then((res) => setRequests(res.data));
  }, []);

  const handleDecision = async (id, status) => {
    await axios.put(`/api/admin/muhurtam/${id}/status`, { status });
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Muhurtam Requests</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Customer</th>
            <th>Priest</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.id} className="border-t">
              <td>{r.customerName}</td>
              <td>{r.priestName}</td>
              <td>{r.date}</td>
              <td>{r.status}</td>
              <td>
                <button onClick={() => handleDecision(r.id, "ACCEPTED")} className="text-green-600 mr-2">Accept</button>
                <button onClick={() => handleDecision(r.id, "REJECTED")} className="text-red-600">Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageMuhurtamRequests;
