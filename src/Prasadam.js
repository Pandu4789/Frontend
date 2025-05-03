import React, { useState, useMemo, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import { FaCartPlus, FaShoppingCart } from 'react-icons/fa';

const prasadamItems = [
  { id: 1, name: 'Laddoo', price: 10, quantityType: 'number' },
  { id: 2, name: 'Curry', price: 300, quantityType: 'tray' },
  { id: 3, name: 'Rice', price: 250, quantityType: 'tray' },
  { id: 4, name: 'Milk', price: 50, quantityType: 'ml' },
];

const trayOptions = ['Full Tray', 'Half Tray'];
const mlOptions = ['100ml', '200ml', '500ml'];

const Prasadams = () => {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [isBuying, setIsBuying] = useState(false);

  const selectedItem = prasadamItems.find(item => item.id === parseInt(selectedItemId));

  const handleAddToCart = () => {
    if (!selectedItem) {
      setToast({ type: 'warning', message: 'Please select an item!' });
      return;
    }
    if (!selectedQuantity || selectedQuantity === '') {
      setToast({ type: 'warning', message: 'Please select quantity!' });
      return;
    }

    // Check if already in cart → update quantity
    setCart(prev => {
      const existing = prev.find(i => i.id === selectedItem.id && i.quantityLabel === selectedQuantity);
      if (existing) {
        return prev.map(i =>
          i.id === selectedItem.id && i.quantityLabel === selectedQuantity
            ? { ...i, quantityCount: i.quantityCount + 1 }
            : i
        );
      } else {
        return [...prev, {
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantityType: selectedItem.quantityType,
          quantityLabel: selectedQuantity,
          quantityCount: 1
        }];
      }
    });

    setToast({ type: 'success', message: `${selectedItem.name} added to cart!` });
  };

  const handleRemove = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const totalPrice = useMemo(() =>
    cart.reduce((sum, item) => {
      let multiplier = 1;
      if (item.quantityType === 'tray') multiplier = item.quantityLabel === 'Full Tray' ? 1 : 0.5;
      else if (item.quantityType === 'ml') multiplier = parseInt(item.quantityLabel.replace('ml', '')) / 100;
      else multiplier = item.quantityLabel;
      return sum + item.price * multiplier * item.quantityCount;
    }, 0).toFixed(2),
    [cart]
  );

  const handleBuy = () => {
    if (cart.length === 0) {
      setToast({ type: 'warning', message: 'Cart is empty!' });
      return;
    }
    setIsBuying(true);
    setTimeout(() => {
      setIsBuying(false);
      setCart([]);
      setToast({ type: 'success', message: 'Purchase successful!' });
    }, 1000);
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="prasadam-container">
      <header className="prasadam-header">
        <h1>Prasadam Selection</h1>
        <p className="subtitle">Choose from our divine offerings</p>
      </header>

      <div className="selection-panel">
        <div className="input-group">
          <label htmlFor="prasadam-select">Select Prasadam</label>
          <select 
            id="prasadam-select"
            value={selectedItemId} 
            onChange={e => { setSelectedItemId(e.target.value); setSelectedQuantity(1); }}
          >
            <option value="">Choose an item...</option>
            {prasadamItems.map(item => (
              <option key={item.id} value={item.id}>
                {item.name} (₹{item.price})
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="quantity-selector">
            <h3>Select Quantity</h3>
            <div className="quantity-options">
              {selectedItem.quantityType === 'number' && (
                <div className="number-input">
                  <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}>-</button>
                  <input 
                    type="number" 
                    value={selectedQuantity}
                    onChange={e => setSelectedQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button onClick={() => setSelectedQuantity(selectedQuantity + 1)}>+</button>
                </div>
              )}

              {selectedItem.quantityType === 'tray' && (
                <div className="button-group">
                  {trayOptions.map(opt => (
                    <button
                      key={opt}
                      className={selectedQuantity === opt ? 'active' : ''}
                      onClick={() => setSelectedQuantity(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {selectedItem.quantityType === 'ml' && (
                <select 
                  value={selectedQuantity} 
                  onChange={e => setSelectedQuantity(e.target.value)}
                  className="ml-select"
                >
                  {mlOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>
            
            <button 
              className="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              <FaCartPlus /> Add to Cart
            </button>
          </div>
        )}
      </div>

      <div className="cart-section">
        <h2>Shopping Cart ({cart.length})</h2>
        
        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map((item, idx) => {
               const subtotal = (item.price * (item.selectedQuantityValue || 1) * item.quantityCount).toFixed(2);

                
                return (
                  <div key={idx} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <div className="item-details">
                        <span className="quantity-type">{item.quantityLabel}</span>
                        <span className="multiplier">× {item.quantityCount}</span>
                      </div>
                    </div>
                    
                    <div className="item-price">
                      <span className="subtotal">₹{subtotal}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemove(idx)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-summary">
              <div className="total-price">
                <span>Total:</span>
                <span>₹{totalPrice}</span>
              </div>
              
              <button 
                className="checkout-btn"
                onClick={handleBuy}
                disabled={isBuying}
              >
                <FaShoppingCart />
                {isBuying ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      <style jsx>{`
        .prasadam-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .prasadam-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .prasadam-header h1 {
          color: #2c3e50;
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .subtitle {
          color: #7f8c8d;
          font-size: 1.1rem;
        }

        .selection-panel {
          background: #ffffff;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }

        .input-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          color: #34495e;
          font-weight: 500;
        }

        select, input {
          width: 100%;
          padding: 0.8rem;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        select:focus, input:focus {
          outline: none;
          border-color: #3498db;
        }

        .quantity-selector {
          border-top: 1px solid #eee;
          padding-top: 1.5rem;
        }

        .quantity-selector h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .number-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .number-input button {
          padding: 0.5rem 1rem;
          border: 2px solid #3498db;
          background: none;
          color: #3498db;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }

        .number-input button:hover {
          background: #3498db;
          color: white;
        }

        .number-input input {
          width: 80px;
          text-align: center;
          padding: 0.6rem;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
        }

        .button-group button {
          flex: 1;
          padding: 0.8rem;
          border: 2px solid #e0e0e0;
          background: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .button-group button.active {
          border-color: #3498db;
          background: #3498db;
          color: white;
        }

        .add-to-cart-btn {
          margin-top: 1.5rem;
          width: 100%;
          padding: 1rem;
          background: #2ecc71;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background 0.3s ease;
        }

        .add-to-cart-btn:hover {
          background: #27ae60;
        }

        .cart-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .cart-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        .empty-cart {
          text-align: center;
          padding: 2rem;
          color: #7f8c8d;
        }

        .cart-items {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .item-info h4 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .item-details {
          display: flex;
          gap: 1rem;
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .item-price {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .subtotal {
          font-weight: 600;
          color: #2ecc71;
        }

        .remove-btn {
          background: none;
          border: none;
          color: #e74c3c;
          cursor: pointer;
          padding: 0.5rem;
          display: flex;
          transition: color 0.3s ease;
        }

        .remove-btn:hover {
          color: #c0392b;
        }

        .cart-summary {
          border-top: 2px solid #eee;
          padding-top: 2rem;
        }

        .total-price {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .checkout-btn {
          width: 100%;
          padding: 1rem;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: background 0.3s ease;
        }

        .checkout-btn:hover {
          background: #2980b9;
        }

        .checkout-btn:disabled {
          background: #95a5a6;
          cursor: not-allowed;
        }

        .toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: 1rem 2rem;
          border-radius: 8px;
          color: white;
          font-weight: 500;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .toast.success {
          background: #2ecc71;
        }

        .toast.warning {
          background: #e67e22;
        }

        @media (max-width: 768px) {
          .prasadam-container {
            padding: 1rem;
          }
          
          .number-input {
            width: 100%;
          }
          
          .button-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Prasadams;
