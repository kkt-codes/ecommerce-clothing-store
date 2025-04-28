// Button to contact seller

import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useNavigate } from "react-router-dom";

/* Contact Seller Button */
export default function ContactSellerButton({ sellerId }) {
  const { isAuthenticated } = useBuyerAuth();
  const navigate = useNavigate();

  const handleContact = () => {
    if (isAuthenticated) {
      // Redirect to messaging page (buyer dashboard messaging area)
      navigate("/buyer/messages");
    } else {
      alert("Please login as a Buyer to contact sellers!");
    }
  };

  return (
    <button
      onClick={handleContact}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Contact Seller
    </button>
  );
}
