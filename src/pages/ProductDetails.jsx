import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import ContactSellerButton from "../components/ContactSellerButton";
import ReviewCard from "../components/ReviewCard"; 
import AddReviewForm from "../components/AddReviewForm"; 
import { useAuthContext } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; 
import { useFavorites } from "../context/FavoritesContext";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import { useFetchCached, invalidateCacheEntry } from "../hooks/useFetchCached"; 
import toast from 'react-hot-toast'; 
import { 
    HeartIcon as HeartOutlineIcon, 
    ShoppingCartIcon, 
    StarIcon // Using outline StarIcon for empty stars in average rating
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIconFull, StarIcon as StarSolidIconFull } from "@heroicons/react/24/solid"; 

export default function ProductDetails() {
  const { id: productId } = useParams(); 
  
  const { data: allProducts, loading: allProductsLoading, error: allProductsError } = 
    useFetchCached("products", "/data/products.json", { useLocalStoragePersistence: true });

  const [product, setProduct] = useState(null);
  const [currentProductReviews, setCurrentProductReviews] = useState([]); 
  const [quantity, setQuantity] = useState(1);
  const [isLoadingPage, setIsLoadingPage] = useState(true); 
  const [productNotFound, setProductNotFound] = useState(false);
  
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite: toggleFavoriteAction } = useFavorites(); // Renamed to avoid conflict
  
  // Use the global AuthContext
  const { isAuthenticated, currentUser, userRole, isLoading: authIsLoading } = useAuthContext(); 
  const { openModal, switchToTab } = useSignupSigninModal();

  useEffect(() => {
    // Wait for both auth state and allProducts to be loaded
    if (authIsLoading || allProductsLoading) {
      setIsLoadingPage(true);
      return;
    }
    setIsLoadingPage(true); // Reset for product finding
    setProductNotFound(false);
    setProduct(null);
    setCurrentProductReviews([]);

    if (allProducts) {
      const foundProduct = allProducts.find(p => String(p.id) === String(productId));
      if (foundProduct) {
        setProduct(foundProduct);
        setCurrentProductReviews(foundProduct.reviews || []); 
        setQuantity(1);
      } else {
        setProductNotFound(true);
      }
    } else if (allProductsError) {
      setProductNotFound(true); 
    }
    setIsLoadingPage(false);
  }, [productId, allProducts, allProductsLoading, authIsLoading, allProductsError]);


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

  // Updated to use AuthContext
  const handleToggleFavorite = () => {
    if (!product) return;
    if (!isAuthenticated || userRole !== 'Buyer') { // Check if Buyer
      toast.error("Please sign in as a Buyer to manage your favorites.");
      if (!isAuthenticated) { // Open modal only if not authenticated at all
        switchToTab("signin"); 
        openModal();
      }
      return;
    }
    toggleFavoriteAction(product); // Call the renamed function from useFavorites
  };

  // Updated to use AuthContext
  const handleReviewSubmit = async (reviewData) => {
    if (!product || !currentUser || userRole !== 'Buyer') { // Check if Buyer and currentUser exists
      toast.error("You must be signed in as a Buyer to submit a review.");
      if (!isAuthenticated) {
        switchToTab("signin");
        openModal();
      }
      return Promise.reject(new Error("User not authenticated as Buyer or product not loaded."));
    }

    const newReview = {
      id: `review-${product.id}-${Date.now()}`, 
      productId: product.id,
      userId: currentUser.id, // Use ID from AuthContext's currentUser
      userName: `${currentUser.firstName} ${currentUser.lastName.charAt(0)}.`, 
      rating: reviewData.rating,
      comment: reviewData.comment,
      date: new Date().toISOString(),
    };

    try {
      const storedProductsString = localStorage.getItem("products");
      let productsToUpdate = storedProductsString ? JSON.parse(storedProductsString) : (allProducts || []);
      
      let productUpdatedInList = false;
      const updatedProducts = productsToUpdate.map(p => {
        if (String(p.id) === String(product.id)) {
          const existingReviews = p.reviews || [];
          const updatedReviews = [...existingReviews, newReview];
          const totalRating = updatedReviews.reduce((sum, rev) => sum + rev.rating, 0);
          const newAverageRating = updatedReviews.length > 0 ? totalRating / updatedReviews.length : 0;
          
          productUpdatedInList = true;
          return {
            ...p,
            reviews: updatedReviews,
            averageRating: parseFloat(newAverageRating.toFixed(1)),
            numberOfReviews: updatedReviews.length,
          };
        }
        return p;
      });

      if (!productUpdatedInList && allProducts) {
          console.warn("Product reviewed was not found in localStorage. Review added to local state but may not persist correctly across all views without further logic to merge static and localStorage data sources if they diverge.");
      }

      localStorage.setItem("products", JSON.stringify(updatedProducts));
      invalidateCacheEntry("products"); 

      setCurrentProductReviews(prevReviews => [...prevReviews, newReview]);
      setProduct(prevProduct => {
          const updatedProductData = updatedProducts.find(p=>String(p.id) === String(prevProduct.id));
          return updatedProductData || prevProduct; 
      });

      toast.success("Review submitted successfully! Thank you.");
      return Promise.resolve(); 
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Could not submit review. Please try again.");
      return Promise.reject(error); 
    }
  };

  const renderAverageRatingStars = (avgRating = 0, numReviews = 0) => {
    if (numReviews === 0) {
      return <span className="text-sm text-gray-500">No reviews yet</span>;
    }
    const stars = [];
    const fullStars = Math.floor(avgRating);
    const hasHalfStar = avgRating % 1 >= 0.5; 

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<StarSolidIconFull key={`star-solid-${i}`} className="h-5 w-5 text-yellow-400" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<StarSolidIconFull key={`star-half-${i}`} className="h-5 w-5 text-yellow-400 opacity-70" />);
      } else {
        stars.push(<StarIcon key={`star-empty-${i}`} className="h-5 w-5 text-gray-300" />); 
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

  // Combined loading state from AuthContext and product data fetching
  if (authIsLoading || isLoadingPage) {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start mb-12">
          <div className="shadow-xl rounded-lg overflow-hidden bg-white relative">
              <img
                src={product.image || '/assets/placeholder.png'} 
                alt={product.name}
                className="w-full h-auto md:min-h-[450px] max-h-[650px] object-cover"
              />
              {/* Favorite button logic updated */}
              {(!authIsLoading && userRole !== 'Seller') && ( // Hide favorite button for Sellers or while auth is loading
                <button
                    onClick={handleToggleFavorite}
                    className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                    {isCurrentlyFavorite && isAuthenticated && userRole === 'Buyer' ? (
                    <HeartSolidIconFull className="h-7 w-7 text-red-500" />
                    ) : (
                    <HeartOutlineIcon className="h-7 w-7 text-gray-600 hover:text-red-500" />
                    )}
                </button>
              )}
          </div>

          <div className="flex flex-col gap-5"> 
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-800">{product.name}</h1>
            <div className="mt-1 mb-2">
              {renderAverageRatingStars(product.averageRating || 0, product.numberOfReviews || 0)}
            </div>
            <p className="text-3xl text-blue-600 font-bold">${product.price.toFixed(2)}</p>
            
            <div className="prose prose-sm sm:prose-base text-gray-700 leading-relaxed max-w-none">
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
              {/* Add to Cart Button: Conditionally render or disable for Sellers */}
              {(!authIsLoading && userRole !== 'Seller') && (
                <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
                >
                    <ShoppingCartIcon className="h-6 w-6" />
                    Add to Cart
                </button>
              )}
              {/* Contact Seller Button: Conditionally render for Buyers */}
              {product.sellerId && (!authIsLoading && userRole !== 'Seller') && ( 
                  <ContactSellerButton 
                      sellerId={product.sellerId} 
                      productName={product.name} 
                  />
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 bg-white p-6 sm:p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
          {currentProductReviews.length > 0 ? (
            <div className="space-y-6">
              {currentProductReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 py-4">No reviews yet for this product. Be the first to write one!</p>
          )}

          {/* Add Review Form - Conditionally Rendered based on AuthContext */}
          {!authIsLoading && isAuthenticated && userRole === 'Buyer' && currentUser && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <AddReviewForm 
                productId={product.id} 
                onSubmitReview={handleReviewSubmit} 
              />
            </div>
          )}
          {!authIsLoading && !isAuthenticated && ( // Prompt to sign in if guest
            <p className="mt-8 text-sm text-gray-600 py-4">
              <button onClick={() => { switchToTab('signin'); openModal(); }} className="text-blue-600 hover:underline font-medium">Sign in</button> to write a review.
            </p>
          )}
           {!authIsLoading && isAuthenticated && userRole === 'Seller' && ( // Message for sellers
            <p className="mt-8 text-sm text-gray-600 py-4 bg-yellow-50 p-3 rounded-md border border-yellow-200">
              Review submission is available for Buyer accounts.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
