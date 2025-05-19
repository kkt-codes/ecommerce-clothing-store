// src/context/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './AuthContext'; // Import the global AuthContext
import toast from 'react-hot-toast'; 

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  // Use the global AuthContext to get current user details
  const { currentUser, isAuthenticated, userRole, isLoading: authIsLoading } = useAuthContext(); 

  // Load cart from localStorage or merge guest cart on login
  useEffect(() => {
    // Only proceed if auth loading is complete to avoid race conditions
    if (authIsLoading) {
      return; 
    }

    let loadedCart = [];
    // Check if the authenticated user is a Buyer
    if (isAuthenticated && currentUser && userRole === 'Buyer') {
      const buyerCartKey = `cart_${currentUser.id}`;
      const storedBuyerCartString = localStorage.getItem(buyerCartKey);
      let buyerCartItems = storedBuyerCartString ? JSON.parse(storedBuyerCartString) : [];

      const guestCartString = localStorage.getItem('guest_cart');
      if (guestCartString) {
        try {
          const guestCartItems = JSON.parse(guestCartString);
          if (guestCartItems.length > 0) {
            const mergedCart = [...buyerCartItems];
            guestCartItems.forEach(guestItem => {
              const existingItemIndex = mergedCart.findIndex(item => String(item.id) === String(guestItem.id));
              if (existingItemIndex > -1) {
                mergedCart[existingItemIndex].quantity += guestItem.quantity;
              } else {
                mergedCart.push(guestItem);
              }
            });
            buyerCartItems = mergedCart;
            toast.success("Guest cart items have been merged into your account cart!");
          }
        } catch (error) {
            console.error("Error parsing guest cart for merge:", error);
        }
        localStorage.removeItem('guest_cart'); 
      }
      loadedCart = buyerCartItems;
      // Save the potentially merged cart back to the buyer's storage
      localStorage.setItem(buyerCartKey, JSON.stringify(loadedCart));

    } else {
      // User is a guest, not a Buyer, or logged out
      const guestCartString = localStorage.getItem('guest_cart');
      try {
        loadedCart = guestCartString ? JSON.parse(guestCartString) : [];
      } catch (error) {
        console.error("Error parsing guest cart:", error);
        loadedCart = [];
      }
    }
    setCartItems(loadedCart);
  }, [isAuthenticated, currentUser, userRole, authIsLoading]); // Effect runs on auth state change & auth loading completion

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    // Only save if auth state is determined (not loading)
    if (authIsLoading) {
        return;
    }
    try {
      // Save to buyer-specific cart only if authenticated as a Buyer
      if (isAuthenticated && currentUser && userRole === 'Buyer') {
        localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cartItems));
      } else {
        // For guests or non-Buyers (e.g. Sellers, though they shouldn't typically use cart)
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
      }
    } catch (error) {
        console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems, isAuthenticated, currentUser, userRole, authIsLoading]);


  const addToCart = useCallback((product, quantity = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => String(item.id) === String(product.id));
      if (existingItem) {
        return prevItems.map(item =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...product, quantity }];
      }
    });
    // Toast for adding to cart is typically handled in the component calling addToCart (e.g., ProductCard)
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
    // Toast for removing from cart is handled in Cart.jsx
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const numericQuantity = Number(quantity); // Ensure quantity is a number
    if (numericQuantity <= 0) {
      // If quantity becomes 0 or less, remove the item.
      // The toast for removal will be handled by the component calling removeFromCart.
      setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          String(item.id) === String(productId) ? { ...item, quantity: numericQuantity } : item
        )
      );
    }
  }, []); // Removed removeFromCart from deps as it's now handled internally based on quantity

  const clearCart = useCallback(() => {
    setCartItems([]);
    // Toast for clearing cart is handled in Cart.jsx
  }, []);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
