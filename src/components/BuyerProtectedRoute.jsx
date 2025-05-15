// This file is for protecting Buyer-specific routes.
import React, { useEffect } from 'react'; // Single React import
import { Navigate } from 'react-router-dom';
import { useBuyerAuth } from '../hooks/useBuyerAuth'; // Buyer auth hook
import { useSignupSigninModal } from '../hooks/useSignupSigninModal';
import toast from 'react-hot-toast'; // For user feedback

export default function BuyerProtectedRoute({ children }) {
  // Now also destructure isLoading from the auth hook
  const { isAuthenticated, isLoading } = useBuyerAuth(); 
  const { openModal, switchToTab, isOpen: isModalOpen } = useSignupSigninModal();

  useEffect(() => {
    // Only attempt to open modal if loading is complete and user is not authenticated
    // and modal is not already open.
    if (!isLoading && !isAuthenticated && !isModalOpen) {
      toast.error("Please sign in as a Buyer to access this page.");
      switchToTab('signin');
      openModal();
    }
  }, [isLoading, isAuthenticated, isModalOpen, openModal, switchToTab]);

  if (isLoading) {
    // While checking auth status, show a loading indicator or return null.
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Authenticating Buyer...</p>
        {/* You could add a spinner icon here */}
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // If loading is complete and user is not authenticated, redirect.
    // The useEffect above will have triggered the modal.
    return <Navigate to="/" replace />;
  }

  // If loading is complete and user is authenticated, render the protected content.
  return children; 
}
