import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';

/* Seller Edit Product Page */
export default function EditProduct() {
  const { id } = useParams(); // Get product id from URL
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

  // Load product info
  useEffect(() => {
    const localProducts = JSON.parse(localStorage.getItem("products")) || [];
    const product = localProducts.find((p) => p.id === id && p.sellerId === sellerData?.id);

    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        image: product.image
      });
    } else {
      toast.error("Product not found!");
      navigate("/seller/products");
    }
  }, [id, sellerData, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle Update Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, description, price, category, image } = formData;

    if (!name || !description || !price || !category || !image) {
      toast.error("Please fill in all fields.");
      return;
    }

    const localProducts = JSON.parse(localStorage.getItem("products")) || [];
    const updatedProducts = localProducts.map((p) => {
      if (p.id === id) {
        return { ...p, ...formData, price: parseFloat(price) };
      }
      return p;
    });

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    toast.success("Product updated successfully!");
    navigate("/seller/products");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={sellerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">Edit Product</h1>

        {/* Edit Product Form */}
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

          {/* Description */}
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

          {/* Update Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
            >
              Update Product
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

