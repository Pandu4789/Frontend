import React, { useEffect, useState } from "react";
import axios from "axios";

const ManagePoojaServices = () => {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:8080/api/events")
      .then((res) => {
        setServices(res.data);
        setError("");
      })
      .catch(() => setError("Failed to fetch services"))
      .finally(() => setLoading(false));
  }, []);

  const addService = async () => {
    if (!newService.trim()) return;
    try {
      const res = await axios.post("http://localhost:8080/api/events", { name: newService.trim() });
      setServices((prev) => [...prev, res.data]);
      setNewService("");
      setError("");
    } catch {
      setError("Failed to add service");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/events/${id}`);
      setServices((prev) => prev.filter((s) => s.id !== id));
      setError("");
    } catch {
      setError("Failed to delete service");
    }
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
      <button onClick={addService} className="btn" disabled={!newService.trim()}>
        Add
      </button>

      {error && <p className="text-red-600 mt-2">{error}</p>}
      {loading ? (
        <p>Loading services...</p>
      ) : (
        <ul className="mt-4">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center border-b py-2"
            >
              {s.name}
              <button
                onClick={() => deleteService(s.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
          {services.length === 0 && <li>No services found</li>}
        </ul>
      )}
    </div>
  );
};

export default ManagePoojaServices;
