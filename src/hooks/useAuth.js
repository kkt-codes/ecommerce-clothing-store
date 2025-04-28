// Seller login

import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sellerData, setSellerData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");
    const user = JSON.parse(localStorage.getItem("sellerData"));
    if (token && user) {
      setIsAuthenticated(true);
      setSellerData(user);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("sellerToken", token);
    localStorage.setItem("sellerData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setSellerData(userData);
  };

  const logout = () => {
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerData");
    setIsAuthenticated(false);
    setSellerData(null);
  };

  return { isAuthenticated, sellerData, login, logout };
}
