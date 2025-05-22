import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from  "react-select";
const ManagePriests = () => {
  const [priests, setPriests] = useState([]);
  const [editPriest, setEditPriest] = useState(null);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    fetchPriests();
    fetchServices();
  }, []);

  const fetchPriests = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/auth/priests");
      setPriests(res.data);
    } catch (err) {
      console.error("Failed to fetch priests", err);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/events");
      setServicesList(res.data);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  const deletePriest = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/auth/priests/${id}`);
      fetchPriests();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updatePriest = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/auth/priests/${editPriest.id}`,
        editPriest
      );
      setEditPriest(null);
      fetchPriests();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  const handleServiceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map((opt) => {
      const selectedService = servicesList.find((s) => s.name === opt.value);
      return selectedService || { name: opt.value };
    });

    setEditPriest({ ...editPriest, poojas: selectedOptions });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Priests</h2>

      <div className="overflow-x-auto mb-6">
        <table className="w-full table-auto border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">First Name</th>
              <th className="p-2 border">Last Name</th>
              <th className="p-2 border">Username</th>
              <th className="p-2 border">Phone</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border">Password</th>
              <th className="p-2 border">Services</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {priests.map((p) => (
              <tr key={p.id} className="border-t border-gray-200">
                <td className="p-2 border">{p.firstName}</td>
                <td className="p-2 border">{p.lastName}</td>
                <td className="p-2 border">{p.username}</td>
                <td className="p-2 border">{p.phone}</td>
                <td className="p-2 border">{p.address}</td>
                <td className="p-2 border">{p.password}</td>
                <td className="p-2 border">
                  {p.poojas?.map((s) => s.name || s).join(", ")}
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => setEditPriest(p)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePriest(p.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {priests.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No priests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editPriest && (
        <div className="bg-white p-4 shadow-md border rounded-lg max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Edit Priest</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2"
              placeholder="First Name"
              value={editPriest.firstName}
              onChange={(e) =>
                setEditPriest({ ...editPriest, firstName: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Last Name"
              value={editPriest.lastName}
              onChange={(e) =>
                setEditPriest({ ...editPriest, lastName: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Username"
              value={editPriest.username}
              onChange={(e) =>
                setEditPriest({ ...editPriest, username: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Phone"
              value={editPriest.phone}
              onChange={(e) =>
                setEditPriest({ ...editPriest, phone: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Address"
              value={editPriest.address}
              onChange={(e) =>
                setEditPriest({ ...editPriest, address: e.target.value })
              }
            />
            <input
              className="border p-2 col-span-2"
              placeholder="Password"
              type="password"
              value={editPriest.password}
              onChange={(e) =>
                setEditPriest({ ...editPriest, password: e.target.value })
              }
            />

          <Select
  isMulti
  className="col-span-2"
  value={editPriest.poojas?.map((s) => ({
    label: s.name,
    value: s.id,
  }))}
  options={servicesList.map((service) => ({
    label: service.name,
    value: service.id,
  }))}
  onChange={(selectedOptions) => {
    const selectedServices = selectedOptions.map((opt) => ({
      id: opt.value,
      name: opt.label,
    }));
    setEditPriest({ ...editPriest, poojas: selectedServices });
  }}
/>


          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={updatePriest}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditPriest(null)}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePriests;
