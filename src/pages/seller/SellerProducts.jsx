// View/edit/delete products

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuthContext } from "../../context/AuthContext";
import { useFetchCached, invalidateCacheEntry } from "../../hooks/useFetchCached";
import toast from 'react-hot-toast';
import { 
    PlusCircleIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    ArchiveBoxIcon, // For page icon and empty state
    ChartBarIcon, // For sidebar
    ChatBubbleLeftEllipsisIcon // For sidebar
} from "@heroicons/react/24/outline";

export default function SellerProducts() {
  // Use global AuthContext for seller data and auth state
  const { currentUser, isAuthenticated, userRole, isLoading: isAuthLoading } = useAuthContext();
  
  // Fetch all products using the caching hook
  const { 
    data: allProducts, 
    loading: productsLoading, 
    error: productsError, 
    forceRefetch: refetchAllProducts // To manually refetch if needed
  } = useFetchCached("products", "/data/products.json", { useLocalStoragePersistence: true }); // Using the same cache key as ProductList

  const [sellerProducts, setSellerProducts] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true); // Combined loading state for the page

  // Seller Sidebar Links - Ensure icons are imported and assigned
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  // Effect to filter products for the current seller once allProducts and currentUser are available
  useEffect(() => {
    // Wait for auth and product data to be loaded
    if (isAuthLoading || productsLoading) {
      setIsLoadingPage(true);
      return;
    }

    setIsLoadingPage(true); // Start processing
    if (isAuthenticated && currentUser && userRole === 'Seller' && allProducts) {
      const filtered = allProducts.filter(p => String(p.sellerId) === String(currentUser.id));
      setSellerProducts(filtered);
    } else {
      setSellerProducts([]); // Clear if not a seller, not authenticated, or no products
    }
    setIsLoadingPage(false); // Finished processing
  }, [allProducts, productsLoading, currentUser, isAuthenticated, userRole, isAuthLoading]);


  const handleDelete = (productId, productName) => {
    if (!currentUser || userRole !== 'Seller') {
        toast.error("Only authenticated sellers can delete products.");
        return;
    }

    toast(
      (t) => ( // t is the toast instance, allows dismissing programmatically
        <div className="flex flex-col items-center p-3 bg-white rounded-lg shadow-md">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            Delete "{productName}"?
          </p>
          <p className="text-xs text-gray-600 mb-4 text-center">
            Are you sure? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                // 1. Update localStorage
                let currentProducts = [];
                try {
                    const localProductsString = localStorage.getItem("products");
                    currentProducts = localProductsString ? JSON.parse(localProductsString) : (allProducts || []);
                } catch (e) {
                    console.error("Error parsing products from localStorage before delete:", e);
                    currentProducts = allProducts || []; // Fallback
                }
                
                const updatedLocalProducts = currentProducts.filter((p) => String(p.id) !== String(productId));
                localStorage.setItem("products", JSON.stringify(updatedLocalProducts));
                
                // 2. Update local state for immediate UI feedback on this page
                setSellerProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
                
                // 3. Invalidate the "allProducts" cache so other components (like ProductList) get fresh data
                invalidateCacheEntry("products"); 
                
                // 4. Optionally, if this page needs to re-evaluate from a fresh full list immediately (e.g., for pagination based on allProducts)
                // forceRefetchAllProducts(); // This would re-trigger the useFetchCached hook for "allProducts"

                toast.success("Product deleted successfully.", { id: t.id }); // Dismiss confirm toast and show success
              }}
              className="flex-1 px-4 py-2 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)} // Dismiss the toast
              className="flex-1 px-4 py-2 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 1000, // Keep open until dismissed by user action
        position: "top-center",
        style: { /* Default react-hot-toast styles will apply, or customize here */ },
      }
    );
  };

  // Handle combined loading state for the page
  if (isAuthLoading || isLoadingPage) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName || "Seller"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
           <div className="flex flex-col items-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 text-lg">Loading Your Products...</p>
          </div>
        </main>
      </div>
    );
  }

  // Fallback if user is not a seller (ProtectedRoute should also handle this)
  if (!isAuthenticated || userRole !== 'Seller' || !currentUser) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" /> {/* Basic sidebar */}
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <ArchiveBoxIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in as a Seller to manage your products.</p>
        </main>
      </div>
    );
  }
  
  // Handle error in fetching all products
  if (productsError) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{productsError.message}</p>
            <button 
                onClick={refetchAllProducts} // Use forceRefetch from useFetchCached
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
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />

      <main className="flex-1 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your product listings ({sellerProducts.length} items).</p>
          </div>
          <Link 
            to="/seller/add-product" 
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <PlusCircleIcon className="h-5 w-5" />
            Add New Product
          </Link>
        </div>

        {sellerProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sellerProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300">
                {/* Link to public product detail page for viewing */}
                <Link to={`/products/${product.id}`} className="block group"> 
                  <img 
                    src={product.image || '/assets/placeholder.png'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity" 
                  />
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800 truncate mb-1" title={product.name}>{product.name}</h2>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{product.category}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-3">${product.price.toFixed(2)}</p>
                  {/* Description (optional, could be shorter or omitted for card view) */}
                  {/* <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {product.description}
                  </p> */}
                  <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center gap-2">
                    <Link
                      to={`/seller/edit-product/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center col-span-full py-12 bg-white rounded-lg shadow-md">
            <ArchiveBoxIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No Products Listed Yet</h3>
            <p className="text-gray-500 mt-1 mb-6">Click "Add New Product" to list your first item and start selling!</p>
            <Link 
                to="/seller/add-product" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                <PlusCircleIcon className="h-5 w-5" />
                Add Your First Product
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
