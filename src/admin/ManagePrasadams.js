import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/prasadam';

const ManagePrasadams = () => {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    available: true,
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
  const res = await axios.get(API_BASE); // Fixed: No `/items`
  setItems(res.data);
};

const handleSubmit = async e => {
  e.preventDefault();
  const payload = {
    ...form,
    price: parseFloat(form.price),
  };

  if (editingItem) {
    await axios.put(`${API_BASE}/${editingItem.id}`, payload); // Fixed: PUT for editing
  } else {
    await axios.post(API_BASE, payload); // Fixed: POST to /api/prasadam
  }

  fetchItems();
  setForm({ name: '', category: '', price: '', description: '', imageUrl: '', available: true });
  setEditingItem(null);
};

const handleDelete = async id => {
  if (window.confirm('Are you sure you want to delete this item?')) {
    await axios.delete(`${API_BASE}/${id}`); // Fixed
    fetchItems();
  }
};

const toggleAvailability = async item => {
  const updated = { ...item, available: !item.available };
  await axios.put(`${API_BASE}/${item.id}`, updated); // Fixed to use PUT
  fetchItems();
};
const handleChange = e => {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};
const handleEdit = item => {
  setEditingItem(item);
  setForm({
    name: item.name,
    category: item.category,
    price: item.price.toString(),
    description: item.description,
    imageUrl: item.imageUrl,
    available: item.available
  });
};

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Manage Prasadams</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded mb-6">
        <div className="grid grid-cols-2 gap-4">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="border p-2 rounded" />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} className="border p-2 rounded" />
          <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="border p-2 rounded" />
          <input name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={handleChange} className="border p-2 rounded" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="border p-2 rounded col-span-2" />
          <label className="flex items-center gap-2 col-span-2">
            <input type="checkbox" name="available" checked={form.available} onChange={handleChange} />
            Available
          </label>
        </div>
        <button type="submit" className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          {editingItem ? 'Update' : 'Add'} Prasadam
        </button>
      </form>

      {/* Table */}
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Image</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Available</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className={item.available ? '' : 'opacity-50'}>
              <td className="border p-2">
                <img src={item.imageUrl || 'https://via.placeholder.com/60?text=No+Image'} alt={item.name} className="w-14 h-14 object-cover rounded" />
              </td>
              <td className="border p-2">{item.name}</td>
              <td className="border p-2">{item.category}</td>
              <td className="border p-2">₹{item.price}</td>
              <td className="border p-2 text-center">
                <button onClick={() => toggleAvailability(item)} className="text-sm px-2 py-1 bg-gray-200 rounded">
                  {item.available ? 'Yes' : 'No'}
                </button>
              </td>
              <td className="border p-2 space-x-2">
                <button onClick={() => handleEdit(item)} className="bg-yellow-400 text-white px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-2 py-1 rounded">Delete</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4">No items found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePrasadams;
