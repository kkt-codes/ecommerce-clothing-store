// Sidebar + overview

import React from "react";
import Sidebar from "../../components/Sidebar";

/* Seller Dashboard Page */
export default function SellerDashboard() {
  // Seller Sidebar Links
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <Sidebar links={sellerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-4">Welcome to Seller Dashboard</h1>
        <p className="text-gray-600">Manage your products and messages here.</p>
      </div>

    </div>
  );
}

