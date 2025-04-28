/* import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/seller/login" replace />;
} */

// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/* 
  ProtectedRoute
  - Used to protect Seller-only routes
  - Redirects to Seller Login if not authenticated
*/
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // If seller is not logged in, redirect to seller login page
    return <Navigate to="/seller/login" replace />;
  }

  // If authenticated, show the page
  return children;
}
