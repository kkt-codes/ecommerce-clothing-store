// View buyer inquiries

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";

/* Seller Received Orders Page */
export default function SellerMessages() {
  const { sellerData } = useAuth();
  const [receivedOrders, setReceivedOrders] = useState([]);

  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  useEffect(() => {
    const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const localProducts = JSON.parse(localStorage.getItem("products")) || [];

    // Find products owned by this seller
    const sellerProductIds = localProducts
      .filter((product) => product.sellerId === sellerData?.id)
      .map((product) => product.id);

    // Find orders for seller's products
    const sellerOrders = allOrders.filter((order) =>
      sellerProductIds.includes(order.productId)
    );

    setReceivedOrders(sellerOrders);
  }, [sellerData]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={sellerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">Received Orders</h1>

        {receivedOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {receivedOrders.map((order) => (
              <div key={order.id} className="border rounded p-4 shadow hover:shadow-md transition">
                <h2 className="font-bold text-lg mb-2">Product: {order.productName}</h2>
                <p className="text-gray-700 mb-1">Buyer: {order.buyerName}</p>
                <p className="text-gray-700 mb-1">Price: ${order.productPrice}</p>
                <div className="text-sm text-gray-400 text-right">{order.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No received orders yet.</p>
        )}
      </div>
    </div>
  );
}

