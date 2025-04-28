// 	Buyer login

import { useState, useEffect } from "react";

export function useBuyerAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [buyerData, setBuyerData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("buyerToken");
    const user = JSON.parse(localStorage.getItem("buyerData"));
    if (token && user) {
      setIsAuthenticated(true);
      setBuyerData(user);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem("buyerToken", token);
    localStorage.setItem("buyerData", JSON.stringify(userData));
    setIsAuthenticated(true);
    setBuyerData(userData);
  };

  const logout = () => {
    localStorage.removeItem("buyerToken");
    localStorage.removeItem("buyerData");
    setIsAuthenticated(false);
    setBuyerData(null);
  };

  return { isAuthenticated, buyerData, login, logout };
}
