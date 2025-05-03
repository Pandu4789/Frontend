import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash } from 'react-icons/fa';
const App = () => {
  const predefinedPoojas = ['Ganesh Pooja', 'Lakshmi Pooja', 'Durga Pooja'];

  const allItemsData = {
    'Ganesh Pooja': [
      { id: 1, name: 'Coconut', price: 20 },
      { id: 2, name: 'Modak', price: 5 },
    ],
    'Lakshmi Pooja': [
      { id: 3, name: 'Diya', price: 10 },
      { id: 4, name: 'Kumkum', price: 15 },
    ],
    'Durga Pooja': [
      { id: 5, name: 'Garland', price: 50 },
      { id: 6, name: 'Chunri', price: 100 },
    ],
  };

  // Predefined quantities for each pooja type
  const predefinedQuantities = {
    'Ganesh Pooja': { 1: 2, 2: 10 },
    'Lakshmi Pooja': { 3: 5, 4: 8 },
    'Durga Pooja': { 5: 1, 6: 3 },
  };

  // Merge all items into a unique list
  const mergedItems = Object.values(allItemsData)
    .flat()
    .reduce((acc, item) => {
      if (!acc.find(i => i.id === item.id)) {
        acc.push({ ...item, quantity: 0 });
      }
      return acc;
    }, []);

  const [selectedPooja, setSelectedPooja] = useState('');
  const [items, setItems] = useState(mergedItems);
  const [toast, setToast] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  // Handle pooja type change
  const handlePoojaChange = (pooja) => {
    setSelectedPooja(pooja);

    // Update quantities based on the selected pooja
    if (pooja) {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          quantity: predefinedQuantities[pooja]?.[item.id] || 0,
        }))
      );
    } else {
      setItems(prevItems =>
        prevItems.map(item => ({
          ...item,
          quantity: 0,
        }))
      );
    }
  };

  const handleQuantityChange = (id, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: 0 } : item
      )
    );
  };

  const handleBuyItems = () => {
    const itemsToBuy = items.filter(item => item.quantity > 0);
    if (itemsToBuy.length === 0) {
      setToast({ type: 'warning', message: 'No items selected!' });
      return;
    }
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      setToast({ type: 'success', message: 'Purchase successful!' });
      setItems(prev => prev.map(item => ({ ...item, quantity: 0 })));
    }, 1000);
  };

  const totalPrice = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
    [items]
  );

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="container">
      <h1>Pooja Items</h1>
      <p className="description">Select your pooja type and manage the required items.</p>

      {/* Pooja Type Dropdown */}
      <div className="dropdown-container">
        <label>Select Pooja Type</label>
        <select
          value={selectedPooja}
          onChange={(e) => handlePoojaChange(e.target.value)}
        >
          <option value="">Select a Pooja</option>
          {predefinedPoojas.map((po) => (
            <option key={po}>{po}</option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div className="section">
        <h2> Items {selectedPooja && `for ${selectedPooja}`}</h2>
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isRecommended =
                selectedPooja &&
                allItemsData[selectedPooja]?.some(poItem => poItem.id === item.id);
              return (
                <tr
                  key={item.id}
                  style={{ background: isRecommended ? '#FFF3E0' : 'inherit' }}
                >
                  <td>{item.name}</td>
                  <td>
                    <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                    <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                  </td>
                  <td>₹{item.price}</td>
                  <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    {/* Changed cart symbol to delete/trash symbol */}
                    <td>
                      <button className="trash-button" onClick={() => handleRemoveItem(item.id)}>
                        <FaTrash />
                      </button>
                    </td>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Total and Buy Button Section */}
      <div className="total-buy-section">
        <div className="total">
          <strong>Total: ₹{totalPrice}</strong>
        </div>
        <button onClick={handleBuyItems} disabled={isBuying} className="buy-button">
          <span style={{ marginRight: '8px' }}>🛒</span> {isBuying ? 'Processing...' : 'Buy Items'}
        </button>
      </div>

      {/* Toast Notification */}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}

      {/* Styles */}
      <style>{`
        body, html {
          margin: 0;
          background: #FFF9E6;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .container {
          max-width: 900px;
          margin: auto;
          padding: 20px;
        }
        h1 {
          text-align: center;
          color: #FF9800;
        }
        .description {
          text-align: center;
          color: #555;
          margin-bottom: 20px;
        }
        .dropdown-container {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
          .trash-button svg {
  color: #4d4d4d;  /* light black (gray) */
  transition: color 0.2s ease;
}

.trash-button:hover svg {
  color: #f5302a;  /* red on hover */
}

          
        .dropdown-container label {
          font-weight: bold;
          margin: 0;
        }
        select {
          width: 200px;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 8px;
        }
        select:focus {
          outline: none;
          border-color: #FF9800;
          box-shadow: 0 0 4px rgba(255,152,0,0.5);
        }
          .buy-button {
          background: #FF9800;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: background 0.2s;
        }

        .section {
          background: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
          
        h2 {
          color: #FF9800;
          margin-bottom: 15px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px;
          text-align: center;
          border-bottom: 1px solid #eee;
        }
        table button {
          background: transparent;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }
        table button:hover {
          color: #e53935;
        }
        /* Styles for total and buy section */
        .total-buy-section {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-top: 20px;
        }
        .total {
          font-weight: bold;
          font-size: 1.5rem;
          color: #FF9800;
          }
        .summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #fff;
          padding: 15px 20px;
          border-radius: 12px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .summary button {
          background: #FF9800;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 12px 20px;
          font-size: 1rem;
          cursor: pointer;
        }
        .summary button:hover {
          background: #e68a00;
        }
        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #FF9800;
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          opacity: 0.95;
          animation: slideIn 0.3s ease forwards;
        }
        .toast.error { background: #e53935; }
        .toast.success { background: #43a047; }
        .toast.warning { background: #fb8c00; }
        @keyframes slideIn {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 0.95; }
        }
        @media (max-width: 600px) {
          .dropdown-container {
            flex-direction: column;
            align-items: flex-start;
          }
          .summary {
            flex-direction: column;
            gap: 10px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
