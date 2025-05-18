import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ContactSellerButton from "../components/ContactSellerButton";
import ReviewCard from "../components/ReviewCard"; 
import AddReviewForm from "../components/AddReviewForm";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useCart } from "../context/CartContext"; 
import { useFavorites } from "../context/FavoritesContext";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import { useFetchCached, invalidateCacheEntry } from "../hooks/useFetchCached";
import toast from 'react-hot-toast'; 
import { 
    HeartIcon as HeartOutlineIcon, 
    ShoppingCartIcon, 
    StarIcon as StarSolidIcon 
} from "@heroicons/react/24/outline"; // Changed StarSolid to outline for average rating display
import { HeartIcon as HeartSolidIconFull, StarIcon as StarSolidIconFull } from "@heroicons/react/24/solid"; // For filled hearts and stars

export default function ProductDetails() {
  const { id: productId } = useParams(); // Renamed id to productId for clarity
  
  // Use useFetchCached to get all products, then find the specific one
  // This ensures we work with potentially cached and updated product data
  const { data: allProducts, loading: allProductsLoading, error: allProductsError } = 
    useFetchCached("allProducts", "/data/products.json");

  const [product, setProduct] = useState(null);
  const [currentProductReviews, setCurrentProductReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true); // General loading for the page
  const [productNotFound, setProductNotFound] = useState(false);
  
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated: isBuyerAuthenticated, buyerData } = useBuyerAuth(); // Get buyerData
  const { openModal, switchToTab } = useSignupSigninModal();

  // Effect to find and set the current product when allProducts or productId changes
  useEffect(() => {
    setLoading(true); // Start loading when dependencies change
    setProductNotFound(false);
    setProduct(null);
    setCurrentProductReviews([]);

    if (!allProductsLoading && allProducts) {
      const foundProduct = allProducts.find(p => String(p.id) === String(productId));
      if (foundProduct) {
        setProduct(foundProduct);
        setCurrentProductReviews(foundProduct.reviews || []); // Initialize with existing reviews
        setQuantity(1);
      } else {
        setProductNotFound(true);
      }
      setLoading(false);
    } else if (!allProductsLoading && allProductsError) {
      // If there was an error fetching allProducts, we can't find the specific product
      setProductNotFound(true); // Or set a different error state for product loading
      setLoading(false);
    }
    // If allProductsLoading is true, we wait for it to complete
  }, [productId, allProducts, allProductsLoading, allProductsError]);


  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (newQuantity >= 1) setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success(`${quantity} of ${product.name} added to cart!`);
    }
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    if (!isBuyerAuthenticated) {
      toast.error("Please log in to manage your favorites.");
      switchToTab("signin"); openModal();
      return;
    }
    toggleFavorite(product);
  };

  const handleReviewSubmit = async (reviewData) => {
    if (!product || !buyerData) {
      toast.error("You must be logged in to submit a review.");
      return Promise.reject(new Error("User not authenticated or product not loaded."));
    }

    const newReview = {
      id: `review-${product.id}-${Date.now()}`, // Unique review ID
      productId: product.id,
      userId: buyerData.id,
      userName: `${buyerData.firstName} ${buyerData.lastName.charAt(0)}.`, // Example: John D.
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString(),
    };

    try {
      // Update localStorage
      const storedProducts = JSON.parse(localStorage.getItem("products")) || allProducts || [];
      let productUpdated = false;
      const updatedProducts = storedProducts.map(p => {
        if (String(p.id) === String(product.id)) {
          const existingReviews = p.reviews || [];
          const updatedReviews = [...existingReviews, newReview];
          const totalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
          const newAverageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
          
          productUpdated = true;
          return {
            ...p,
            reviews: updatedReviews,
            averageRating: parseFloat(newAverageRating.toFixed(1)),
            numberOfReviews: updatedReviews.length,
          };
        }
        return p;
      });

      if (!productUpdated) { // Product might not be in localStorage if loaded from static JSON only
          // This case is less likely if useFetchCached is working with localStorage for products
          // but as a fallback, we could try to add it. For now, assume it's found.
          console.warn("Product to review not found in localStorage for update. This might indicate an issue if localStorage is the source of truth for products.");
      }

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      invalidateCacheEntry("allProducts"); // Invalidate cache so ProductList and this page refetch

      // Update local state for immediate UI refresh
      setCurrentProductReviews(prevReviews => [...prevReviews, newReview]);
      setProduct(prevProduct => ({
        ...prevProduct,
        reviews: [...(prevProduct.reviews || []), newReview],
        averageRating: parseFloat(updatedProducts.find(p=>String(p.id) === String(product.id))?.averageRating || 0),
        numberOfReviews: updatedProducts.find(p=>String(p.id) === String(product.id))?.numberOfReviews || 0,
      }));

      toast.success("Review submitted successfully! Thank you.");
      return Promise.resolve(); // Indicate success
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Could not submit review. Please try again.");
      return Promise.reject(error); // Indicate failure
    }
  };

  // Helper to render average rating stars
  const renderAverageRating = (avgRating, numReviews) => {
    if (numReviews === 0) {
      return <span className="text-sm text-gray-500">No reviews yet</span>;
    }
    const stars = [];
    const roundedRating = Math.round(avgRating * 2) / 2; // Round to nearest 0.5
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<StarSolidIconFull key={i} className="h-5 w-5 text-yellow-400" />);
      } else if (i - 0.5 === roundedRating) { // For half star (visual approximation)
        stars.push(<StarSolidIconFull key={i} className="h-5 w-5 text-yellow-400 opacity-50" />); // Or use a proper half-star icon
      } else {
        stars.push(<StarSolidIcon key={i} className="h-5 w-5 text-gray-300" />); // Using outline for empty
      }
    }
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-2 text-sm text-gray-600">
          {avgRating.toFixed(1)} ({numReviews} review{numReviews !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };


  if (loading || allProductsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <p className="text-gray-500 text-lg animate-pulse">Loading product details...</p>
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the product with ID: "{productId}".</p>
        <Link to="/products" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Products
        </Link>
      </div>
    );
  }

  if (!product) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <p className="text-gray-500">Product details are currently unavailable.</p>
      </div>
    );
  }

  const isCurrentlyFavorite = product ? isFavorite(product.id) : false;

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-12">
          <div className="shadow-xl rounded-lg overflow-hidden bg-white relative">
              <img
                src={product.image || '/assets/placeholder.png'} 
                alt={product.name}
                className="w-full h-auto md:min-h-[450px] max-h-[650px] object-contain"
              />
              <button
                onClick={handleToggleFavorite}
                className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {isCurrentlyFavorite ? (
                  <HeartSolidIconFull className="h-7 w-7 text-red-500" />
                ) : (
                  <HeartOutlineIcon className="h-7 w-7 text-gray-600 hover:text-red-500" />
                )}
              </button>
          </div>

          <div className="flex flex-col gap-5"> 
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{product.name}</h1>
            {/* Average Rating Display */}
            <div className="mt-1 mb-2">
              {renderAverageRating(product.averageRating || 0, product.numberOfReviews || 0)}
            </div>
            <p className="text-3xl text-blue-600 font-bold">${product.price.toFixed(2)}</p>
            
            <div className="prose prose-sm sm:prose-base text-gray-700 leading-relaxed max-w-none"> {/* Added max-w-none for prose */}
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Description:</h3>
              <p>{product.description}</p>
            </div>
            
            <p className="text-sm text-gray-500">
              Category: <span className="font-medium text-gray-700">{product.category}</span>
            </p>

            <div className="flex items-center gap-3 mt-2">
              <label htmlFor="quantity" className="font-semibold text-gray-700">Quantity:</label>
              <input
                type="number" id="quantity" name="quantity" value={quantity}
                onChange={handleQuantityChange} min="1"
                className="border border-gray-300 rounded-md w-20 p-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                Add to Cart
              </button>
              {product.sellerId && ( 
                  <ContactSellerButton 
                      sellerId={product.sellerId} 
                      productName={product.name} 
                  />
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          {currentProductReviews.length > 0 ? (
            <div className="space-y-6">
              {currentProductReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet for this product. Be the first to write one!</p>
          )}

          {/* Add Review Form - Conditionally Rendered */}
          {isBuyerAuthenticated && buyerData && (
            <div className="mt-10">
              <AddReviewForm 
                productId={product.id} 
                onSubmitReview={handleReviewSubmit} 
                // Pass existing review if you implement editing later
                // existingReview={currentUserReviewForThisProduct} 
              />
            </div>
          )}
          {!isBuyerAuthenticated && (
            <p className="mt-8 text-sm text-gray-600">
              <button onClick={() => { switchToTab('signin'); openModal(); }} className="text-blue-600 hover:underline font-medium">Sign in</button> to write a review.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
