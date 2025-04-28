// Info + Contact Seller

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ContactSellerButton from "../components/ContactSellerButton";
import { useBuyerAuth } from "../hooks/useBuyerAuth";

/* Product Details Page */
export default function ProductDetails() {
  const { id } = useParams(); // Get product ID from URL
  const [product, setProduct] = useState(null);
  const { isAuthenticated, buyerData } = useBuyerAuth(); // Get buyer info

  // Load product on mount
  useEffect(() => {
    // First, check localStorage (in case seller added products)
    const localProducts = JSON.parse(localStorage.getItem("products")) || [];

    if (localProducts.length > 0) {
      const found = localProducts.find((p) => p.id === id);
      setProduct(found);
    } else {
      // Fallback: Fetch from static JSON
      fetch("/data/products.json")
        .then((res) => res.json())
        .then((data) => {
          const found = data.find((p) => p.id === id);
          setProduct(found);
        })
        .catch((err) => console.error("Error loading product:", err));
    }
  }, [id]);

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
        
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-[400px] object-cover rounded-lg shadow-lg"
        />

        {/* Product Details */}
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl text-blue-600 font-bold">${product.price}</p>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-sm text-gray-400">Category: {product.category}</p>

          {/* Contact Seller */}
          <ContactSellerButton sellerId={product.sellerId} />

          {/* ======= Order Now Button ======= */}
          {isAuthenticated ? (
            <button
              onClick={() => handleOrder()}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Order Now
            </button>
          ) : (
            <p className="text-red-500 text-sm mt-4">Please login as Buyer to order.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Handle Order
  function handleOrder() {
    const orders = JSON.parse(localStorage.getItem("orders")) || [];

    const newOrder = {
      id: `order-${Date.now()}`,
      buyerId: buyerData.id,
      buyerName: `${buyerData.firstName} ${buyerData.lastName}`,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      date: new Date().toLocaleString()
    };

    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    alert("Order placed successfully!");
  }
}

