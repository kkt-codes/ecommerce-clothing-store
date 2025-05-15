import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar"; 
import { useBuyerAuth } from "../../hooks/useBuyerAuth";
import ProductCard from "../../components/ProductCard"; 
import {
  ShoppingCartIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  HeartIcon, // For future wishlist
  ChartBarIcon, // Using ChartBarIcon for Dashboard overview
  ListBulletIcon 
} from "@heroicons/react/24/outline";
import allProductsData from "../../data/products.json"; // Assuming this is in src/data/

export default function BuyerDashboard() {
  const { buyerData, isLoading: isAuthLoading } = useBuyerAuth(); 
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Buyer Sidebar Links - Ensure icons are imported and assigned
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    // { label: "Wishlist", path: "/buyer/wishlist", icon: HeartIcon }, // Future: for liked products
  ];

  useEffect(() => {
    if (buyerData) {
      const allOrders = JSON.parse(localStorage.getItem("orders")) || [];
      const buyerOrders = allOrders
        .filter((order) => String(order.buyerId) === String(buyerData.id))
        .sort((a, b) => new Date(b.date) - new Date(a.date)); 
      setRecentOrders(buyerOrders.slice(0, 3)); 
      setTotalOrders(buyerOrders.length);

      const allMessages = JSON.parse(localStorage.getItem("messages")) || [];
      const buyerSentMessages = allMessages.filter(msg => String(msg.senderId) === String(buyerData.id));
      setMessageCount(buyerSentMessages.length); 
    }

    // Set recommended products (mock: random 4)
    const shuffled = [...allProductsData].sort(() => 0.5 - Math.random());
    setRecommendedProducts(shuffled.slice(0, 4)); 
  }, [buyerData]);

  if (isAuthLoading) {
     return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-500 animate-pulse">Loading Buyer Dashboard...</p>
      </div>
    );
  }

  if (!buyerData) {
    // This case should ideally be handled by BuyerProtectedRoute redirecting.
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Buyer data not available. Please ensure you are logged in as a buyer.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData.firstName} />

      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Hello, {buyerData.firstName}!
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome to your personal dashboard. Manage your orders, messages, and more.
          </p>
        </div>

        {/* Quick Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/buyer/orders" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Orders</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalOrders}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-4 hover:underline">View all orders &rarr;</p>
          </Link>

          <Link to="/buyer/messages" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Messages</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{messageCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
             <p className="text-xs text-purple-600 mt-4 hover:underline">View messages &rarr;</p>
          </Link>

          <Link to="/buyer/profile" className="block bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">My Profile</p>
                <p className="text-xl font-semibold text-gray-800 mt-1">Account Settings</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCircleIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-4 hover:underline">Edit profile &rarr;</p>
          </Link>
        </div>
        
        {/* Recent Orders Section */}
        {recentOrders.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-semibold text-gray-700">Your Recent Orders</h2>
                <Link to="/buyer/orders" className="text-sm text-blue-600 hover:underline font-medium">View All</Link>
            </div>
            <ul className="space-y-4">
              {recentOrders.map(order => (
                <li key={order.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div className="flex-grow min-w-0"> 
                      <p className="text-sm font-semibold text-gray-800 truncate" title={order.productName}>{order.productName}</p>
                      <p className="text-xs text-gray-500">Order ID: {order.id.substring(0,15)}...</p>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0 mt-1 sm:mt-0">
                        <p className="text-sm font-semibold text-gray-700">${(order.productPrice * order.quantity).toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommended For You Section */}
        {recommendedProducts.length > 0 && (
          <div className="pt-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">Just For You</h2>
                <Link to="/products" className="text-sm text-blue-600 hover:underline font-medium">Shop More</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}

         {/* Placeholder for when there's no activity */}
         {recommendedProducts.length === 0 && recentOrders.length === 0 && (
            <div className="bg-white p-10 rounded-xl shadow-lg text-center mt-8">
                <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Your Dashboard is Quiet</h3>
                <p className="text-gray-500 mb-6">Start shopping or place an order to see activity here.</p>
                <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Explore Products
                </Link>
            </div>
        )}
      </main>
    </div>
  );
}
