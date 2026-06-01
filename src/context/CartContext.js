import React, { createContext, useState, useContext, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToCart = useCallback((vehicle) => {
    setCartItems(prev => {
      const exists = prev.find(item => item._id === vehicle._id);
      let newCart;
      if (exists) {
        newCart = prev.map(item =>
          item._id === vehicle._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        newCart = [...prev, { ...vehicle, quantity: 1 }];
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  }, []);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;