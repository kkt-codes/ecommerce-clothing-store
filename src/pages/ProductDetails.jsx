// src/pages/ProductDetails.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"; // Added Link for "Product Not Found" state
import ContactSellerButton from "../components/ContactSellerButton"; // Re-enabled
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useCart } from "../context/CartContext"; 
import productsData from "../data/products.json"; 
import toast from 'react-hot-toast'; 

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true); // Added loading state
  const [productNotFound, setProductNotFound] = useState(false); // Added not found state
  // const { isAuthenticated } = useBuyerAuth(); // Not directly used in this component's logic anymore
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    setProductNotFound(false);
    setProduct(null); // Reset product on ID change

    console.log("ProductDetails: Attempting to find product with ID:", id);

    let foundProduct = null;
    try {
      const localProductsString = localStorage.getItem("products");
      const localProducts = localProductsString ? JSON.parse(localProductsString) : [];
      console.log("ProductDetails: Products from localStorage:", localProducts);
      
      if (localProducts.length > 0) {
          // Ensure consistent ID comparison (e.g., if one is number and other is string)
          foundProduct = localProducts.find((p) => String(p.id) === String(id));
      }
      
      if (!foundProduct) {
          console.log("ProductDetails: Product not in localStorage, checking static data (productsData).");
          console.log("ProductDetails: Static productsData:", productsData);
          if (productsData && Array.isArray(productsData)) {
            foundProduct = productsData.find((p) => String(p.id) === String(id));
          } else {
            console.error("ProductDetails: Static productsData is not a valid array or is undefined.");
          }
      }
    } catch (error) {
        console.error("ProductDetails: Error accessing localStorage or parsing products:", error);
        // Potentially set an error state here
    }
    
    console.log("ProductDetails: Final foundProduct:", foundProduct);

    if (foundProduct) {
        setProduct(foundProduct);
        setQuantity(1); // Reset quantity for the new product
    } else {
        setProductNotFound(true);
    }
    setLoading(false);
  }, [id]); // Dependency array includes 'id'

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500 text-lg">Loading product details...</p>
      </div>
    );
  }

  if (productNotFound) {
    return (
      <div className="flex flex-col justify-center items-center h-96 text-center px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, we couldn't find the product with ID: "{id}". It might have been removed or the link is incorrect.</p>
        <Link to="/products" className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            View All Products
        </Link>
      </div>
    );
  }

  // This check is a fallback, ideally loading/productNotFound states handle all scenarios before this
  if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">An unexpected error occurred while loading product details.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
        <div className="shadow-xl rounded-lg overflow-hidden bg-gray-100"> {/* Added bg for placeholder visibility */}
            <img
              src={product.image || '/assets/placeholder.png'} 
              alt={product.name}
              className="w-full h-auto md:h-[500px] object-cover" 
            />
        </div>
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
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="border border-gray-300 rounded-md w-20 p-2 text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-3 sm:space-y-0 sm:flex sm:gap-4">
            <button
              onClick={handleAddToCart}
              className="w-full sm:w-auto flex-grow px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 text-lg font-semibold shadow-md hover:shadow-lg"
            >
              Add to Cart
            </button>
            {/* Contact Seller Button */}
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
