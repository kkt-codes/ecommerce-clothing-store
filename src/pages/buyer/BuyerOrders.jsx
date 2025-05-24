// List of buyer orders

import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { useAuthContext } from '../../context/AuthContext';
import { ListBulletIcon, ShoppingCartIcon, UserCircleIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon, HeartIcon } from '@heroicons/react/24/outline'; // Sidebar and empty state icons
import toast from 'react-hot-toast';

export default function BuyerOrders() {
  // Use the global AuthContext
  const { currentUser, isAuthenticated, userRole, isLoading: isAuthLoading } = useAuthContext();
  
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Buyer Sidebar Links - Ensure these icons are imported
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    { label: "My Favorites", path: "/buyer/favorites", icon: HeartIcon },
  ];

  useEffect(() => {
    // Wait for auth state to be loaded
    if (isAuthLoading) {
      setIsLoadingOrders(true);
      return;
    }

    // Proceed only if authenticated as a Buyer
    if (isAuthenticated && currentUser && userRole === 'Buyer') {
      setIsLoadingOrders(true);
      try {
        const allOrdersString = localStorage.getItem("orders");
        const allOrders = allOrdersString ? JSON.parse(allOrdersString) : [];
        
        const buyerSpecificOrders = allOrders
          .filter(order => String(order.buyerId) === String(currentUser.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by newest first
        
        setOrders(buyerSpecificOrders);
      } catch (error) {
        console.error("Error loading or processing orders for buyer:", error);
        toast.error("Could not load your orders.");
        setOrders([]);
      }
      setIsLoadingOrders(false);
    } else {
      // If not a buyer or not authenticated, clear orders and stop loading
      setOrders([]);
      setIsLoadingOrders(false);
    }
  }, [currentUser, isAuthenticated, userRole, isAuthLoading]);

  // Combined loading state for the page
  if (isAuthLoading || isLoadingOrders) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" userName={currentUser?.firstName || "User"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 text-lg">Loading Your Orders...</p>
          </div>
        </main>
      </div>
    );
  }

  // Fallback if user is not a buyer (ProtectedRoute should also handle this)
  if (!isAuthenticated || userRole !== 'Buyer') {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" /> {/* Basic sidebar */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <ListBulletIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a Buyer to view your orders.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={currentUser?.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <ListBulletIcon className="h-8 w-8 mr-3 text-blue-600" />
            My Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review your past purchases and order details.
          </p>
        </header>

        {orders.length > 0 ? (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-3 sm:px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500" title={order.id}>
                      #{order.id.substring(order.id.length - 8)} {/* Show last 8 chars of ID */}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs" title={order.productName}>
                        {order.productName}
                      </div>
                      <div className="text-xs text-gray-500">{order.category}</div>
                    </td>
                    <td className="px-3 sm:px-4 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-800">
                      ${(order.productPrice * order.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">You Haven't Placed Any Orders Yet</h2>
            <p className="text-gray-500 mb-6">
              Start shopping to see your order history here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300"
            >
              <ShoppingBagIcon className="h-5 w-5" /> {/* Re-using ShoppingBagIcon */}
              Browse Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
