// Button to contact seller

import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useNavigate } from "react-router-dom";

/* Contact Seller Button */
export default function ContactSellerButton({ sellerId }) {
  const { isAuthenticated, buyerData } = useBuyerAuth();
  const navigate = useNavigate();

  const handleContact = () => {
    if (!isAuthenticated) {
      alert("Please login as a Buyer to contact sellers!");
      navigate("/");
      return;
    }

    // Create simple message (in real app, this would be more complex)
    const messages = JSON.parse(localStorage.getItem("messages")) || [];

    const newMessage = {
      id: `message-${Date.now()}`,
      senderId: buyerData.id,
      senderName: `${buyerData.firstName} ${buyerData.lastName}`,
      receiverId: sellerId,
      content: "Hello! Is this product still available?",
      date: new Date().toLocaleString()
    };

    messages.push(newMessage);
    localStorage.setItem("messages", JSON.stringify(messages));

    alert("Message sent to seller!");
    navigate("/buyer/messages");
  };

  return (
    <button
      onClick={handleContact}
      className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Contact Seller
    </button>
  );
}

