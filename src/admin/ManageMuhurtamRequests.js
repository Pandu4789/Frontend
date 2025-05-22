import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const ManageMuhurtamRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/api/muhurtam/all");
      setRequests(res.data);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleViewedToggle = async (id, viewed) => {
  try {
    await axios.put(`http://localhost:8080/api/muhurtam/viewed/${id}`, {
      viewed: viewed
    });
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, viewed } : r))
    );
    toast.success(`Marked as ${viewed ? "viewed" : "not viewed"}`);
  } catch {
    toast.error("Failed to update viewed status");
  }
};

  const fallback = (val) => (val ? val : "-");

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Muhurtam Requests</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">S.No</th>
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Priest username</th>
              <th className="p-2 border">Viewed</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, index) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-2 border text-center">{index + 1}</td>
                <td className="p-2 border">{fallback(r.name)}</td>
                <td className="p-2 border">{fallback(r.priestUsername)}</td>
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={r.viewed || false}
                    onChange={(e) =>
                      handleViewedToggle(r.id, e.target.checked)
                    }
                  />
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
};

export default ManageMuhurtamRequests;
