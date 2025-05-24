import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar"; 
import { useAuthContext } from "../../context/AuthContext";
import { useFetchCached } from "../../hooks/useFetchCached";
import {
  ArchiveBoxIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftEllipsisIcon,
  PlusCircleIcon,
  ChartBarIcon, 
  EyeIcon,
  ExclamationTriangleIcon // For error display
} from "@heroicons/react/24/outline";
// Removed: import productsData from "../../data/products.json"; 

export default function SellerDashboard() {
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext(); 
  
  // Fetch all products using the caching hook
  const { 
    data: allProducts,  // This will be the data from public/data/products.json
    loading: productsLoading, 
    error: productsError,
    forceRefetch: refetchAllProducts // If a manual refetch is needed
  } = useFetchCached("products", "/data/products.json", { useLocalStoragePersistence: true });

  const [productCount, setProductCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0); 
  const [isLoadingPageData, setIsLoadingPageData] = useState(true); // Combined loading state for page data

  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  useEffect(() => {
    // Wait for both auth and product data to be loaded before processing
    if (isAuthLoading || productsLoading) {
      setIsLoadingPageData(true);
      return;
    }
    setIsLoadingPageData(true); // Indicate start of data processing

    if (currentUser && userRole === 'Seller' && allProducts) {
      // Use allProducts (from useFetchCached) instead of the removed productsData import
      const sellerProducts = allProducts.filter(p => String(p.sellerId) === String(currentUser.id));
      setProductCount(sellerProducts.length);
      
      // Calculate total sales based on fetched seller products
      setTotalSales(sellerProducts.reduce((acc, curr) => {
        // This is a mock sales calculation. In a real app, this would come from order data.
        const mockUnitsSold = Math.floor(Math.random() * 5) + 1; // Random 1 to 5 units
        return acc + (curr.price * mockUnitsSold);
      }, 0));
    } else {
      // Reset if conditions are not met (e.g., no current user, not a seller, or no products loaded)
      setProductCount(0);
      setTotalSales(0);
    }
    
    // Message count logic (remains the same as it doesn't directly depend on products.json)
    if (currentUser) {
        try {
            const allLocalMessages = JSON.parse(localStorage.getItem("messages")) || [];
            // Example: count unread messages for the seller
            const sellerReceivedMessages = allLocalMessages.filter(msg => 
                String(msg.receiverId) === String(currentUser.id) && !msg.isReadByReceiver
            );
            setMessageCount(sellerReceivedMessages.length);
        } catch (e) {
            console.error("Error reading messages from localStorage:", e);
            setMessageCount(0);
        }
    } else {
        setMessageCount(0);
    }

    setIsLoadingPageData(false); // Indicate end of data processing

  }, [currentUser, userRole, isAuthLoading, allProducts, productsLoading]); // Add allProducts and productsLoading to dependencies

  const recentActivity = [
    { id: 1, text: `You listed "Vintage Leather Jacket".`, time: "2 hours ago", type: "product", linkTo: "/seller/products" },
    { id: 2, text: `New message from BuyerX regarding "Handmade Scarf".`, time: "5 hours ago", type: "message", linkTo: "/seller/messages" },
    { id: 3, text: `Your product "Classic Blue Jeans" received 10 views today.`, time: "1 day ago", type: "stats", linkTo: "#" }, 
  ].slice(0, 3); 

  // Combined loading state for the entire page (auth and initial page data)
  if (isAuthLoading || isLoadingPageData) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName || "Seller"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
           <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 text-lg">Loading Seller Dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  // If not authenticated or not a seller (though ProtectedRoute should handle this)
  if (!currentUser || userRole !== 'Seller') {
    return (
      <div className="flex min-h-screen bg-gray-100">
         <Sidebar links={sellerLinks} userRole="Seller" /> {/* Basic sidebar */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <ArchiveBoxIcon className="h-16 w-16 text-gray-400 mb-4" /> {/* Changed icon for variety */}
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a Seller to view the dashboard.</p>
        </main>
      </div>
    );
  }
  
  // Handle error in fetching product data specifically
  if (productsError) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Product Data</h2>
            <p className="text-gray-600 mb-4">Could not load product information for the dashboard. Message: {productsError.message}</p>
            <button 
                onClick={refetchAllProducts} // Allow user to try fetching again
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Try Again
            </button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
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
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Sales (Est.)</p>
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
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unread Messages</p>
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
