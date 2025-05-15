import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ProductCard from '../../components/ProductCard';
import { useBuyerAuth } from '../../hooks/useBuyerAuth';
import { useFavorites } from '../../context/FavoritesContext';
import { useFetchCached } from '../../hooks/useFetchCached'; // To get all product details
import { HeartIcon as EmptyHeartIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'; // For empty state
import { ChartBarIcon, ListBulletIcon, ChatBubbleLeftEllipsisIcon, UserCircleIcon, HeartIcon } from "@heroicons/react/24/outline"; // Icons for sidebar

export default function BuyerFavoritesPage() {
  const { buyerData, isLoading: isAuthLoading } = useBuyerAuth();
  const { favoriteIds } = useFavorites();

  // Fetch all products to get details of favorited items
  const { 
    data: allProducts, 
    loading: productsLoading, 
    error: productsError 
  } = useFetchCached("allProducts", "/data/products.json");

  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  // Buyer Sidebar Links - Copied from BuyerDashboard for consistency
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    { label: "My Favorites", path: "/buyer/favorites", icon: HeartIcon }, 
  ];

  useEffect(() => {
    if (!productsLoading && !isAuthLoading) {
      if (allProducts && buyerData && favoriteIds) {
        const likedProducts = allProducts.filter(product => favoriteIds.has(String(product.id)));
        setFavoriteProducts(likedProducts);
      } else {
        setFavoriteProducts([]); // Clear if no products, buyer, or favorites
      }
      setIsLoadingPage(false);
    }
  }, [allProducts, productsLoading, buyerData, isAuthLoading, favoriteIds]);

  if (isAuthLoading || isLoadingPage) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData?.firstName || "User"} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading Your Favorites...</p>
        </main>
      </div>
    );
  }

  if (!buyerData) {
    // This should ideally be handled by BuyerProtectedRoute, but as a fallback
    return (
        <div className="flex min-h-screen bg-gray-100">
             {/* Render a basic sidebar or none if buyerData is crucial for it */}
            <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
                <p className="text-gray-600">Please log in to view your favorites.</p>
            </main>
        </div>
    );
  }
  
  if (productsError) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData.firstName} />
        <main className="flex-1 p-6 sm:p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-3">Error Loading Product Data</h2>
          <p className="text-gray-600">{productsError.message}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={buyerData.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <HeartIcon className="h-8 w-8 mr-3 text-red-500" />
            My Favorite Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here are the items you've saved. Click on any product to view details or add to cart.
          </p>
        </header>

        {favoriteProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
            {favoriteProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <EmptyHeartIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Your Favorites List is Empty</h2>
            <p className="text-gray-500 mb-6">
              Looks like you haven't added any products to your favorites yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors duration-300"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              Explore Products
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
