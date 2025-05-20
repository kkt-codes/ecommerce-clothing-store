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
  const { currentUser, isAuthenticated, userRole, isLoading: authIsLoading } = useAuthContext(); 

  // Load cart from localStorage
  useEffect(() => {
    if (authIsLoading) {
      console.log("CartContext: Auth is loading, delaying cart processing.");
      return; 
    }
    console.log("CartContext: Auth loading complete. Processing cart for user:", currentUser?.id, "isAuthenticated:", isAuthenticated, "Role:", userRole);

    let loadedCart = [];

    if (isAuthenticated && currentUser) {
      if (userRole === 'Buyer') {
        const buyerCartKey = `cart_${currentUser.id}`;
        console.log(`CartContext: Loading cart for BUYER: ${currentUser.id}`);
        const storedBuyerCartString = localStorage.getItem(buyerCartKey);
        let buyerCartItems = storedBuyerCartString ? JSON.parse(storedBuyerCartString) : [];

        // Merge guest cart only for Buyers
        const guestCartString = localStorage.getItem('guest_cart');
        if (guestCartString) {
          console.log("CartContext: Guest cart found for BUYER, attempting merge.");
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
              console.log("CartContext: Guest cart merged successfully for BUYER.");
            } else {
              console.log("CartContext: Guest cart was empty, no merge needed for BUYER.");
            }
          } catch (error) {
              console.error("CartContext: Error parsing guest cart for BUYER merge:", error);
          }
          localStorage.removeItem('guest_cart'); // Clear guest cart after attempting merge for Buyer
          console.log("CartContext: Guest cart removed from localStorage (after Buyer merge/check).");
        }
        loadedCart = buyerCartItems;
        // Save the potentially merged cart back to the buyer's storage immediately after loading/merging
        localStorage.setItem(buyerCartKey, JSON.stringify(loadedCart)); 
        console.log(`CartContext: BUYER cart loaded/merged and saved for ${currentUser.id}. Items:`, loadedCart.length);

      } else if (userRole === 'Seller') {
        const sellerCartKey = `cart_seller_${currentUser.id}`; // Distinct key for sellers
        console.log(`CartContext: Loading cart for SELLER: ${currentUser.id}`);
        const storedSellerCartString = localStorage.getItem(sellerCartKey);
        try {
            loadedCart = storedSellerCartString ? JSON.parse(storedSellerCartString) : [];
            console.log("CartContext: SELLER cart loaded. Items:", loadedCart.length);
        } catch (error) {
            console.error("CartContext: Error parsing SELLER cart:", error);
            loadedCart = [];
        }
        // Sellers do not merge with guest_cart. Their cart is their own.
        // When a seller logs out, their seller-specific cart remains in localStorage, 
        // and the app context switches to using the 'guest_cart'.
      } else {
        // Other authenticated roles (if any) - currently behave like guests for cart
        console.log(`CartContext: Authenticated user with role ${userRole} (not Buyer/Seller). Loading guest_cart.`);
        const guestCartString = localStorage.getItem('guest_cart');
        try {
          loadedCart = guestCartString ? JSON.parse(guestCartString) : [];
        } catch (error) { 
            console.error(`CartContext: Error parsing guest_cart for role ${userRole}:`, error);
            loadedCart = []; 
        }
      }
    } else {
      // User is a GUEST (not authenticated)
      console.log("CartContext: User is GUEST. Loading guest_cart.");
      const guestCartString = localStorage.getItem('guest_cart');
      try {
        loadedCart = guestCartString ? JSON.parse(guestCartString) : [];
        console.log("CartContext: GUEST cart loaded. Items:", loadedCart.length);
      } catch (error) {
        console.error("CartContext: Error parsing GUEST cart:", error);
        loadedCart = [];
      }
    }
    setCartItems(loadedCart);
  }, [isAuthenticated, currentUser, userRole, authIsLoading]);

  // Save cart to localStorage whenever cartItems change
  useEffect(() => {
    if (authIsLoading) {
        return;
    }
    try {
      if (isAuthenticated && currentUser) {
        if (userRole === 'Buyer') {
          // Buyer's cart is already saved in the loading useEffect after potential merge
          // This effect will primarily handle updates during the buyer's session
          localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(cartItems));
          // console.log(`CartContext: Saving cart for BUYER: ${currentUser.id}`);
        } else if (userRole === 'Seller') {
          localStorage.setItem(`cart_seller_${currentUser.id}`, JSON.stringify(cartItems)); // Save to seller's own cart
          // console.log(`CartContext: Saving cart for SELLER: ${currentUser.id}`);
        } else {
          // Other authenticated roles (if any) save to guest_cart
          localStorage.setItem('guest_cart', JSON.stringify(cartItems));
          // console.log(`CartContext: Saving guest_cart for authenticated role ${userRole}.`);
        }
      } else {
        // GUEST saves to guest_cart
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
        // console.log("CartContext: Saving guest_cart for GUEST.");
      }
    } catch (error) {
        console.error("CartContext: Error saving cart to localStorage:", error);
    }
  }, [cartItems, isAuthenticated, currentUser, userRole, authIsLoading]); // Note: cartItems is the primary trigger here

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
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    const numericQuantity = Number(quantity); 
    if (numericQuantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => String(item.id) !== String(productId)));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          String(item.id) === String(productId) ? { ...item, quantity: numericQuantity } : item
        )
      );
    }
  }, []); 

  const clearCart = useCallback(() => {
    setCartItems([]);
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
