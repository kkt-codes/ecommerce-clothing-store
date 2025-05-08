import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// Removed ContactSellerButton for now- to focus on cart
// import ContactSellerButton from "../components/ContactSellerButton";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useCart } from "../context/CartContext"; 
import productsData from "../data/products.json"; // Import static data directly for simplicity here

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // State for quantity
  const { isAuthenticated } = useBuyerAuth(); // Removed buyerData for now as it's not directly used in this simplified add to cart
  const { addToCart } = useCart();

  useEffect(() => {
    // Simplified product fetching for this step
    // In a real app, you'd fetch or use your useFetchCached hook
    let foundProduct = null;
    const localProducts = JSON.parse(localStorage.getItem("products")) || [];
    
    if (localProducts.length > 0) {
        foundProduct = localProducts.find((p) => p.id === id);
    }
    
    if (!foundProduct) {
        foundProduct = productsData.find((p) => p.id === id);
    }
    setProduct(foundProduct);

    // Reset quantity when product changes
    setQuantity(1);

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
      // alert(`${quantity} of ${product.name} added to cart!`); // Feedback
      console.log(`${quantity} of ${product.name} added to cart!`);
    }
  };

  // Removed old handleOrder function for now

  if (!product) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-gray-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <img
          src={product.image || '/assets/placeholder.png'} // Added placeholder
          alt={product.name}
          className="w-full h-auto md:h-[400px] object-cover rounded-lg shadow-lg"
        />
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold">${product.price.toFixed(2)}</p>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>
          <p className="text-sm text-gray-500">Category: {product.category}</p>

          {/* Quantity Selector */}
          <div className="flex items-center gap-3 mt-4">
            <label htmlFor="quantity" className="font-semibold">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              className="border rounded w-20 p-2 text-center"
            />
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="mt-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition text-lg font-semibold"
          >
            Add to Cart
          </button>

          {/* Contact Seller Button - kept  */}
          {/* <div className="mt-4">
             <ContactSellerButton sellerId={product.sellerId} />
          </div> */}

          {/* Message for non-logged in users regarding ordering will be handled by cart page */}
        </div>
      </div>
    </div>
  );
}