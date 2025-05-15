// View/edit/delete products
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import { useFetchCached, invalidateCacheEntry } from "../../hooks/useFetchCached"; // Import hook and invalidation util
import toast from 'react-hot-toast';
import { PlusCircleIcon, PencilSquareIcon, TrashIcon, ArchiveBoxIcon, ChartBarIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";

export default function SellerProducts() {
  const { sellerData, isLoading: isAuthLoading } = useAuth();
  const { 
    data: allProducts, 
    loading: productsLoading, 
    error: productsError, 
    forceRefetch 
  } = useFetchCached("allProducts", "/data/products.json"); // Using the same cache key as ProductList

  const [sellerProducts, setSellerProducts] = useState([]);

  // Seller Sidebar Links - ensure icons are imported and assigned
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  // Memoized filtering of products for the current seller
  useEffect(() => {
    if (allProducts && sellerData) {
      const filtered = allProducts.filter(p => String(p.sellerId) === String(sellerData.id));
      setSellerProducts(filtered);
    } else if (!allProducts && !productsLoading) { // If allProducts is null after loading (e.g. error)
        setSellerProducts([]);
    }
  }, [allProducts, sellerData, productsLoading]);


  const handleDelete = (productId, productName) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center p-2">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Delete "{productName}"?
          </p>
          <p className="text-xs text-gray-600 mb-3 text-center">
            Are you sure? This action cannot be undone.
          </p>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => {
                const currentProducts = JSON.parse(localStorage.getItem("products")) || [];
                const updatedLocalProducts = currentProducts.filter((p) => String(p.id) !== String(productId));
                localStorage.setItem("products", JSON.stringify(updatedLocalProducts));
                
                // Update local state for immediate UI feedback
                setSellerProducts(prev => prev.filter(p => String(p.id) !== String(productId)));
                
                invalidateCacheEntry("allProducts"); // Invalidate cache so ProductList gets fresh data
                // forceRefetch(); // Optionally force refetch here if this page needs to show updated full list
                                  // but since we filter client-side, invalidating is enough for other components.
                                  // If this page itself needs to re-evaluate from a fresh full list, use forceRefetch.

                toast.success("Product deleted successfully.", { id: t.id });
              }}
              className="flex-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, 
        position: "top-center",
        style: {
          background: 'white', 
          color: 'black',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          maxWidth: '350px',
        },
      }
    );
  };

  if (isAuthLoading || productsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData?.firstName} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading products...</p>
        </main>
      </div>
    );
  }

  if (productsError) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData?.firstName} />
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Products</h2>
            <p className="text-gray-600 mb-4">{productsError.message}</p>
            <button 
                onClick={forceRefetch}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Try Again
            </button>
        </main>
      </div>
    );
  }
  
  if (!sellerData) {
     return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={sellerLinks} userRole="Seller" />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500">Seller information not available.</p>
        </main>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData.firstName} />

      <main className="flex-1 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">My Products</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your product listings.</p>
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
                <Link to={`/products/${product.id}`} className="block"> {/* Link to public product detail page */}
                  <img 
                    src={product.image || '/assets/placeholder.png'} 
                    alt={product.name} 
                    className="w-full h-48 object-cover" 
                  />
                </Link>
                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-semibold text-gray-800 truncate mb-1" title={product.name}>{product.name}</h2>
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">{product.category}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-3">${product.price.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                    {product.description}
                  </p>
                  <div className="mt-auto border-t border-gray-100 pt-4 flex justify-between items-center gap-2">
                    <Link
                      to={`/seller/edit-product/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id, product.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
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
          <div className="text-center col-span-full py-10 bg-white rounded-lg shadow">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-xl font-semibold text-gray-700">No Products Yet</h3>
            <p className="text-gray-500 mt-1 mb-4">Click "Add New Product" to list your first item!</p>
            <Link 
                to="/seller/add-product" 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                <PlusCircleIcon className="h-5 w-5" />
                Add New Product
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
