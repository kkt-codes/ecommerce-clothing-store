// src/components/BuyerProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useBuyerAuth } from "../hooks/useBuyerAuth";

/* 
  BuyerProtectedRoute
  - Used to protect Buyer-only routes
  - Redirects to Buyer Login if not authenticated
*/
export default function BuyerProtectedRoute({ children }) {
  const { isAuthenticated } = useBuyerAuth();

  if (!isAuthenticated) {
    // If buyer is not logged in, redirect to buyer login page
    return <Navigate to="/buyer/login" replace />;
  }

  // If authenticated, show the page
  return children;
}
