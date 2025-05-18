// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBuyerAuth } from '../hooks/useBuyerAuth'; 
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { buyerData, isAuthenticated } = useBuyerAuth();

  // Load cart from localStorage or merge guest cart on login
  useEffect(() => {
    let loadedCart = [];
    if (isAuthenticated && buyerData?.id) {
      // User is logged in
      const buyerCartKey = `cart_${buyerData.id}`;
      const storedBuyerCartString = localStorage.getItem(buyerCartKey);
      let buyerCartItems = storedBuyerCartString ? JSON.parse(storedBuyerCartString) : [];

      const guestCartString = localStorage.getItem('guest_cart');
      if (guestCartString) {
        const guestCartItems = JSON.parse(guestCartString);
        if (guestCartItems.length > 0) {
          // Merge guest cart into buyer's cart
          const mergedCart = [...buyerCartItems];
          guestCartItems.forEach(guestItem => {
            const existingItemIndex = mergedCart.findIndex(item => item.id === guestItem.id);
            if (existingItemIndex > -1) {
              // Item exists, update quantity (e.g., sum or take guest's, let's sum for now)
              mergedCart[existingItemIndex].quantity += guestItem.quantity;
            } else {
              // Item doesn't exist, add it
              mergedCart.push(guestItem);
            }
          });
          buyerCartItems = mergedCart;
          toast.success("Guest cart items have been merged into your account cart!");
        }
        localStorage.removeItem('guest_cart'); // Clear guest cart after merging or if empty
      }
      loadedCart = buyerCartItems;
      // Save the potentially merged cart back to the buyer's storage
      localStorage.setItem(buyerCartKey, JSON.stringify(loadedCart));

    } else {
      // User is a guest or logged out
      const guestCartString = localStorage.getItem('guest_cart');
      loadedCart = guestCartString ? JSON.parse(guestCartString) : [];
    }
    setCartItems(loadedCart);
  }, [isAuthenticated, buyerData]); // Effect runs on auth state change

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    try {
      if (isAuthenticated && buyerData?.id) {
        localStorage.setItem(`cart_${buyerData.id}`, JSON.stringify(cartItems));
      } else {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
      }
    } catch (error) {
        console.error("Error saving cart to localStorage:", error);
        // Potentially notify user if storage is full or unavailable
    }
  }, [cartItems, isAuthenticated, buyerData]);


  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    // Toast notification is handled in ProductCard/ProductDetails
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    // Toast notification handled where this is called (e.g., Cart.jsx)
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId); // This will trigger its own toast if called from Cart.jsx
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [removeFromCart]); // Added removeFromCart to dependencies

  const clearCart = useCallback(() => {
    setCartItems([]);
    // Toast notification handled where this is called (e.g., Cart.jsx)
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cartItems]);

  const getItemCount = useCallback(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

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
