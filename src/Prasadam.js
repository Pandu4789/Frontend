import React, { useState } from 'react';

const categories = ['Sweets', 'Rice', 'Drinks'];

const items = {
  Sweets: [
    { id: 1, name: 'Laddoo', price: 10, image: 'https://via.placeholder.com/150?text=Laddoo', desc: 'Delicious laddoo' },
    { id: 2, name: 'Halwa', price: 15, image: 'https://via.placeholder.com/150?text=Halwa', desc: 'Sweet halwa' },
  ],
  Rice: [
    { id: 3, name: 'Biryani', price: 50, image: 'https://via.placeholder.com/150?text=Biryani', desc: 'Tasty biryani' },
    { id: 4, name: 'Fried Rice', price: 40, image: 'https://via.placeholder.com/150?text=Fried+Rice', desc: 'Fried rice special' },
  ],
  Drinks: [
    { id: 5, name: 'Coke', price: 20, image: 'https://via.placeholder.com/150?text=Coke', desc: 'Cold drink' },
    { id: 6, name: 'Juice', price: 25, image: 'https://via.placeholder.com/150?text=Juice', desc: 'Fresh juice' },
  ],
};

export default function Prasadam() {
  const [selectedCategory, setSelectedCategory] = useState('Sweets');
  const [cart, setCart] = useState({});
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
  };

  const removeItem = (item) => {
    setCart((prev) => {
      if (!prev[item.id]) return prev;
      const newQty = prev[item.id].qty - 1;
      if (newQty <= 0) {
        const newCart = { ...prev };
        delete newCart[item.id];
        return newCart;
      }
      return { ...prev, [item.id]: { ...item, qty: newQty } };
    });
  };

  const deleteItem = (id) => {
    const newCart = { ...cart };
    delete newCart[id];
    setCart(newCart);
  };

  const totalCount = Object.values(cart).reduce((acc, i) => acc + i.qty, 0);
  const totalPrice = Object.values(cart).reduce((acc, i) => acc + i.qty * i.price, 0);

  const styles = {
    container: { fontFamily: 'Arial, sans-serif', maxWidth: 1000, margin: '0 auto', padding: 20 },
    topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    menuButton: (active) => ({
      marginRight: 10,
      padding: '8px 12px',
      border: 'none',
      borderRadius: 5,
      background: active ? '#007bff' : '#ddd',
      color: active ? 'white' : 'black',
      cursor: 'pointer'
    }),
    cartIcon: { position: 'relative', fontSize: 24, cursor: 'pointer' },
    badge: { position: 'absolute', top: -5, right: -8, background: 'red', color: 'white', fontSize: 12, padding: '2px 6px', borderRadius: '50%' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 },
    card: { border: '1px solid #ccc', borderRadius: 10, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
    productImage: { width: '100%', height: 150, objectFit: 'cover' },
    content: { padding: 12, display: 'flex', flexDirection: 'column', flexGrow: 1 },
    itemName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },
    desc: { fontSize: 13, color: '#666', marginBottom: 8 },
    price: { fontWeight: 'bold', fontSize: 14, color: '#333', marginBottom: 12 },
    addButton: {
      width: '90%',
      padding: 10,
      background: '#28a745',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      borderRadius: 8,
      fontSize: 14,
      margin: '0 auto 12px'
    },
    qtyControl: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      margin: '0 auto 12px'
    },
    qtyButtonSmall: {
      width: 30,
      height: 30,
      fontSize: 18,
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: 5,
      cursor: 'pointer'
    },
    sideDrawer: (open) => ({
      position: 'fixed',
      top: 0,
      right: open ? 0 : -320,
      width: 300,
      height: '100%',
      background: '#fff',
      boxShadow: '-2px 0 8px rgba(0,0,0,0.3)',
      padding: 10,
      transition: 'right 0.3s ease',
      zIndex: 1000
    }),
    closeBtn: { background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', float: 'right' },
    cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cartQty: { display: 'flex', alignItems: 'center' },
    qtyButton: { width: 30, height: 30, fontSize: 18, margin: '0 5px' },
    removeBtn: { background: 'none', border: 'none', color: 'red', fontSize: 12, cursor: 'pointer' },
    checkoutBtn: { width: '100%', padding: 10, background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 5 }
  };

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          {categories.map((cat) => (
            <button
              key={cat}
              style={styles.menuButton(cat === selectedCategory)}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div style={styles.cartIcon} onClick={() => setIsCartOpen(true)}>
          🛒
          {totalCount > 0 && <span style={styles.badge}>{totalCount}</span>}
        </div>
      </div>

      <div style={styles.grid}>
        {items[selectedCategory].map((item) => (
          <div key={item.id} style={styles.card}>
            <img src={item.image} alt={item.name} style={styles.productImage} />
            <div style={styles.content}>
              <div style={styles.itemName}>{item.name}</div>
              <div style={styles.desc}>{item.desc}</div>
              <div style={styles.price}>₹{item.price}</div>
            </div>
            {cart[item.id]?.qty ? (
              <div style={styles.qtyControl}>
                <button style={styles.qtyButtonSmall} onClick={() => removeItem(item)}>-</button>
                <span>{cart[item.id].qty}</span>
                <button style={styles.qtyButtonSmall} onClick={() => addItem(item)}>+</button>
              </div>
            ) : (
              <button style={styles.addButton} onClick={() => addItem(item)}>Add to Cart</button>
            )}
          </div>
        ))}
      </div>

      <div style={styles.sideDrawer(isCartOpen)}>
        <button style={styles.closeBtn} onClick={() => setIsCartOpen(false)}>✕</button>
        <h3>Your Cart</h3>
        {Object.values(cart).length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <div>
            {Object.values(cart).map((item) => (
              <div key={item.id} style={styles.cartItem}>
                <span>{item.name}</span>
                <div style={styles.cartQty}>
                  <button style={styles.qtyButton} onClick={() => removeItem(item)}>-</button>
                  <span>{item.qty}</span>
                  <button style={styles.qtyButton} onClick={() => addItem(item)}>+</button>
                </div>
                <span>₹{item.qty * item.price}</span>
                <button style={styles.removeBtn} onClick={() => deleteItem(item.id)}>Remove</button>
              </div>
            ))}
            <h4>Total: ₹{totalPrice}</h4>
            <button style={styles.checkoutBtn}>Checkout</button>
          </div>
        )}
      </div>
    </div>
  );
}
