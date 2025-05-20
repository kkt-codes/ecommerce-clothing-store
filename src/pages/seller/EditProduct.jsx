import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuthContext } from "../../context/AuthContext";
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, XCircleIcon, ChartBarIcon, ArchiveBoxIcon, PlusCircleIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline"; // Ensure @heroicons/react is installed
import initialProductsData from "../../data/products.json"; // Fallback if not in localStorage
import { invalidateCacheEntry } from "../../hooks/useFetchCached"; // Placeholder: For cache invalidation

// Mock Hooks and Context for standalone functionality if needed for testing
// const useNavigate = () => (path) => console.log(`Navigate to: ${path}`);
// const useAuthContext = () => ({
//   currentUser: { id: 'seller123', firstName: 'John' },
//   isLoading: false,
//   userRole: 'Seller',
// });
// const invalidateCacheEntry = (key) => console.log(`Cache invalidated for: ${key}`);
// const initialProductsData = []; // Mock if products.json is not available
// const Sidebar = ({ links, userRole, userName }) => (
//   <div className="w-64 bg-gray-800 text-white p-4">
//     <h2 className="text-xl font-bold mb-4">{userName} ({userRole})</h2>
//     <nav>
//       <ul>
//         {links.map(link => (
//           <li key={link.path} className="mb-2">
//             <a href={link.path} className="hover:bg-gray-700 p-2 rounded-md flex items-center">
//               {link.icon && <link.icon className="h-5 w-5 mr-2" />}
//               {link.label}
//             </a>
//           </li>
//         ))}
//       </ul>
//     </nav>
//   </div>
// );


export default function EditProduct() {
  const { id: productId } = useParams();
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext();
  const navigate = useNavigate();

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "Dress",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null); // Stores the new File object if user uploads one
  const [imagePreview, setImagePreview] = useState("");   // Stores Data URL (base64) for preview and submission
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [originalProductName, setOriginalProductName] = useState(""); // For header display

  // Seller Sidebar Links
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  // Effect to load product data
  useEffect(() => {
    if (isAuthLoading) {
      setIsLoadingProduct(true);
      return;
    }
    if (!currentUser || userRole !== 'Seller') {
      toast.error("You must be signed in as a Seller to edit products.");
      navigate("/seller/dashboard"); // Or your login/home page
      setIsLoadingProduct(false);
      return;
    }

    setIsLoadingProduct(true);
    let productToEdit = null;
    let currentProducts = [];
    try {
      const localProductsString = localStorage.getItem("products");
      // Use initialProductsData as a fallback if localStorage is empty or invalid
      currentProducts = localProductsString ? JSON.parse(localProductsString) : initialProductsData;
    } catch (e) {
      console.error("Error parsing products from localStorage for edit page:", e);
      currentProducts = initialProductsData; // Fallback to static data on error
    }

    // Find the product ensuring IDs and sellerId match
    productToEdit = currentProducts.find(p => String(p.id) === String(productId) && String(p.sellerId) === String(currentUser.id));

    if (productToEdit) {
      setFormData({
        name: productToEdit.name,
        description: productToEdit.description,
        price: String(productToEdit.price), // Ensure price is a string for the input field
        category: productToEdit.category,
      });
      // imagePreview will store the Data URL (base64) from localStorage
      setImagePreview(productToEdit.image || ""); // Initialize with existing image or empty string
      setOriginalProductName(productToEdit.name); // For display in header
    } else {
      toast.error("Product not found or you do not have permission to edit it.");
      navigate("/seller/products");
    }
    setIsLoadingProduct(false);
  }, [productId, currentUser, userRole, isAuthLoading, navigate]);

  // Note: The useEffect for revoking blob URLs is removed as we are now directly using Data URLs (base64)
  // for imagePreview, similar to AddProduct.jsx.

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || null }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error || null }));
  };

  // Handles new image selection, converts to Data URL (base64) for preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Max 1MB
        setErrors(prev => ({ ...prev, image: "File is too large (max 1MB)." }));
        setSelectedFile(null); // Clear selected file
        // Do not revert imagePreview here, user might want to keep existing if new one is invalid
        e.target.value = null; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Invalid file type (JPEG, PNG, GIF, WEBP)." }));
        setSelectedFile(null);
        e.target.value = null; // Reset file input
        return;
      }

      setSelectedFile(file); // Store the new File object

      // Convert file to Data URL (base64 string) for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set imagePreview to the new Data URL
      };
      reader.onerror = () => {
        console.error("Error reading file for Data URL.");
        toast.error("Could not read image file.");
        setErrors(prev => ({ ...prev, image: "Could not read image file." }));
        setSelectedFile(null); // Clear on error
        // Potentially revert to original image if desired, or leave as is
        // For now, if read fails, preview might be broken or show old if not cleared.
        // Let's clear selectedFile and let user try again.
        e.target.value = null;
      }
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null })); // Clear image error if any
    }
  };

  // Removes the current image preview (whether it's new or existing being shown)
  // and clears any newly selected file.
  const removeImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(""); // Clear the Data URL, so upload prompt shows
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = null; // Reset file input
    setErrors(prev => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    // Validate text fields
    Object.keys(initialFormState).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Validate image: An image is required.
    // imagePreview will be empty if user clicked "remove" or if it was never there and not uploaded.
    if (!imagePreview) {
      newErrors.image = "Product image is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser || userRole !== 'Seller') {
      toast.error("Authentication error. Please sign in as a Seller.");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      setIsSubmitting(false);
      return;
    }

    // Simulate API delay (optional)
    // await new Promise(resolve => setTimeout(resolve, 1000));

    // The imagePreview state holds the Data URL (base64 string) of the image to be saved.
    // This will be the newly uploaded image's Data URL if 'selectedFile' was processed,
    // or the existing image's Data URL if no new image was selected and validated,
    // or an empty string if the user removed the image (and validation allows it - current doesn't).
    const imageUrlToStore = imagePreview;

    const updatedProductData = {
      id: productId, // Keep the original product ID
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: imageUrlToStore, // This is the Base64 Data URL
      sellerId: currentUser.id
    };

    try {
      let currentProducts = [];
      const localProductsString = localStorage.getItem("products");
      currentProducts = localProductsString ? JSON.parse(localProductsString) : initialProductsData;

      const updatedProducts = currentProducts.map(p =>
        String(p.id) === String(productId) ? updatedProductData : p
      );
      localStorage.setItem("products", JSON.stringify(updatedProducts));

      invalidateCacheEntry("products"); // Invalidate product cache

      toast.success("Product updated successfully!");
      navigate("/seller/products");

    } catch (error) {
      console.error("Error updating product in localStorage:", error);
      if (error.name === 'QuotaExceededError') {
        toast.error("Failed to save product. Storage limit possibly exceeded.");
      } else {
        toast.error("Failed to update product. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render loading state for auth or product data
  if (isAuthLoading || isLoadingProduct) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading product data...</p>
        </main>
      </div>
    );
  }

  // Render access denied if not a seller (should be caught by ProtectedRoute ideally)
  if (!currentUser || userRole !== 'Seller') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-600">Access Denied. Please sign in as a Seller.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update the details for: <span className="font-medium text-gray-700">{formData.name || originalProductName || "Product"}</span></p>
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

          {/* Price and Category Grid */}
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

          {/* Product Image Upload */}
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
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 1MB</p>
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
            {/* Informative text if showing an existing image and no new file is selected */}
            {imagePreview && !selectedFile && (formData.name || originalProductName) &&  /* Check if it's an existing product being edited */
                 <p className="text-xs text-gray-500 mt-1 text-center">
                    Currently showing existing image. Upload a new file to change it, or click 'X' to remove.
                 </p>
            }
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading}
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
