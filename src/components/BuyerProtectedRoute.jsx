// This component protects routes intended ONLY for authenticated Buyers.
import React, { useEffect } from 'react'; // React and useEffect are needed
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useSignupSigninModal } from '../hooks/useSignupSigninModal';
import toast from 'react-hot-toast';

export default function BuyerProtectedRoute({ children }) {
  // Destructure isLoading, isAuthenticated, and userRole from AuthContext
  const { isAuthenticated, isLoading, userRole } = useAuthContext(); 
  const { openModal, switchToTab, isOpen: isModalOpen } = useSignupSigninModal();

  useEffect(() => {
    // This effect handles prompting for sign-in if needed.
    if (!isLoading && !isAuthenticated && !isModalOpen) {
      // If authentication check is complete, user is NOT authenticated, and modal is not already open:
      toast.error("Please sign in as a Buyer to access this page.");
      switchToTab('signin'); // Set modal to the sign-in tab
      openModal();          // Open the sign-in modal
    }
  }, [isLoading, isAuthenticated, isModalOpen, openModal, switchToTab]);

  if (isLoading) {
    // While the AuthContext is checking the initial authentication state, display a loading indicator.
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Authenticating Buyer...</p>
        {/* Consider adding a more visual spinner here */}
      </div>
    );
  }
  
  // After loading, if the user is not authenticated OR they are not a Buyer, redirect.
  if (!isAuthenticated || userRole !== 'Buyer') {
    // If not authenticated, the useEffect above will have already triggered the modal and toast.
    // If authenticated but the wrong role (e.g., a Seller trying to access a Buyer route),
    // show a specific error toast before redirecting.
    if (isAuthenticated && userRole !== 'Buyer') {
        toast.error("Access Denied. This page is for Buyers only.");
    }
    return <Navigate to="/" replace />; // Redirect to homepage
  }

  // If loading is complete, user is authenticated, AND userRole is 'Buyer', render the protected children components.
  return children; 
}