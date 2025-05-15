// src/components/ContactSellerButton.jsx
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useNavigate } from "react-router-dom";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal.jsx"; 
import toast from 'react-hot-toast';

export default function ContactSellerButton({ sellerId, productName }) { // Added productName for better toast message
  const { isAuthenticated, buyerData } = useBuyerAuth();
  const navigate = useNavigate();
  const { openModal, switchToTab } = useSignupSigninModal(); // Assuming you might want to open modal

  const handleContact = () => {
    if (!isAuthenticated) {
      toast.error("Please login as a Buyer to contact sellers!"); // Replaced alert
      // Optionally, open the login modal
      // switchToTab("signin");
      // openModal();
      return;
    }

    const messages = JSON.parse(localStorage.getItem("messages")) || [];
    const newMessage = {
      id: `message-${Date.now()}`,
      senderId: buyerData.id,
      senderName: `${buyerData.firstName} ${buyerData.lastName}`,
      receiverId: sellerId,
      // Improved message content
      content: `Hello, I'm interested in your product: ${productName || 'the listed item'}. Is it still available?`,
      date: new Date().toLocaleString()
    };

    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    toast.success("Message sent to seller!"); // Replaced alert
    navigate("/buyer/messages"); // Or stay on page, or give option
  };

  return (
    <button
      onClick={handleContact}
      className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300 font-semibold"
    >
      Contact Seller
    </button>
  );
}