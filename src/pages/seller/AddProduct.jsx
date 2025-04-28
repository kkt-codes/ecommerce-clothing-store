// Form

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";

/* Seller Add Product Page */
export default function AddProduct() {
  const { sellerData } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Dress",
    image: ""
  });

  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, description, price, category, image } = formData;

    if (!name || !description || !price || !category || !image) {
      alert("Please fill in all fields.");
      return;
    }

    // Create new product object
    const newProduct = {
      id: `product-${Date.now()}`,
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      sellerId: sellerData.id
    };

    // Save locally (real backend would POST to API)
    const existingProducts = JSON.parse(localStorage.getItem("products")) || [];
    const updatedProducts = [...existingProducts, newProduct];
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    alert("Product added successfully!");
    navigate("/seller/products");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={sellerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">Add New Product</h1>

        {/* Add Product Form */}
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>

          {/* Product Name */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Price */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Price ($)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="Dress">Dress</option>
              <option value="Jacket">Jacket</option>
              <option value="Kids">Kids</option>
              <option value="Shirt">Shirt</option>
              <option value="T-shirt">T-shirt</option>
              <option value="Trouser">Trouser</option>
            </select>
          </div>

          {/* Image URL */}
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description (spanning full width) */}
          <div className="flex flex-col md:col-span-2">
            <label className="mb-1 font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
            >
              Add Product
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

