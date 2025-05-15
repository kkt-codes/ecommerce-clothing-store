// 	Buyer login

import { useState, useEffect } from "react";

export function useBuyerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [buyerData, setBuyerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Initialize isLoading to true

  useEffect(() => {
    const token = localStorage.getItem("buyerToken");
    const userString = localStorage.getItem("buyerData");
    if (token && userString) {
      try {
        const user = JSON.parse(userString);
        setIsAuthenticated(true);
        setBuyerData(user);
      } catch (e) {
        console.error("Failed to parse buyer data from localStorage", e);
        localStorage.removeItem("buyerToken");
        localStorage.removeItem("buyerData");
        setIsAuthenticated(false);
        setBuyerData(null);
      }
    } else {
      setIsAuthenticated(false);
      setBuyerData(null);
    }
    setIsLoading(false);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("buyerToken", token);
    localStorage.setItem("buyerData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setBuyerData(userData);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("buyerToken");
    localStorage.removeItem("buyerData");
    setIsAuthenticated(false);
    setBuyerData(null);
    setIsLoading(false);
  };

  return { isAuthenticated, buyerData, login, logout, isLoading }; // Expose isLoading
}
