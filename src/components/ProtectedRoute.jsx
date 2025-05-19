// This component protects routes intended ONLY for authenticated Sellers.
import React, { useEffect } from 'react'; // React and useEffect are needed
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext'; // Use the global AuthContext
import { useSignupSigninModal } from '../hooks/useSignupSigninModal';
import toast from 'react-hot-toast';

export default function ProtectedRoute({ children }) {
  // Destructure isLoading, isAuthenticated, and userRole from AuthContext
  const { isAuthenticated, isLoading, userRole } = useAuthContext(); 
  const { openModal, switchToTab, isOpen: isModalOpen } = useSignupSigninModal();

  useEffect(() => {
    // This effect handles prompting for sign-in if needed.
    // It runs when isLoading, isAuthenticated, or isModalOpen changes.
    if (!isLoading && !isAuthenticated && !isModalOpen) {
      // If authentication check is complete, user is NOT authenticated, and modal is not already open:
      toast.error("Please sign in as a Seller to access this page.");
      switchToTab('signin'); // Set modal to the sign-in tab
      openModal();          // Open the sign-in modal
    }
  }, [isLoading, isAuthenticated, isModalOpen, openModal, switchToTab]);
  
  if (isLoading) {
    // While the AuthContext is checking the initial authentication state (e.g., from localStorage),
    // display a loading indicator. This prevents premature redirection.
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Authenticating Seller...</p>
        {/* Consider adding a more visual spinner here */}
      </div>
    ); 
  }
  
  // After loading, if the user is not authenticated OR they are not a Seller, redirect.
  if (!isAuthenticated || userRole !== 'Seller') {
    // If not authenticated, the useEffect above will have already triggered the modal and toast.
    // If authenticated but the wrong role (e.g., a Buyer trying to access a Seller route),
    // show a specific error toast before redirecting.
    if (isAuthenticated && userRole !== 'Seller') {
        toast.error("Access Denied. This page is for Sellers only.");
    }
    return <Navigate to="/" replace />; // Redirect to homepage
  }

  // If loading is complete, user is authenticated, AND userRole is 'Seller', render the protected children components.
  return children; 
}