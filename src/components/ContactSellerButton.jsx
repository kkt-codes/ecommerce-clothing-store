//import React from 'react';
import { useAuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal.jsx";
import toast from 'react-hot-toast';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function ContactSellerButton({ sellerId, sellerName, productName, productId }) {
  const { isAuthenticated, currentUser, userRole } = useAuthContext(); 
  const navigate = useNavigate();
  const { openModal, switchToTab } = useSignupSigninModal();

  const handleContact = () => {
    // Check if user is authenticated and is a Buyer
    if (!isAuthenticated || userRole !== 'Buyer') {
      toast.error("Please sign in as a Buyer to contact sellers!");
      //Optionally open the modal for signin/signup
      //switchToTab("signin"); // Directly open signin tab
      //openModal();
      return;
    }

    // Ensure currentUser is available
    if (!currentUser) {
      toast.error("Buyer data not found. Please try logging in again.");
      return;
    }

    // Navigate to the buyer's messages page, passing sellerId and product info in state
    // This will allow BuyerMessages.jsx to open or create the correct conversation
    console.log(`ContactSellerButton: Navigating to messages for sellerId: ${sellerId}, productName: ${productName}`);
    navigate("/buyer/messages", { 
      state: { 
        openWithSellerId: sellerId,
        sellerName: sellerName, // Pass sellerName for immediate display if needed
        productContext: { // Pass product context for pre-filling message
            id: productId,
            name: productName,
        }
      } 
    });
  };

  return (
    <button
      onClick={handleContact}
      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      <ChatBubbleLeftRightIcon className="h-5 w-5" />
      Contact Seller
    </button>
  );
}
