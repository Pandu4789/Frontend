import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [editCustomer, setEditCustomer] = useState(null);
  const [servicesList, setServicesList] = useState([]);

  useEffect(() => {
    fetchCustomers();
    fetchServices();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/auth/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
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

  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/auth/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const updateCustomer = async () => {
    try {
      await axios.put(
        `http://localhost:8080/api/auth/customers/${editCustomer.id}`,
        editCustomer
      );
      setEditCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Customers</h2>

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
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-gray-200">
                <td className="p-2 border">{c.firstName}</td>
                <td className="p-2 border">{c.lastName}</td>
                <td className="p-2 border">{c.username}</td>
                <td className="p-2 border">{c.phone}</td>
                <td className="p-2 border">{c.address}</td>
                <td className="p-2 border">{c.password}</td>
                <td className="p-2 border space-x-2">
                  <button
                    onClick={() => setEditCustomer(c)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteCustomer(c.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center p-4 text-gray-500">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editCustomer && (
        <div className="bg-white p-4 shadow-md border rounded-lg max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Edit Customer</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              className="border p-2"
              placeholder="First Name"
              value={editCustomer.firstName}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, firstName: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Last Name"
              value={editCustomer.lastName}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, lastName: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Username"
              value={editCustomer.username}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, username: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Phone"
              value={editCustomer.phone}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, phone: e.target.value })
              }
            />
            <input
              className="border p-2"
              placeholder="Address"
              value={editCustomer.address}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, address: e.target.value })
              }
            />
            <input
              className="border p-2 col-span-2"
              placeholder="Password"
              type="password"
              value={editCustomer.password}
              onChange={(e) =>
                setEditCustomer({ ...editCustomer, password: e.target.value })
              }
            />

          </div>
          <div className="mt-4 space-x-4">
            <button
              onClick={updateCustomer}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditCustomer(null)}
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

export default ManageCustomers;
