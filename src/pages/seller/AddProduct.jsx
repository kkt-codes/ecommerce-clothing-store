// src/pages/seller/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';
import { CameraIcon, XCircleIcon } from "@heroicons/react/24/outline";

/* Seller Add Product Page */
export default function AddProduct() {
  const { sellerData } = useAuth();
  const navigate = useNavigate();

  const initialFormData = {
    name: "",
    description: "",
    price: "",
    category: "Dress", // Default category
    // Image will be handled by selectedFile and imagePreview
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null); // For the actual image file
  const [imagePreview, setImagePreview] = useState("");   // For the image preview URL
  const [errors, setErrors] = useState({});               // For form validation errors

  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" },
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  // Clean up the object URL when the component unmounts or imagePreview changes
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        setErrors(prev => ({ ...prev, image: "File is too large (max 5MB)." }));
        setSelectedFile(null);
        setImagePreview("");
        e.target.value = null; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Invalid file type. Please select an image (JPEG, PNG, GIF, WEBP)." }));
        setSelectedFile(null);
        setImagePreview("");
        e.target.value = null; // Reset file input
        return;
      }
      
      setSelectedFile(file);
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setErrors(prev => ({ ...prev, image: null })); // Clear image error
    } else {
      setSelectedFile(null);
      setImagePreview("");
    }
  };

  const removeImagePreview = () => {
    setSelectedFile(null);
    setImagePreview("");
    // Reset the file input visually by targeting its id
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) {
        fileInput.value = null;
    }
    setErrors(prev => ({ ...prev, image: null }));
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required.";
    if (!formData.description.trim()) newErrors.description = "Description is required.";
    if (!formData.price) {
        newErrors.price = "Price is required.";
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
        newErrors.price = "Price must be a positive number.";
    }
    if (!formData.category) newErrors.category = "Category is required.";
    if (!selectedFile && !imagePreview) { // Check if no new file is selected and no existing preview (for edit mode later)
        newErrors.image = "Product image is required.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };


  // Handle Form Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      return;
    }

    // For now, we'll use a placeholder image path when saving to localStorage,
    // as storing base64 for many images isn't ideal for localStorage.
    // The local preview (imagePreview) is for UI demonstration.
    // In a real app, you'd upload 'selectedFile' to a server and get back a URL.
    
    // Create a mock image URL based on product name and category for variety
    // This is just a placeholder strategy.
    const mockImageFileName = `${formData.category.toLowerCase()}-${formData.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const mockImageUrl = `/assets/products/${mockImageFileName}`; // Assumes you might add such images to public/assets/products later for consistency

    const newProduct = {
      id: `product-${Date.now()}`, // Unique ID
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: imagePreview ? mockImageUrl : "/assets/placeholder.png", // Use mock URL if preview exists, else placeholder
      sellerId: sellerData.id 
    };

    const existingProducts = JSON.parse(localStorage.getItem("products")) || [];
    const updatedProducts = [...existingProducts, newProduct];
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    toast.success("Product added successfully!");
    setFormData(initialFormData); // Reset form
    setSelectedFile(null);
    setImagePreview("");
    setErrors({});
    navigate("/seller/products");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={sellerLinks} />

      <div className="flex-1 p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg space-y-6">
          
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            ></textarea>
            {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                type="number"
                name="price"
                id="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01" // For currency
                className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleChange}
                className={`w-full px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              >
                <option value="Dress">Dress</option>
                <option value="Jacket">Jacket</option>
                <option value="Kids">Kids</option>
                <option value="Shirt">Shirt</option>
                <option value="T-shirt">T-shirt</option>
                <option value="Trouser">Trouser</option>
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
            </div>
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.image ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
              <div className="space-y-1 text-center">
                {!imagePreview ? (
                  <>
                    <CameraIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="imageUpload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <input id="imageUpload" name="imageUpload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                  </>
                ) : (
                  <div className="relative group">
                    <img src={imagePreview} alt="Product Preview" className="mx-auto h-48 w-auto rounded-md shadow-sm" />
                    <button
                      type="button"
                      onClick={removeImagePreview}
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                      aria-label="Remove image"
                    >
                      <XCircleIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            {errors.image && <p className="text-xs text-red-600 mt-1">{errors.image}</p>}
          </div>


          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 font-semibold"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
