import React, { useEffect, useState } from 'react';
import './Prasadam.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Prasadam = () => {
  const [items, setItems] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8080/api/prasadam')
      .then(res => res.json())
      .then(data => setItems(data))
      .catch(err => console.error('Error fetching prasadam:', err));
  }, []);

  const addToCart = (item) => {
    const exists = cartItems.find(i => i.id === item.id);
    if (!exists) {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(i => i.id !== id));
  };

 const updateQuantity = (id, qty) => {
  if (qty <= 0) {
    // Remove the item if quantity is 0 or less
    setCartItems(cartItems.filter(i => i.id !== id));
  } else {
    setCartItems(cartItems.map(i => (i.id === id ? { ...i, quantity: qty } : i)));
  }
};


  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const checkout = () => {
    if (cartItems.length === 0) {
      toast.warn("Cart is empty!");
      return;
    }
    // Here you could also send data to the backend for order placement
    toast.success("Order placed successfully!");
    setCartItems([]);
    setIsCartOpen(false);
  };

  const filteredItems = categoryFilter === 'All'
    ? items
    : items.filter(item => item.category === categoryFilter);

  const categories = ['All', ...new Set(items.map(i => i.category))];

  return (
    <div className="prasadam-container">
      <ToastContainer position="top-right" />
      {/* <h1>Prasadam</h1> */}
      <div className="filter-container">
        <div className="category-buttons">
  {categories.map(cat => (
    <button
      key={cat}
      className={categoryFilter === cat ? 'active' : ''}
      onClick={() => setCategoryFilter(cat)}
    >
      {cat}
    </button>
  ))}
</div>

        <div className="cart-icon" onClick={() => setIsCartOpen(true)}>
  🛒
  {cartItems.length > 0 && (
    <span className="cart-count">
      {cartItems.reduce((total, item) => total + item.quantity, 0)}
    </span>
  )}
</div>
      </div>


      <div className="prasadam-grid">
        {filteredItems.map(item => (
          <div
            key={item.id}
            className={`prasadam-item ${!item.available ? 'unavailable' : ''}`}
          >
            <img src={item.imageUrl} alt={item.name} />
            <h3>{item.name}</h3>
            <small>{item.description}</small>
            <p>${item.price}</p>
            {item.available ? (
  (() => {
    const cartItem = cartItems.find(i => i.id === item.id);
    return cartItem ? (
      <div className="quantity-controls">
        <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} disabled={cartItem.quantity <= 0}>-</button>
        <span>{cartItem.quantity}</span>
        <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>+</button>
      </div>
    ) : (
      <button onClick={() => addToCart(item)}>Add to Cart</button>
    );
  })()
) : (
  <div className="unavailable-overlay">Currently Unavailable</div>
)}

          </div>
        ))}
      </div>

      {isCartOpen && (
        <div className="cart-drawer">
          <h2>Your Cart</h2>
          <button className="close-cart" onClick={() => setIsCartOpen(false)}>✖</button>
          {cartItems.length === 0 ? (
            <p>No items in cart.</p>
          ) : (
            <>
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <span>{item.name}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                  />
                  <span>${item.quantity * item.price}</span>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              ))}
              <div className="cart-total">
                <strong>Total: ${getTotal()}</strong>
                <button className="checkout-btn" onClick={checkout}>Checkout</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Prasadam;
