// Seller Auth

import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Initialize isLoading to true

  useEffect(() => {
    // This effect runs when the hook is first used by a component,
    // or when the component re-mounts.
    const token = localStorage.getItem("sellerToken");
    const userString = localStorage.getItem("sellerData");
    
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        setIsAuthenticated(true);
        setSellerData(user);
      } catch (e) {
        console.error("Failed to parse seller data from localStorage", e);
        // Clear potentially corrupted data
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerData");
        setIsAuthenticated(false);
        setSellerData(null);
      }
    } else {
      // No token/user, ensure auth state is false
      setIsAuthenticated(false);
      setSellerData(null);
    }
    setIsLoading(false); // Finished checking initial auth state
  }, []); // Empty dependency array ensures this runs once on mount per component instance

  const login = (token, userData) => {
    localStorage.setItem("sellerToken", token);
    localStorage.setItem("sellerData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setSellerData(userData);
    setIsLoading(false); // Explicitly set loading to false on login
  };

  const logout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerData");
    setIsAuthenticated(false);
    setSellerData(null);
    setIsLoading(false); // Can also set loading to false here
  };

  return { isAuthenticated, sellerData, login, logout, isLoading }; // Expose isLoading
}