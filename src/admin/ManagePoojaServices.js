import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagePoojaServices = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");

  useEffect(() => {
    axios.get("/api/admin/poojas").then((res) => setServices(res.data));
  }, []);

  const addService = async () => {
    const res = await axios.post("/api/admin/poojas", { name: newService });
    setServices([...services, res.data]);
    setNewService("");
  };

  const deleteService = async (id) => {
    await axios.delete(`/api/admin/poojas/${id}`);
    setServices(services.filter((s) => s.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Manage Pooja Services</h2>
      <input
        type="text"
        value={newService}
        onChange={(e) => setNewService(e.target.value)}
        className="border p-1 mr-2"
        placeholder="New Service Name"
      />
      <button onClick={addService} className="btn">Add</button>
      <ul className="mt-4">
        {services.map((s) => (
          <li key={s.id} className="flex justify-between items-center border-b py-2">
            {s.name}
            <button onClick={() => deleteService(s.id)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ManagePoojaServices;
