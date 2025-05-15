// View/edit/delete products

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';

/* Seller Products Management Page */
export default function SellerProducts() {
  const { sellerData } = useAuth();
  const [allProducts, setAllProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);

  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  // Load products from JSON
  useEffect(() => {
    fetch("/data/products.json")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        // Filter only products belonging to logged-in seller
        const filtered = data.filter((p) => p.sellerId === sellerData?.id);
        setSellerProducts(filtered);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, [sellerData]);

  // Handle Delete Product
  const handleDelete = (productId, productName) => {
    toast(
      (t) => ( // t is the toast instance, allows dismissing programmatically
        <div className="flex flex-col items-center p-2">
          <p className="text-sm font-medium text-gray-900 mb-2">
            Delete "{productName}"?
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Are you sure you want to delete this product? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Actual delete logic
                const localProducts = JSON.parse(localStorage.getItem("products")) || [];
                const updatedProducts = localProducts.filter((p) => p.id !== productId);
                localStorage.setItem("products", JSON.stringify(updatedProducts));
                setSellerProducts(updatedProducts); // Update local state to re-render
                toast.success("Product deleted.", { id: t.id }); // Dismiss confirm toast and show success
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)} // Dismiss the toast
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keep open until dismissed by user action
        position: "top-center",
        style: {
          background: 'white', // Custom style for confirm toast
          color: 'black',
          border: '1px solid #e0e0e0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={sellerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Products</h1>
          <Link to="/seller/add-product" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add New Product
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {sellerProducts.length > 0 ? (
            sellerProducts.map((product) => (
              <div key={product.id} className="border rounded shadow hover:shadow-lg transition p-4 flex flex-col gap-2">
                <img src={product.image} alt={product.name} className="h-40 object-cover rounded" />
                <h2 className="text-lg font-bold">{product.name}</h2>
                <p className="text-blue-600 font-semibold">${product.price}</p>
                <div className="flex justify-between mt-4">
                  <Link
                    to={`/seller/edit-product/${product.id}`}
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-gray-600">You have no products yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

