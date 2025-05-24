import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuthContext } from "../../context/AuthContext";
import ProductCard from "../../components/ProductCard";
import { useFetchCached } from "../../hooks/useFetchCached";
import {
  ShoppingCartIcon,
  ChatBubbleLeftEllipsisIcon,
  UserCircleIcon,
  HeartIcon,
  ChartBarIcon,
  ListBulletIcon,
  ExclamationTriangleIcon 
} from "@heroicons/react/24/outline";

export default function BuyerDashboard() {
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext();

  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // Use useFetchCached for product data
  const { 
    data: allProducts, 
    loading: productsLoading, 
    error: productsError,
    forceRefetch: refetchProducts // if manual refetch is needed
  } = useFetchCached("products", "/data/products.json", { useLocalStoragePersistence: true });

  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    { label: "My Favorites", path: "/buyer/favorites", icon: HeartIcon },
  ];

  // Effect to process dashboard data once user and product data are available
  useEffect(() => {
    if (isAuthLoading || productsLoading) { // Wait for both auth and products to load
        return; 
    }

    // Process orders and messages if user is a buyer
    if (currentUser && userRole === 'Buyer') {
      try {
        const localOrders = JSON.parse(localStorage.getItem("orders")) || [];
        const buyerOrders = localOrders
          .filter((order) => String(order.buyerId) === String(currentUser.id))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecentOrders(buyerOrders.slice(0, 3));
        setTotalOrders(buyerOrders.length);
      } catch (e) {
        console.error("BuyerDashboard: Error processing orders from localStorage", e);
        setRecentOrders([]);
        setTotalOrders(0);
      }

      try {
        const localMessages = JSON.parse(localStorage.getItem("messages")) || [];
        // Example: count unread messages received by the buyer
        const buyerReceivedUnreadMessages = localMessages.filter(
          msg => String(msg.receiverId) === String(currentUser.id) && !msg.isReadByReceiver 
        );
        setMessageCount(buyerReceivedUnreadMessages.length);
      } catch (e) {
        console.error("BuyerDashboard: Error processing messages from localStorage", e);
        setMessageCount(0);
      }
    } else {
        setRecentOrders([]);
        setTotalOrders(0);
        setMessageCount(0);
    }

    // Set recommended products once allProducts is loaded
    if (allProducts && allProducts.length > 0) {
      const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
      setRecommendedProducts(shuffled.slice(0, 4));
    } else {
      setRecommendedProducts([]); // Clear recommendations if no product data
    }
  }, [currentUser, userRole, isAuthLoading, allProducts, productsLoading]); // Depend on allProducts and productsLoading

  if (isAuthLoading) { // Initial auth loading
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-500 animate-pulse">Loading Buyer Dashboard...</p>
      </div>
    );
  }

  if (!currentUser || userRole !== 'Buyer') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Access denied. Please sign in as a Buyer.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={currentUser.firstName} />

      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Hello, {currentUser.firstName}!
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
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unread Messages</p>
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
        <div className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Just For You</h2>
            <Link to="/products" className="text-sm text-blue-600 hover:underline font-medium">Shop More</Link>
          </div>
          {productsLoading && ( // Use productsLoading from useFetchCached
            <div className="text-center py-8">
              <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-500 mt-2">Loading recommendations...</p>
            </div>
          )}
          {productsError && !productsLoading && ( // Use productsError from useFetchCached
             <div className="text-center py-8 bg-red-50 p-4 rounded-lg">
               <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-2" />
               <p className="text-red-600 font-semibold">Could not load recommendations.</p>
               <p className="text-red-500 text-sm">{productsError.message}</p>
                <button 
                    onClick={refetchProducts} 
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                    Try Again
                </button>
            </div>
          )}
          {!productsLoading && !productsError && recommendedProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          {/* Message for when products are loaded but no recommendations specifically (e.g. if filtering was applied) */}
          {!productsLoading && !productsError && recommendedProducts.length === 0 && allProducts && allProducts.length > 0 && (
             <p className="text-center text-gray-500 py-8">No specific recommendations for you right now, but check out all our products!</p>
          )}
           {/* Message for when no product data could be loaded at all for recommendations */}
          {!productsLoading && !productsError && (!allProducts || allProducts.length === 0) && (
             <p className="text-center text-gray-500 py-8">Could not load product data for recommendations at this time.</p>
          )}
        </div>

        {/* Placeholder for when there's no activity at all and no product data */}
        {!productsLoading && !productsError && recommendedProducts.length === 0 && recentOrders.length === 0 && (!allProducts || allProducts.length === 0) && (
          <div className="bg-white p-10 rounded-xl shadow-lg text-center mt-8">
            <ShoppingCartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4"/>
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
