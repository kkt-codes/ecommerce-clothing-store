// List of buyer orders

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useBuyerAuth } from "../../hooks/useBuyerAuth";

/* Buyer Orders Page */
export default function BuyerOrders() {
  const { buyerData } = useBuyerAuth();
  const [orders, setOrders] = useState([]);

  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard" },
    { label: "My Orders", path: "/buyer/orders" },
    { label: "Messages", path: "/buyer/messages" },
    { label: "Profile", path: "/buyer/profile" }
  ];

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const buyerOrders = allOrders.filter((order) => order.buyerId === buyerData?.id);
    setOrders(buyerOrders);
  }, [buyerData]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={buyerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4 shadow hover:shadow-md transition">
                <h2 className="font-bold text-lg mb-2">{order.productName}</h2>
                <p className="text-gray-700 mb-2">${order.productPrice}</p>
                <div className="text-sm text-gray-400 text-right">{order.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">You have no orders yet.</p>
        )}
      </div>
    </div>
  );
}

