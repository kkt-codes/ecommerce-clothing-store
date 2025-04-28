// Messages from sellers

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useBuyerAuth } from "../../hooks/useBuyerAuth";

/* Buyer Messages Page */
export default function BuyerMessages() {
  const { buyerData } = useBuyerAuth();
  const [messages, setMessages] = useState([]);

  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard" },
    { label: "My Orders", path: "/buyer/orders" },
    { label: "Messages", path: "/buyer/messages" },
    { label: "Profile", path: "/buyer/profile" }
  ];

  useEffect(() => {
    const allMessages = JSON.parse(localStorage.getItem("messages")) || [];

    // Filter only messages sent by this buyer
    const buyerMessages = allMessages.filter((msg) => msg.senderId === buyerData?.id);
    setMessages(buyerMessages);
  }, [buyerData]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={buyerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">My Messages</h1>

        {messages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.map((msg) => (
              <div key={msg.id} className="border rounded p-4 shadow hover:shadow-md transition">
                <h2 className="font-bold text-lg mb-2">To Seller: {msg.receiverId}</h2>
                <p className="text-gray-700 mb-2">{msg.content}</p>
                <div className="text-sm text-gray-400 text-right">{msg.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You have not contacted any sellers yet.</p>
        )}
      </div>
    </div>
  );
}

