import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar"; 
import { useAuthContext } from "../../context/AuthContext"; // Use the global AuthContext
import {
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusCircleIcon,
  ChartBarIcon, 
  EyeIcon 
} from "@heroicons/react/24/outline";
import productsData from "../../data/products.json"; // Assuming this is in src/data/

export default function SellerDashboard() {
  // Use AuthContext to get current user data and loading state
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext(); 
  
  const [productCount, setProductCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0); 

  // Seller Sidebar Links - Ensure icons are imported and assigned
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  useEffect(() => {
    // Ensure currentUser is available and is a Seller before processing seller-specific data
    if (currentUser && userRole === 'Seller') {
      const sellerProducts = productsData.filter(p => String(p.sellerId) === String(currentUser.id));
      setProductCount(sellerProducts.length);
      
      const allMessages = JSON.parse(localStorage.getItem("messages")) || [];
      const sellerReceivedMessages = allMessages.filter(msg => String(msg.receiverId) === String(currentUser.id));
      setMessageCount(sellerReceivedMessages.length);

      setTotalSales(sellerProducts.reduce((acc, curr) => acc + (curr.price * (Math.floor(Math.random() * 5) + 1)), 0)); 
    }
  }, [currentUser, userRole]); // Depend on currentUser and userRole from AuthContext

  // Mock data for recent activity
  const recentActivity = [
    { id: 1, text: `You listed "Vintage Leather Jacket".`, time: "2 hours ago", type: "product", linkTo: "/seller/products" },
    { id: 2, text: `New message from BuyerX regarding "Handmade Scarf".`, time: "5 hours ago", type: "message", linkTo: "/seller/messages" },
    { id: 3, text: `Your product "Classic Blue Jeans" received 10 views today.`, time: "1 day ago", type: "stats", linkTo: "#" }, 
  ].slice(0, 3); 

  // Show loading state while AuthContext is initializing
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-gray-500 animate-pulse">Loading Seller Dashboard...</p>
      </div>
    );
  }

  // If not authenticated or not a seller (though ProtectedRoute should handle this)
  if (!currentUser || userRole !== 'Seller') {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p>Access denied or user data not available. Please ensure you are signed in as a Seller.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Pass currentUser.firstName for userName */}
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser.firstName} />

      <main className="flex-1 p-6 sm:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Welcome back, {currentUser.firstName}!
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Here's what's happening with your store today.
            </p>
          </div>
          <Link
            to="/seller/add-product"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add New Product
          </Link>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{productCount}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <ArchiveBoxIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sales (Mock)</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">${totalSales.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">New Messages</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{messageCount}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-5">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <ul className="space-y-4">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                    <div className={`flex-shrink-0 p-2.5 rounded-full ${
                        activity.type === 'product' ? 'bg-blue-100 text-blue-600' : 
                        activity.type === 'message' ? 'bg-purple-100 text-purple-600' : 
                        'bg-green-100 text-green-600'
                    }`}>
                      {activity.type === 'product' && <ArchiveBoxIcon className="h-5 w-5" />}
                      {activity.type === 'message' && <ChatBubbleLeftEllipsisIcon className="h-5 w-5" />}
                      {activity.type === 'stats' && <EyeIcon className="h-5 w-5" />}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm text-gray-700 leading-snug">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                    </div>
                    {activity.linkTo && activity.linkTo !== "#" && (
                        <Link to={activity.linkTo} className="text-xs text-blue-600 hover:underline self-center ml-auto">View</Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No recent activity to display.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-semibold text-gray-700 mb-5">Quick Links</h2>
            <ul className="space-y-3">
              {sellerLinks.filter(link => link.path !== "/seller/dashboard").map(link => ( 
                <li key={link.path}>
                  <Link to={link.path} className="flex items-center gap-3 p-3 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors group">
                    {link.icon && <link.icon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />}
                    <span className="text-sm font-medium">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
