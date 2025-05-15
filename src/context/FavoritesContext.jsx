// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useBuyerAuth } from '../hooks/useBuyerAuth'; // To associate favorites with the logged-in buyer
import toast from 'react-hot-toast';

const FavoritesContext = createContext();

export const useFavorites = () => {
  return useContext(FavoritesContext);
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(new Set()); // Store only IDs for efficiency
  const { buyerData, isAuthenticated } = useBuyerAuth();

  // Load favorites from localStorage when component mounts or buyer changes
  useEffect(() => {
    if (isAuthenticated && buyerData?.id) {
      try {
        const storedFavorites = localStorage.getItem(`favorites_${buyerData.id}`);
        if (storedFavorites) {
          setFavoriteIds(new Set(JSON.parse(storedFavorites)));
        } else {
          setFavoriteIds(new Set()); // Initialize empty if nothing stored for this buyer
        }
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
        setFavoriteIds(new Set());
      }
    } else {
      // Clear favorites if user logs out or is not authenticated
      setFavoriteIds(new Set());
    }
  }, [isAuthenticated, buyerData]);

  // Save favorites to localStorage whenever favoriteIds change and user is authenticated
  useEffect(() => {
    if (isAuthenticated && buyerData?.id) {
      try {
        localStorage.setItem(`favorites_${buyerData.id}`, JSON.stringify(Array.from(favoriteIds)));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
      }
    }
    // If not authenticated, localStorage interaction is handled by the loading effect.
  }, [favoriteIds, isAuthenticated, buyerData]);

  const addToFavorites = useCallback((productId) => {
    if (!isAuthenticated || !buyerData?.id) {
      toast.error("Please log in to add items to your favorites.");
      // Optionally, trigger login modal here
      return;
    }
    setFavoriteIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.add(String(productId)); // Ensure productId is a string for consistency
      return newIds;
    });
    toast.success("Added to favorites!");
  }, [isAuthenticated, buyerData]);

  const removeFromFavorites = useCallback((productId) => {
    if (!isAuthenticated || !buyerData?.id) {
      // Should not happen if button is only shown to logged-in users, but good for safety
      return;
    }
    setFavoriteIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(String(productId)); // Ensure productId is a string
      return newIds;
    });
    toast.error("Removed from favorites.");
  }, [isAuthenticated, buyerData]);

  const isFavorite = useCallback((productId) => {
    return favoriteIds.has(String(productId)); // Ensure productId is a string
  }, [favoriteIds]);

  const toggleFavorite = useCallback((product) => {
    if (!isAuthenticated || !buyerData?.id) {
      toast.error("Please log in to manage your favorites.");
      // Consider calling useSignupSigninModal().openModal() here
      return;
    }
    const productIdStr = String(product.id);
    if (favoriteIds.has(productIdStr)) {
      removeFromFavorites(productIdStr);
    } else {
      addToFavorites(productIdStr);
    }
  }, [isAuthenticated, buyerData, favoriteIds, addToFavorites, removeFromFavorites]);

  const value = {
    favoriteIds,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    favoritesCount: favoriteIds.size,
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
};
