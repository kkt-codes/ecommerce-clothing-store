// View cart items

import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useSignupLoginModal } from "../hooks/useSignupSigninModal";
import { useEffect, useState } from "react";

export default function Cart() {
  const { isAuthenticated, buyerData } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const buyerOrders = allOrders.filter(
        (order) => order.buyerId === buyerData?.id
      );
      setOrders(buyerOrders);
    }
  }, [isAuthenticated, buyerData]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
        <img
          src="/assets/empty-cart.png"
          alt="Empty cart"
          className="w-52 mb-6"
        />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-4">
          Sign in to see your saved items and orders, or create a new account to start shopping.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              switchToTab("signin");
              openModal();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Sign in to account
          </button>
          <button
            onClick={() => {
              switchToTab("signup");
              openModal();
            }}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
          >
            Sign up now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold mb-6">Your Orders</h2>
      {orders.length === 0 ? (
        <p className="text-gray-600">You haven't placed any orders yet.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order, index) => (
            <li key={index} className="border p-4 rounded shadow-sm">
              <p><strong>Product:</strong> {order.productName}</p>
              <p><strong>Category:</strong> {order.category}</p>
              <p><strong>Seller:</strong> {order.sellerName}</p>
              <p className="text-sm text-gray-500">
                Placed on: {new Date(order.date).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

