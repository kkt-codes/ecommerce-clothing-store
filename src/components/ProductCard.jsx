import React from "react";
import { Link } from "react-router-dom";
import { 
    ShoppingCartIcon, 
    HeartIcon as HeartOutlineIcon,
    StarIcon // For empty stars in rating display
} from "@heroicons/react/24/outline";
import { 
    HeartIcon as HeartSolidIcon,
    StarIcon as StarSolidIconFull // For filled stars in rating display
} from "@heroicons/react/24/solid"; 
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext"; 
import { useBuyerAuth } from "../hooks/useBuyerAuth"; 
import { useSignupSigninModal } from "../hooks/useSignupSigninModal"; 
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites(); 
  const { isAuthenticated: isBuyerAuthenticated } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();

  if (!product) {
    // Handle case where product prop is not yet available or undefined
    return (
        <div className="border border-gray-200 rounded-lg shadow-md p-4 animate-pulse bg-gray-100">
            <div className="w-full h-56 bg-gray-300 rounded mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-3"></div>
            <div className="h-10 bg-gray-300 rounded-md"></div>
        </div>
    );
  }

  const isCurrentlyFavorite = isFavorite(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    addToCart(product, 1);
    toast.success(`${product.name} added to cart!`);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isBuyerAuthenticated) {
      toast.error("Please log in to add to favorites.");
      switchToTab("signin");
      openModal();
      return;
    }
    toggleFavorite(product); 
  };

  // Helper function to render average rating stars for the product card
  const renderRating = (avgRating = 0, numReviews = 0) => {
    if (numReviews === 0) {
      return <div className="h-5"></div>; // Keep space for alignment or show "No reviews"
    }
    const stars = [];
    const fullStars = Math.floor(avgRating);
    // Simple half-star logic: if decimal part is .5 or more, consider it for display
    const hasHalfStarVisual = (avgRating % 1) >= 0.4 && (avgRating % 1) < 0.9; 

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarSolidIconFull key={`star-solid-${i}`} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStarVisual) {
        // For simplicity, using a slightly dimmed full star or a different icon if available
        // A true half-star icon would be ideal. Here, we use a full star that could be styled.
        stars.push(<StarSolidIconFull key={`star-half-${i}`} className="h-4 w-4 text-yellow-400 opacity-70" />);
      } else {
        stars.push(<StarIcon key={`star-empty-${i}`} className="h-4 w-4 text-gray-300" />);
      }
    }
    return (
      <div className="flex items-center" title={`${avgRating.toFixed(1)} out of 5 stars`}>
        {stars}
        <span className="ml-1.5 text-xs text-gray-500">({numReviews})</span>
      </div>
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white h-full">
      <Link to={`/products/${product.id}`} className="block group relative">
        <img
          src={product.image || '/assets/placeholder.png'}
          alt={product.name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/70 hover:bg-white rounded-full shadow-md transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isCurrentlyFavorite ? (
            <HeartSolidIcon className="h-6 w-6 text-red-500" />
          ) : (
            <HeartOutlineIcon className="h-6 w-6 text-gray-500 hover:text-red-500" />
          )}
        </button>
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-md sm:text-lg font-semibold text-gray-800 truncate mb-1" title={product.name}>
            <Link to={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
                {product.name}
            </Link>
        </h3>
        <p className="text-xs text-gray-500 mb-2 capitalize">{product.category}</p>
        
        {/* Display Average Rating */}
        <div className="mb-2 h-5"> {/* Fixed height div for rating to prevent layout shift */}
            {renderRating(product.averageRating, product.numberOfReviews)}
        </div>

        <p className="text-lg sm:text-xl font-bold text-blue-600 mb-3">
          ${product.price.toFixed(2)}
        </p>
        <div className="mt-auto pt-2"> {/* Added pt-2 for a bit of space */}
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 font-semibold text-sm shadow hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
