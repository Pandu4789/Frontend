import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageCustomers = () => {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    axios.get("/api/admin/customers").then((res) => setCustomers(res.data));
  }, []);

  const deleteCustomer = async (id) => {
    await axios.delete(`/api/admin/customers/${id}`);
    setCustomers(customers.filter((c) => c.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Customers</h2>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-t">
              <td>{c.name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>
                <button onClick={() => deleteCustomer(c.id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageCustomers;
