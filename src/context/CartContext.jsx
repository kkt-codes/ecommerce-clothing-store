// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useBuyerAuth } from '../hooks/useBuyerAuth'; // To associate cart with logged-in buyer

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { buyerData } = useBuyerAuth(); // Get current buyer

  // --- Persisting Cart to localStorage ---
  // Load cart from localStorage when component mounts or buyer changes
  useEffect(() => {
    if (buyerData) {
      const storedCart = localStorage.getItem(`cart_${buyerData.id}`);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      } else {
        setCartItems([]); // No cart for this buyer, or clear previous guest cart
      }
    } else {
      // Handle guest cart (optional, for now, let's clear if no buyer)
      // For a guest cart, you might use a generic key like 'guest_cart'
      const storedGuestCart = localStorage.getItem('guest_cart');
      if (storedGuestCart) {
        setCartItems(JSON.parse(storedGuestCart));
      } else {
        setCartItems([]);
      }
    }
  }, [buyerData]);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (buyerData) {
      localStorage.setItem(`cart_${buyerData.id}`, JSON.stringify(cartItems));
      localStorage.removeItem('guest_cart'); // Clear guest cart if user logs in
    } else {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, buyerData]);


  const addToCart = (product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // If item doesn't exist, add it to the cart
        return [...prevItems, { ...product, quantity }];
      }
    });
    // We'll add a toast notification here later
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeFromCart(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};