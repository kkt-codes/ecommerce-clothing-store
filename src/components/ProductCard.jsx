// src/components/ProductCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ShoppingCartIcon, HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid"; // For filled heart
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext"; // Import useFavorites
import { useBuyerAuth } from "../hooks/useBuyerAuth"; // To check if buyer is authenticated
import { useSignupSigninModal } from "../hooks/useSignupSigninModal"; // To open login modal
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites(); // Get favorites functions
  const { isAuthenticated: isBuyerAuthenticated } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();

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
    toggleFavorite(product); // Pass the whole product object or just ID
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col bg-white">
      <Link to={`/products/${product.id}`} className="block group relative">
        <img
          src={product.image || '/assets/placeholder.png'}
          alt={product.name}
          className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Favorite button positioned on the image */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white/70 hover:bg-white rounded-full shadow-md transition-colors duration-200 z-10"
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
        <h3 className="text-lg font-semibold text-gray-800 truncate mb-1" title={product.name}>
            <Link to={`/products/${product.id}`} className="hover:text-blue-600 transition-colors">
                {product.name}
            </Link>
        </h3>
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category}</p>
        <p className="text-xl font-bold text-blue-600 mb-3">
          ${product.price.toFixed(2)}
        </p>
        <div className="mt-auto"> 
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 font-semibold text-sm shadow hover:shadow-lg"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
