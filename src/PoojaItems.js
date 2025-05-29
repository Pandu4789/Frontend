import React, { useState, useEffect, useMemo } from 'react';
import { FaTrash } from 'react-icons/fa';
import './PoojaItems.css';

const PoojaItems = () => {
  const [events, setEvents] = useState([]);
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
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
          setOriginalItems(data);
          setItems(itemsWithQuantity);
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
       setItems(prev =>
      prev.map(item => {
        const originalItem = originalItems.find(ori => ori.id === item.id);
        return {
          ...item,
          quantity: originalItem ? originalItem.quantity || 1 : 1,
        };
      })
    );

  }, 1000);
  };

  const totalPrice = useMemo(() =>
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2),
    [items]
  );

  const selectedEvent = events.find(e => e.id === parseInt(selectedEventId));

  const handlePrintItems = () => {
    if (!originalItems.length) return;

    const printContent = `
      <html>
        <head>
          <title>Print Items for ${selectedEvent?.name || ''}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              color: black;
            }
            h2 {
              text-align: center;
              color: #333;
            }
            ul {
              list-style-type: disc;
              padding-left: 20px;
              font-size: 1rem;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <h2>Items List for ${selectedEvent?.name || ''}</h2>
          <ul>
            ${originalItems.map(item => `<li>${item.itemName} - ${item.quantity}</li>`).join('')}
          </ul>
        </body>
      </html>`;

    const printWindow = window.open('', '', 'width=600,height=600');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        {/* <h1>Pooja Items</h1> */}
        <p>Select an event to see the recommended items.</p>
      </div>

      <div className="dropdown-container" style={{ marginBottom: '20px' }}>
        <label htmlFor="eventSelect">Select Event:</label>
        <select
          id="eventSelect"
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          style={{ width: '200px', padding: '5px' }}
        >
          <option value="">-- Select Event --</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>{event.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 3, minWidth: '60%' }}>
          <div className="card" style={{
  position: 'relative',
  backgroundColor: 'white',           // 👈 sets background color to white
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)' // Optional for a subtle shadow
}}>

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
                    <td>${item.unitPrice}</td>
                    <td>${(item.unitPrice * item.quantity).toFixed(2)}</td>
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

            <div style={{ marginTop: '15px', textAlign: 'right' }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                Total: ₹{totalPrice}
              </div>
              <button onClick={handleBuyItems} disabled={isBuying} className="buy-button">
                <span style={{ marginRight: '8px' }}>🛒</span> {isBuying ? 'Processing...' : 'Buy Items'}
              </button>
            </div>
          </div>
        </div>

        {selectedEvent && (
          <div style={{ flex: 2, minWidth: '35%' }}>
            <div className="card" style={{
  position: 'relative',
  backgroundColor: 'white',           // 👈 sets background color to white
  borderRadius: '10px',
  padding: '20px',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)' // Optional for a subtle shadow
}}>

              <h3>Items list for {selectedEvent.name}:</h3>

              {/* Print Text + Icon */}
              <div
                onClick={handlePrintItems}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'black',
                  fontWeight: '500'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="18"
                  width="18"
                  viewBox="0 0 24 24"
                  fill="black"
                >
                  <path d="M19 8H5c-1.1 0-2 .9-2 2v6h4v4h10v-4h4v-6c0-1.1-.9-2-2-2zm-3 10H8v-4h8v4zm3-6c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zM18 3H6v4h12V3z" />
                </svg>
                <span>Print</span>
              </div>

              <ul>
                {originalItems.map(item => (
                  <li key={item.id}>{item.itemName} - {item.quantity}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
};

export default PoojaItems;
