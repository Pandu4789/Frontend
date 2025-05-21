import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagePriests = () => {
  const [priests, setPriests] = useState([]);

  useEffect(() => {
    fetchPriests();
  }, []);

  const fetchPriests = async () => {
    try {
      const res = await axios.get("/api/admin/priests");
      setPriests(res.data);
    } catch (err) {
      console.error("Failed to fetch priests", err);
    }
  };

  const deletePriest = async (id) => {
    try {
      await axios.delete(`/api/admin/priests/${id}`);
      fetchPriests(); 
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Priests</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Phone</th>
            <th>Services</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {priests.map((p) => (
            <tr key={p.id} className="border-t">
              <td>{p.name}</td>
              <td>{p.phone}</td>
              <td>{p.services?.join(", ")}</td>
              <td>
                <button onClick={() => deletePriest(p.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePriests;
