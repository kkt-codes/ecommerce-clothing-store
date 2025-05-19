import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './AuthContext'; // Import the global AuthContext
import toast from 'react-hot-toast';
import { useSignupSigninModal } from '../hooks/useSignupSigninModal'; // To prompt login

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState(new Set()); 
  // Use the global AuthContext
  const { currentUser, isAuthenticated, userRole, isLoading: authIsLoading } = useAuthContext(); 
  const { openModal, switchToTab } = useSignupSigninModal(); // For prompting login

  // Load favorites from localStorage when component mounts or auth state changes
  useEffect(() => {
    if (authIsLoading) {
      // console.log("FavoritesContext: Auth is loading, waiting...");
      return; // Wait for auth state to be determined
    }

    // Only load/manage favorites if the user is authenticated as a Buyer
    if (isAuthenticated && currentUser && userRole === 'Buyer') {
      // console.log(`FavoritesContext: Buyer authenticated (ID: ${currentUser.id}). Loading favorites.`);
      try {
        const storedFavorites = localStorage.getItem(`favorites_${currentUser.id}`);
        if (storedFavorites) {
          setFavoriteIds(new Set(JSON.parse(storedFavorites)));
        } else {
          setFavoriteIds(new Set()); // Initialize empty if nothing stored for this buyer
        }
      } catch (error) {
        console.error("Error loading favorites from localStorage:", error);
        setFavoriteIds(new Set()); // Fallback to empty set on error
        localStorage.removeItem(`favorites_${currentUser.id}`); // Clear corrupted data
      }
    } else {
      // If user logs out, is not authenticated, or is not a Buyer, clear current favorites state
      // console.log("FavoritesContext: User not a Buyer or not authenticated. Clearing favorites state.");
      setFavoriteIds(new Set());
      // Note: We don't clear localStorage for other users here, only the current session's state.
    }
  }, [isAuthenticated, currentUser, userRole, authIsLoading]);

  // Save favorites to localStorage whenever favoriteIds change and user is an authenticated Buyer
  useEffect(() => {
    if (authIsLoading) {
      return; // Wait for auth state
    }

    if (isAuthenticated && currentUser && userRole === 'Buyer') {
      // console.log(`FavoritesContext: Saving favorites for Buyer ID ${currentUser.id}`, Array.from(favoriteIds));
      try {
        localStorage.setItem(`favorites_${currentUser.id}`, JSON.stringify(Array.from(favoriteIds)));
      } catch (error) {
        console.error("Error saving favorites to localStorage:", error);
        toast.error("Could not save your favorites. Storage might be full.");
      }
    }
    // No 'else' here because guest favorites are not persisted in this model.
    // If a non-Buyer (e.g. Seller) somehow triggers favoriteIds change, it won't be saved to their ID.
  }, [favoriteIds, isAuthenticated, currentUser, userRole, authIsLoading]);

  const addToFavorites = useCallback((productId) => {
    // This function is typically called by toggleFavorite, which handles auth checks
    setFavoriteIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.add(String(productId));
      return newIds;
    });
    toast.success("Added to favorites!");
  }, []);

  const removeFromFavorites = useCallback((productId) => {
    setFavoriteIds((prevIds) => {
      const newIds = new Set(prevIds);
      newIds.delete(String(productId));
      return newIds;
    });
    toast.error("Removed from favorites."); // Using error style for removal confirmation
  }, []);

  const isFavorite = useCallback((productId) => {
    // Can be called even if not authenticated (will just return false if favoriteIds is empty)
    return favoriteIds.has(String(productId));
  }, [favoriteIds]);

  const toggleFavorite = useCallback((product) => {
    if (!isAuthenticated || !currentUser || userRole !== 'Buyer') {
      toast.error("Please sign in as a Buyer to manage your favorites.");
      switchToTab("signin"); // Set modal to sign-in tab
      openModal();          // Open the modal
      return;
    }
    // At this point, currentUser is guaranteed to be a Buyer
    const productIdStr = String(product.id);
    if (favoriteIds.has(productIdStr)) {
      removeFromFavorites(productIdStr);
    } else {
      addToFavorites(productIdStr);
    }
  }, [isAuthenticated, currentUser, userRole, favoriteIds, addToFavorites, removeFromFavorites, openModal, switchToTab]);

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
