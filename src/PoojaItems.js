import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash } from 'react-icons/fa';
import './PoojaItems.css';

const PoojaItems = () => {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]); // Added for bullet list
  const [selectedEventId, setSelectedEventId] = useState('');
  const [toast, setToast] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetch(`http://localhost:8080/api/pooja-items/event/${selectedEventId}`)
        .then(res => res.json())
        .then(data => {
          const itemsWithQuantity = data.map(item => ({
            ...item,
            quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          }));
          setOriginalItems(data); // Store original for bullet list
          setItems(itemsWithQuantity); // Editable table copy
        })
        .catch(err => console.error('Error fetching pooja items:', err));
    } else {
      setItems([]);
      setOriginalItems([]);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

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
      prev.map(item => (item.id === id ? { ...item, quantity: 0 } : item))
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

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2),
    [items]
  );

  const selectedEvent = events.find(e => e.id === parseInt(selectedEventId));

  return (
    <div className="container" style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <h1>Pooja Items</h1>
        <p>Select an event to see the recommended items.</p>
      </div>

      {/* Event Dropdown */}
      <div className="dropdown-container">
        <label htmlFor="eventSelect">Select Event:</label>
        <select
          id="eventSelect"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
        >
          <option value="">-- Select Event --</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      {/* Main Content */}
      <div style={{ display: 'flex', gap: '40px' }}>
        {/* Table Section */}
        <div style={{ flex: 3 }}>
          <h2>Recommended Items</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
              {items.length > 0 ? items.map((item) => (
                <tr key={item.id}>
                  <td>{item.itemName}</td>
                  <td>
                    <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                    <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                  </td>
                  <td>₹{item.unitPrice}</td>
                  <td>₹{(item.unitPrice * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="trash-button" onClick={() => handleRemoveItem(item.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '10px' }}>
                    {selectedEventId ? 'No items available for this event.' : 'Select an event to load items.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total and Buy Button */}
          <div style={{ marginTop: '15px', textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
              Total: ₹{totalPrice}
            </div>
            <button onClick={handleBuyItems} disabled={isBuying} className="buy-button">
              <span style={{ marginRight: '8px' }}>🛒</span> {isBuying ? 'Processing...' : 'Buy Items'}
            </button>
          </div>
        </div>

        {/* Bullet List Section */}
        {selectedEvent && (
          <div style={{ flex: 2 }}>
            <h3>Items list for {selectedEvent.name}:</h3>
            <ul>
              {originalItems.map(item => (
                <li key={item.id}>{item.itemName} - {item.quantity}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default PoojaItems;
