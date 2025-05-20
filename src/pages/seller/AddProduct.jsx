import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom v6+
import Sidebar from "../../components/Sidebar"; // Placeholder: Ensure this path is correct
import { useAuthContext } from "../../context/AuthContext"; // Placeholder: Ensure this path is correct
import { invalidateCacheEntry } from "../../hooks/useFetchCached"; // Placeholder: Ensure this path is correct
import toast from 'react-hot-toast';
import { CameraIcon, XCircleIcon, ArrowUpTrayIcon, ChartBarIcon, ArchiveBoxIcon, PlusCircleIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline"; // Ensure @heroicons/react is installed

// Mock Hooks and Context for standalone functionality if needed for testing
// const useNavigate = () => (path) => console.log(`Navigate to: ${path}`);
// const useAuthContext = () => ({
//   currentUser: { id: 'seller123', firstName: 'John' },
//   isLoading: false,
//   userRole: 'Seller',
// });
// const invalidateCacheEntry = (key) => console.log(`Cache invalidated for: ${key}`);
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


export default function AddProduct() {
  // Use AuthContext to get current user (seller) data and loading state
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext();
  const navigate = useNavigate();

  const initialFormData = {
    name: "",
    description: "",
    price: "",
    category: "Dress",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(""); // This will store the Data URL (base64)
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Define sellerLinks here, including icons
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  // useEffect for revoking Object URLs is no longer needed if imagePreview stores Data URLs.
  // If imagePreview could potentially hold blob URLs from other sources (unlikely in this flow),
  // then a cleanup for 'blob:' URLs would still be relevant.
  // For this refactor, assuming imagePreview will be a Data URL or empty.

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) { // Max 1MB
        setErrors(prev => ({ ...prev, image: "File is too large (max 1MB)." }));
        setSelectedFile(null);
        setImagePreview("");
        e.target.value = null; // Reset file input
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Invalid file type (JPEG, PNG, GIF, WEBP)." }));
        setSelectedFile(null);
        setImagePreview("");
        e.target.value = null; // Reset file input
        return;
      }

      setSelectedFile(file);
      // Convert file to Data URL (base64 string)
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set imagePreview to the Data URL
      };
      reader.onerror = () => {
        console.error("Error reading file for Data URL.");
        toast.error("Could not read image file.");
        setErrors(prev => ({ ...prev, image: "Could not read image file." }));
        setSelectedFile(null);
        setImagePreview("");
        e.target.value = null;
      }
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, image: null }));
    } else {
      setSelectedFile(null);
      setImagePreview("");
    }
  };

  const removeImagePreview = () => {
    setSelectedFile(null);
    setImagePreview(""); // Clear the Data URL
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = null; // Reset file input
    setErrors(prev => ({ ...prev, image: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    if (!selectedFile) { // Or check !imagePreview if Data URL is the source of truth
      newErrors.image = "Product image is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentUser || userRole !== 'Seller') {
      toast.error("You must be signed in as a Seller to add products.");
      setIsSubmitting(false);
      return;
    }

    if (!validateForm()) {
      toast.error("Please correct the errors in the form.");
      setIsSubmitting(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // The imagePreview state now holds the Data URL (base64 string) of the image
    const imageUrlToStore = imagePreview;

    const newProduct = {
      id: `product-${Date.now()}`, // Unique ID
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: imageUrlToStore, // Store the Data URL (base64 string)
      sellerId: currentUser.id // Use ID from AuthContext's currentUser
    };

    try {
      const existingProducts = JSON.parse(localStorage.getItem("products")) || [];
      const updatedProducts = [...existingProducts, newProduct];
      localStorage.setItem("products", JSON.stringify(updatedProducts));

      invalidateCacheEntry("products"); // Invalidate product cache

      toast.success("Product added successfully!");
      setFormData(initialFormData);
      removeImagePreview(); // This will clear selectedFile, imagePreview, and reset the file input
      setErrors({});
      navigate("/seller/products");

    } catch (error) {
      console.error("Error saving product to localStorage:", error);
      toast.error("Failed to save product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle loading state from AuthContext
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        {/* Optionally show a simplified sidebar or just a loading message */}
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse">Loading form...</p>
        </main>
      </div>
    );
  }

  // Fallback if somehow user is not a seller (ProtectedRoute should handle this)
  if (!currentUser || userRole !== 'Seller') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-600">Access Denied. Only Sellers can add products.</p>
        </main>
      </div>
    );
  }


  return (
    <div className="flex min-h-screen bg-gray-50 font-sans"> {/* Added font-sans for Tailwind default */}
      {/* Pass user info from AuthContext to Sidebar */}
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} />

      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details below to list your product.</p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6 max-w-3xl mx-auto">

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text" name="name" id="name" value={formData.name}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="e.g., Summer Floral Dress"
            />
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description" id="description" value={formData.description}
              onChange={handleChange} onBlur={handleBlur} rows="4"
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
              placeholder="Detailed description of your product..."
            ></textarea>
            {errors.description && <p className="text-xs text-red-600 mt-1.5">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">Price ($)</label>
              <input
                type="number" name="price" id="price" value={formData.price}
                onChange={handleChange} onBlur={handleBlur} step="0.01"
                className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                placeholder="e.g., 29.99"
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
                      <span>Upload a file</span>
                      <input
                        id="imageUpload"
                        name="imageUpload"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/png, image/jpeg, image/gif, image/webp"
                      />
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
                    aria-label="Remove image"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              )}
            </div>
            {errors.image && <p className="text-xs text-red-600 mt-1.5">{errors.image}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isAuthLoading} // Also disable if auth is still loading
              className="w-full flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
