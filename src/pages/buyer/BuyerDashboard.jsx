// Sidebar + overview

import React from "react";
import Sidebar from "../../components/Sidebar";

/* Buyer Dashboard Page */
export default function BuyerDashboard() {
  // Buyer Sidebar Links
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard" },
    { label: "My Orders", path: "/buyer/orders" },
    { label: "Messages", path: "/buyer/messages" },
    { label: "Profile", path: "/buyer/profile" }
  ];

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar links={buyerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Buyer Dashboard</h1>
        <p className="text-gray-600">Manage your orders, messages, and profile.</p>
      </div>

    </div>
  );
}

