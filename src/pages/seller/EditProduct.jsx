// src/pages/seller/EditProduct.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, XCircleIcon } from "@heroicons/react/24/outline"; // Using ArrowUpTrayIcon
import productsData from "../../data/products.json"; // Fallback if not in localStorage
import { invalidateCacheEntry } from "../../hooks/useFetchCached";

export default function EditProduct() {
  const { id: productId } = useParams(); // Get product id from URL
  const { sellerData, isLoading: isAuthLoading } = useAuth(); // Get sellerData and auth loading state
  const navigate = useNavigate();

  // Initial form data structure
  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "Dress", // Default category
    // image will be handled by imagePreview and existingImageUrl
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);    // For a new image file
  const [imagePreview, setImagePreview] = useState("");      // For the image preview URL (blob or existing URL)
  const [existingImageUrl, setExistingImageUrl] = useState(""); // To store the original image URL
  const [errors, setErrors] = useState({});                  // For form validation errors
  const [isSubmitting, setIsSubmitting] = useState(false);   // To disable button during submission
  const [isLoadingProduct, setIsLoadingProduct] = useState(true); // To show loading state for product data

  // Sidebar links for sellers
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard" }, // Add icons here if your Sidebar supports them
    { label: "My Products", path: "/seller/products" },
    { label: "Add Product", path: "/seller/add-product" },
    { label: "Messages", path: "/seller/messages" }
  ];

  // Effect to load product information when the component mounts or productId/sellerData changes
  useEffect(() => {
    if (!sellerData) { // If sellerData is not yet loaded (e.g. on direct page load), wait.
        setIsLoadingProduct(true); // Keep showing loading for product until sellerData is available
        return;
    }

    setIsLoadingProduct(true);
    let productToEdit = null;
    const localProducts = JSON.parse(localStorage.getItem("products")) || [];
    
    // Find the product in localStorage that matches the productId and belongs to the current seller
    productToEdit = localProducts.find(p => String(p.id) === String(productId) && String(p.sellerId) === String(sellerData.id));

    // Fallback to static data if not found in localStorage (less likely for edit but good for robustness)
    if (!productToEdit && productsData) {
        const staticProduct = productsData.find(p => String(p.id) === String(productId) && String(p.sellerId) === String(sellerData.id));
        if (staticProduct) productToEdit = staticProduct; // This scenario is less likely for an edit flow
    }

    if (productToEdit) {
      setFormData({ // Pre-fill form with existing product data
        name: productToEdit.name,
        description: productToEdit.description,
        price: String(productToEdit.price), // Ensure price is a string for the input field
        category: productToEdit.category,
      });
      setImagePreview(productToEdit.image); // Set initial preview to the existing image URL
      setExistingImageUrl(productToEdit.image); // Store the original image URL
    } else {
      toast.error("Product not found or you do not have permission to edit it.");
      navigate("/seller/products"); // Redirect if product not found or not owned by seller
    }
    setIsLoadingProduct(false); // Product data loading finished
  }, [productId, sellerData, navigate]); // Dependencies for this effect

  // Effect to clean up the object URL for new image previews
  useEffect(() => {
    const currentPreview = imagePreview; // Capture current value for cleanup logic
    return () => {
      // Revoke blob URL only if it's a new preview and not the original existing image URL
      if (currentPreview && currentPreview.startsWith("blob:") && currentPreview !== existingImageUrl) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [imagePreview, existingImageUrl]); // Rerun if imagePreview or existingImageUrl changes

  // Validation function for individual fields
  const validateField = useCallback((name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Product name is required.";
        else if (value.trim().length < 3) error = "Name must be at least 3 characters.";
        break;
      case "description":
        if (!value.trim()) error = "Description is required.";
        else if (value.trim().length < 10) error = "Description must be at least 10 characters.";
        break;
      case "price":
        if (!value) error = "Price is required.";
        else if (isNaN(value) || Number(value) <= 0) error = "Price must be a positive number.";
        break;
      case "category":
        if (!value) error = "Category is required.";
        break;
      default:
        break;
    }
    return error;
  }, []);

  // Handle changes in text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Validate field on change and update errors
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || null }));
  };

  // Handle blur event for text inputs (validate when user moves out of a field)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || null }));
  };

  // Handle new image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
        setErrors(prev => ({ ...prev, image: "File is too large (max 5MB)." }));
        setSelectedFile(null);
        setImagePreview(existingImageUrl || ""); // Revert to existing image if new one is invalid
        e.target.value = null; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Invalid file type (JPEG, PNG, GIF, WEBP)." }));
        setSelectedFile(null);
        setImagePreview(existingImageUrl || ""); // Revert to existing image
        e.target.value = null; // Reset file input
        return;
      }
      
      // If there was a previous blob preview (not the original image), revoke it
      if (imagePreview && imagePreview.startsWith("blob:") && imagePreview !== existingImageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setSelectedFile(file); // Store the new file
      const previewUrl = URL.createObjectURL(file); // Create a new blob URL for preview
      setImagePreview(previewUrl);
      setErrors(prev => ({ ...prev, image: null })); // Clear image error
    }
  };

  // Remove the current image preview (either new or existing)
  const removeImagePreview = () => {
    // If removing a newly selected blob preview, revoke its URL
    if (imagePreview && imagePreview.startsWith("blob:") && imagePreview !== existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null); // Clear selected file
    setImagePreview("");   // Clear the preview (user will see upload prompt)
    // Note: existingImageUrl remains, so if user saves without new image, it might be lost if not handled in submit
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = null; // Reset the file input field
    setErrors(prev => ({ ...prev, image: null })); // Clear image error
  };

  // Validate the entire form before submission
  const validateForm = () => {
    const newErrors = {};
    // Validate text fields
    Object.keys(initialFormState).forEach(key => {
        if (key !== 'image') { // Image is handled separately
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        }
    });
    // Image is required: there must be an existing image or a new one selected if imagePreview is cleared
    if (!imagePreview && !selectedFile && !existingImageUrl) { 
        newErrors.image = "Product image is required.";
    } else if (!imagePreview && existingImageUrl && !selectedFile) {
        // This means user explicitly removed the existing image and didn't select a new one.
        // If an image is always mandatory, this should be an error.
        // For now, we assume removing means they want no image or will use a placeholder.
        // If image is mandatory, this should be: newErrors.image = "Product image is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // True if no errors
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      setIsSubmitting(false);
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay

    let finalImageUrl = existingImageUrl; // Start with the existing image URL
    if (selectedFile) {
      // If a new file was selected, generate a new mock URL for it
      // In a real app, upload selectedFile here and get the new URL from server
      const mockImageFileName = `${formData.category.toLowerCase().replace(/\s+/g, '-')}-${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()%1000}.jpg`;
      finalImageUrl = `/assets/products/${mockImageFileName}`; // Placeholder for new image URL
    } else if (!imagePreview && existingImageUrl) {
      // If the preview was cleared (meaning user removed the image) and there was an existing image,
      // this implies the user wants to remove the image. Set to a placeholder or handle as needed.
      // If an image is always required, validateForm should have caught this.
      finalImageUrl = "/assets/placeholder.png"; // Or "" if image can be optional
    }


    const updatedProductData = {
      id: productId, // Keep the original ID
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: finalImageUrl, // Use the determined final image URL
      sellerId: sellerData.id 
    };

    const existingProducts = JSON.parse(localStorage.getItem("products")) || [];
    // Map through products and update the one with the matching ID
    const updatedProducts = existingProducts.map(p => 
      String(p.id) === String(productId) ? updatedProductData : p
    );
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    
    invalidateCacheEntry("allProducts");

    toast.success("Product updated successfully!");
    setIsSubmitting(false);
    navigate("/seller/products"); // Navigate back to product list
  };

  // Show loading state if auth data or product data is still loading
  if (isAuthLoading || isLoadingProduct) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar links={sellerLinks} /> {/* Show sidebar even during load */}
            <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
                <p className="text-gray-500 animate-pulse">Loading product data...</p>
            </main>
        </div>
    );
  }

  // Main form render
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={sellerLinks} userRole="Seller" userName={sellerData?.firstName} /> {/* Pass user info to sidebar */}
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update the details for your product: <span className="font-medium text-gray-700">{formData.name || "Loading..."}</span></p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6 max-w-3xl mx-auto">
          {/* Product Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text" name="name" id="name" value={formData.name}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description" id="description" value={formData.description}
              onChange={handleChange} onBlur={handleBlur} rows="4"
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            ></textarea>
            {errors.description && <p className="text-xs text-red-600 mt-1.5">{errors.description}</p>}
          </div>

          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
              <input
                type="number" name="price" id="price" value={formData.price}
                onChange={handleChange} onBlur={handleBlur} step="0.01"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              />
              {errors.price && <p className="text-xs text-red-600 mt-1.5">{errors.price}</p>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select
                name="category" id="category" value={formData.category}
                onChange={handleChange} onBlur={handleBlur}
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm bg-white ${errors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              >
                <option value="Dress">Dress</option>
                <option value="Jacket">Jacket</option>
                <option value="Kids">Kids</option>
                <option value="Shirt">Shirt</option>
                <option value="T-shirt">T-shirt</option>
                <option value="Trouser">Trouser</option>
              </select>
              {errors.category && <p className="text-xs text-red-600 mt-1.5">{errors.category}</p>}
            </div>
          </div>
          
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Image</label>
            <div className={`mt-1 flex flex-col items-center justify-center px-6 pt-8 pb-8 border-2 ${errors.image ? 'border-red-400' : 'border-gray-300'} border-dashed rounded-lg hover:border-blue-400 transition-colors`}>
              {!imagePreview ? ( 
                <div className="space-y-2 text-center">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label
                      htmlFor="imageUpload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-1"
                    >
                      <span>Upload an image</span>
                      <input id="imageUpload" name="imageUpload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif, image/webp" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                </div>
              ) : (
                <div className="relative group w-full max-w-xs mx-auto">
                  <img src={imagePreview} alt="Product Preview" className="mx-auto h-48 w-auto object-contain rounded-md shadow-md" />
                  <button
                    type="button"
                    onClick={removeImagePreview}
                    className="absolute -top-3 -right-3 p-1.5 bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-300 hover:bg-red-700"
                    aria-label="Remove or change image"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
            {errors.image && <p className="text-xs text-red-600 mt-1.5">{errors.image}</p>}
            {existingImageUrl && imagePreview === existingImageUrl && !selectedFile && ( // Show if current preview is the original and no new file is staged
                <p className="text-xs text-gray-500 mt-1 text-center">Currently using existing image. Upload a new file to change it.</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
