import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ContactSellerButton from "../components/ContactSellerButton";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useCart } from "../context/CartContext"; 
import { useFavorites } from "../context/FavoritesContext"; 
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import productsData from "../data/products.json"; 
import toast from 'react-hot-toast'; 
import { HeartIcon as HeartOutlineIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productNotFound, setProductNotFound] = useState(false);
  
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites(); // Get favorites functions
  const { isAuthenticated: isBuyerAuthenticated } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();

  useEffect(() => {
    setLoading(true);
    setProductNotFound(false);
    setProduct(null); 

    let foundProduct = null;
    try {
      const localProductsString = localStorage.getItem("products");
      const localProducts = localProductsString ? JSON.parse(localProductsString) : [];
      if (localProducts.length > 0) {
          foundProduct = localProducts.find((p) => String(p.id) === String(id));
      }
      if (!foundProduct) {
          if (productsData && Array.isArray(productsData)) {
            foundProduct = productsData.find((p) => String(p.id) === String(id));
          }
      }
    } catch (error) {
        console.error("ProductDetails: Error accessing/parsing products:", error);
    }
    
    if (foundProduct) {
        setProduct(foundProduct);
        setQuantity(1);
    } else {
        setProductNotFound(true);
    }
    setLoading(false);
  }, [id]);

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity} of ${product.name} added to cart!`);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return; // Should not happen if button is rendered
    if (!isBuyerAuthenticated) {
      toast.error("Please log in to add to favorites.");
      switchToTab("signin");
      openModal();
      return;
    }
    toggleFavorite(product); // Pass the whole product object
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the product with ID: "{id}".</p>
        <Link to="/products" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Products
        </Link>
      </div>
    );
  }

  if (!product) { // Fallback if product is still null after loading
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Product details are currently unavailable.</p>
      </div>
    );
  }

  // Check if the current product is a favorite AFTER product state is set
  const isCurrentlyFavorite = product ? isFavorite(product.id) : false;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        {/* Product Image Section with Favorite Button */}
        <div className="shadow-xl rounded-lg overflow-hidden bg-gray-100 relative">
            <img
              src={product.image || '/assets/placeholder.png'} 
              alt={product.name}
              className="w-full h-auto md:min-h-[400px] max-h-[600px] object-cover" // Adjusted height properties
            />
            <button
              onClick={handleToggleFavorite}
              className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isCurrentlyFavorite ? (
                <HeartSolidIcon className="h-7 w-7 text-red-500" />
              ) : (
                <HeartOutlineIcon className="h-7 w-7 text-gray-600 hover:text-red-500" />
              )}
            </button>
        </div>

        {/* Product Information Section */}
        <div className="flex flex-col gap-5"> 
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{product.name}</h1>
          <p className="text-3xl text-blue-600 font-bold">${product.price.toFixed(2)}</p>
          
          <div className="prose prose-sm sm:prose-base text-gray-600 leading-relaxed">
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Description:</h3>
            <p>{product.description}</p>
          </div>
          
          <p className="text-sm text-gray-500">
            Category: <span className="font-medium text-gray-700">{product.category}</span>
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-2">
            <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity:</label>
            <input
              type="number" id="quantity" name="quantity" value={quantity}
              onChange={handleQuantityChange} min="1"
              className="border border-gray-300 rounded-md w-20 p-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-3">
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              Add to Cart
            </button>
            {/* Contact Seller Button - ensure product.sellerId and product.name are available */}
            {product.sellerId && ( 
                <ContactSellerButton 
                    sellerId={product.sellerId} 
                    productName={product.name} 
                />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
