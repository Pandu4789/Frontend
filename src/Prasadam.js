import React, { useEffect, useState } from 'react';
import './Prasadam.css'; // All styles will go here
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaShoppingCart, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'; // Added FaShoppingCart, FaTimes, FaMapMarkerAlt

const Prasadam = () => {
  // New state for restaurant selection
  const [restaurantsList, setRestaurantsList] = useState([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [currentMenu, setCurrentMenu] = useState([]); // This will hold items for the selected restaurant

  // Existing state for cart, filters, etc.
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Dummy data for restaurants and their menus (replace with API calls in a real app)
  const allRestaurantsData = [
    {
      id: 'rest1',
      name: 'Divine Delights Kitchen',
      location: '123 Temple Road, Austin',
      description: 'Authentic South Indian Prasadam and traditional dishes.',
      imageUrl: 'https://via.placeholder.com/600x400/F0D55C/4A2000?text=Divine+Delights',
      categories: ['All', 'Sweets', 'Savories', 'Meals', 'Drinks']
    },
    {
      id: 'rest2',
      name: 'Bhakti Bhojan Temple Canteen',
      location: '456 Sacred Lane, Austin',
      description: 'Traditional North Indian Thali and daily special offerings.',
      imageUrl: 'https://via.placeholder.com/600x400/4A2000/FFD700?text=Bhakti+Bhojan',
      categories: ['All', 'Sweets', 'Thali', 'Snacks']
    },
    {
        id: 'rest3',
        name: 'Ananda Food Hub',
        location: '789 Harmony Street, Austin',
        description: 'Freshly prepared healthy and sattvic meals.',
        imageUrl: 'https://via.placeholder.com/600x400/B74F2F/FDF5E6?text=Ananda+Food+Hub',
        categories: ['All', 'Meals', 'Juices', 'Sweets']
    }
  ];

  const allMenusData = {
    'rest1': [
      { id: 'item1', name: 'Laddu (2 pcs)', category: 'Sweets', price: 50, imageUrl: 'https://via.placeholder.com/150/FDEBC1?text=Laddu', available: true, description: 'Classic sweet made with gram flour and ghee.' },
      { id: 'item2', name: 'Puliyodharai Rice', category: 'Meals', price: 120, imageUrl: 'https://via.placeholder.com/150/4A2000?text=Puliyodharai', available: true, description: 'Tangy tamarind rice, South Indian style.' },
      { id: 'item3', name: 'Medu Vada (2 pcs)', category: 'Savories', price: 60, imageUrl: 'https://via.placeholder.com/150/B74F2F?text=Medu+Vada', available: true, description: 'Crispy lentil fritters, perfect with chutney.' },
      { id: 'item4', name: 'Sakkarai Pongal', category: 'Sweets', price: 80, imageUrl: 'https://via.placeholder.com/150/FFD700?text=Sakkarai+Pongal', available: false, description: 'Sweet rice pudding with jaggery.' },
      { id: 'item5', name: 'Lemon Rice', category: 'Meals', price: 100, imageUrl: 'https://via.placeholder.com/150/FDF5E6?text=Lemon+Rice', available: true, description: 'Flavorful rice with lemon and spices.' },
      { id: 'item6', name: 'Filter Coffee', category: 'Drinks', price: 40, imageUrl: 'https://via.placeholder.com/150/8E2DE2?text=Filter+Coffee', available: true, description: 'Traditional South Indian coffee.' },
    ],
    'rest2': [
      { id: 'item7', name: 'Gajar Halwa', category: 'Sweets', price: 70, imageUrl: 'https://via.placeholder.com/150/4A2000?text=Gajar+Halwa', available: true, description: 'Carrot pudding, rich and creamy.' },
      { id: 'item8', name: 'Punjabi Thali', category: 'Thali', price: 180, imageUrl: 'https://via.placeholder.com/150/FFD700?text=Punjabi+Thali', available: true, description: 'Assorted North Indian breads, curries, and rice.' },
      { id: 'item9', name: 'Samosa (1 pc)', category: 'Snacks', price: 25, imageUrl: 'https://via.placeholder.com/150/B74F2F?text=Samosa', available: true, description: 'Crispy pastry with spiced potato filling.' },
      { id: 'item10', name: 'Lassi (Sweet)', category: 'Drinks', price: 60, imageUrl: 'https://via.placeholder.com/150/FDEBC1?text=Lassi', available: true, description: 'Refreshing yogurt drink.' },
    ],
    'rest3': [
      { id: 'item11', name: 'Yoga Bowl', category: 'Meals', price: 160, imageUrl: 'https://via.placeholder.com/150/FDF5E6?text=Yoga+Bowl', available: true, description: 'Balanced meal with grains, veggies, and protein.' },
      { id: 'item12', name: 'Fresh Fruit Juice', category: 'Juices', price: 70, imageUrl: 'https://via.placeholder.com/150/8E2DE2?text=Fresh+Juice', available: true, description: 'Seasonal fresh fruit juice.' },
      { id: 'item13', name: 'Oats Laddu', category: 'Sweets', price: 45, imageUrl: 'https://via.placeholder.com/150/F0D55C?text=Oats+Laddu', available: true, description: 'Healthy sweet treat with oats.' },
    ]
  };

  // Effect to load restaurants initially (simulated API call)
  useEffect(() => {
    // In a real app, you'd fetch from: fetch('http://localhost:8080/api/restaurants')
    setRestaurantsList(allRestaurantsData);
  }, []);

  // Effect to load menu when a restaurant is selected (simulated API call)
  useEffect(() => {
    if (selectedRestaurantId) {
      // In a real app: fetch(`http://localhost:8080/api/restaurants/${selectedRestaurantId}/menu`)
      const menu = allMenusData[selectedRestaurantId];
      setCurrentMenu(menu || []);
      setCategoryFilter('All'); // Reset category filter when menu changes
    } else {
      setCurrentMenu([]);
    }
    setCartItems([]); // Clear cart when restaurant changes
    setIsCartOpen(false); // Close cart when restaurant changes
  }, [selectedRestaurantId]);


  const addToCart = (item) => {
    const exists = cartItems.find(i => i.id === item.id);
    if (exists) {
      updateQuantity(item.id, exists.quantity + 1);
    } else {
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
      toast.success(`${item.name || 'Item'} added to cart!`);
    }
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(i => i.id !== id));
    toast.info("Item removed from cart.");
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      setCartItems(cartItems.filter(i => i.id !== id));
      toast.info("Item removed from cart.");
    } else {
      setCartItems(cartItems.map(i => (i.id === id ? { ...i, quantity: qty } : i)));
    }
  };

  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.price || 0), 0).toFixed(2);
  };

  const checkout = () => {
    if (cartItems.length === 0) {
      toast.warn("Cart is empty!");
      return;
    }
    // Here you could send data to the backend for order placement
    toast.success("Order placed successfully!");
    setCartItems([]);
    setIsCartOpen(false);
  };

  // Filter items based on currentMenu and selected category
  const filteredItems = categoryFilter === 'All'
    ? currentMenu
    : currentMenu.filter(item => item.category === categoryFilter);

  // Categories are now derived from the current menu of the selected restaurant
  const currentCategories = selectedRestaurantId
    ? ['All', ...new Set(allMenusData[selectedRestaurantId]?.map(i => i.category) || [])]
    : [];

  const selectedRestaurant = restaurantsList.find(r => r.id === selectedRestaurantId);

  return (
    <div className="prasadam-main-wrapper">
      <ToastContainer position="top-right" />

      {/* --- Conditional Rendering: Restaurant Selection OR Menu Display --- */}
      {!selectedRestaurantId ? (
        /* --- Restaurant Selection View --- */
        <div className="restaurant-selection-container">
          <div className="prasadam-header">
            <h1>Select Your Divine Kitchen</h1>
            <p>Choose a restaurant to explore their menu and offerings.</p>
          </div>
          <div className="restaurant-grid">
            {restaurantsList.map(restaurant => (
              <div
                key={restaurant.id}
                className="restaurant-card"
                onClick={() => setSelectedRestaurantId(restaurant.id)}
              >
                <img src={restaurant.imageUrl} alt={restaurant.name} className="restaurant-image" />
                <div className="restaurant-info">
                  <h3 className="restaurant-name">{restaurant.name}</h3>
                  <p className="restaurant-description">{restaurant.description}</p>
                  <span className="restaurant-location">
                    <FaMapMarkerAlt /> {restaurant.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* --- Menu Display View (after restaurant selected) --- */
        <div className="prasadam-container">
          <div className="prasadam-header menu-header">
            <h1 className="menu-title">{selectedRestaurant?.name} Menu</h1>
            <p className="menu-location"><FaMapMarkerAlt /> {selectedRestaurant?.location}</p>
            <button className="back-to-restaurants-btn" onClick={() => setSelectedRestaurantId(null)}>
              ← Back to Restaurants
            </button>
          </div>

          <div className="filter-and-cart-bar">
            <div className="category-buttons">
              {currentCategories.map(cat => (
                <button
                  key={cat}
                  className={`category-btn ${categoryFilter === cat ? 'active' : ''}`}
                  onClick={() => setCategoryFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="cart-icon-wrapper" onClick={() => setIsCartOpen(true)}>
              <FaShoppingCart className="cart-icon" />
              {cartItems.length > 0 && (
                <span className="cart-count">
                  {cartItems.reduce((total, item) => total + (item.quantity || 0), 0)}
                </span>
              )}
            </div>
          </div>


          <div className="prasadam-grid">
            {filteredItems.length > 0 ? filteredItems.map(item => (
              <div
                key={item.id}
                className={`prasadam-item-card ${!item.available ? 'unavailable' : ''}`}
              >
                <div className="prasadam-image-wrapper">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name || 'Prasadam Item'} className="prasadam-image" />
                  ) : (
                    <div className="prasadam-image-placeholder">No Image</div>
                  )}
                  {!item.available && <div className="unavailable-overlay">Unavailable</div>}
                </div>
                <div className="prasadam-info">
                  <h3 className="item-name">{item.name || 'Unknown Item'}</h3>
                  <small className="item-description">{item.description || 'No description.'}</small>
                  <p className="item-price">₹{(item.price || 0).toFixed(2)}</p>
                  {item.available ? (
                    (() => {
                      const cartItem = cartItems.find(i => i.id === item.id);
                      return cartItem ? (
                        <div className="quantity-controls-in-card">
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)} className="quantity-btn">-</button>
                          <span className="quantity-display">{cartItem.quantity || 0}</span>
                          <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)} className="quantity-btn">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)} className="add-to-cart-btn">Add to Cart</button>
                      );
                    })()
                  ) : (
                    <button className="add-to-cart-btn disabled" disabled>Unavailable</button>
                  )}
                </div>
              </div>
            )) : (
                <p className="no-items-message">No items available for this category or restaurant.</p>
            )}
          </div>
        </div>
      )}

      {/* --- Cart Drawer --- */}
      {isCartOpen && (
        <div className="cart-drawer-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <h2>Your Cart</h2>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                <FaTimes />
              </button>
            </div>
            {cartItems.length === 0 ? (
              <p className="cart-empty-message">No items in cart.</p>
            ) : (
              <>
                <div className="cart-items-list">
                  {cartItems.map(item => (
                    <div key={item.id} className="cart-item">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name || 'Prasadam Item'} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-placeholder cart-list-placeholder"></div>
                      )}
                      <div className="cart-item-details">
                        <span className="cart-item-name">{item.name || 'Unknown Item'}</span>
                        <span className="cart-item-price">₹{(item.price || 0).toFixed(2)}</span>
                      </div>
                      <div className="cart-item-controls">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || 0}
                          onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                          className="cart-quantity-input"
                        />
                        <button onClick={() => removeFromCart(item.id)} className="cart-remove-btn">Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-summary-total">
                  <strong>Total: ₹{getTotal()}</strong>
                  <button className="checkout-btn" onClick={checkout}>Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Prasadam;