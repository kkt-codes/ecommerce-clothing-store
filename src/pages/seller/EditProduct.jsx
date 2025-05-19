import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import { useAuthContext } from "../../context/AuthContext"; // Import useAuthContext
import toast from 'react-hot-toast';
import { ArrowUpTrayIcon, XCircleIcon, ChartBarIcon, ArchiveBoxIcon, PlusCircleIcon, ChatBubbleLeftEllipsisIcon } from "@heroicons/react/24/outline";
import initialProductsData from "../../data/products.json"; // Fallback if not in localStorage
import { invalidateCacheEntry } from "../../hooks/useFetchCached"; // For cache invalidation

export default function EditProduct() {
  const { id: productId } = useParams(); 
  const { currentUser, isLoading: isAuthLoading, userRole } = useAuthContext(); // Use AuthContext
  const navigate = useNavigate();

  const initialFormState = {
    name: "",
    description: "",
    price: "",
    category: "Dress",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [selectedFile, setSelectedFile] = useState(null);    
  const [imagePreview, setImagePreview] = useState("");      
  const [existingImageUrl, setExistingImageUrl] = useState(""); 
  const [errors, setErrors] = useState({});                  
  const [isSubmitting, setIsSubmitting] = useState(false);   
  const [isLoadingProduct, setIsLoadingProduct] = useState(true); 

  // Seller Sidebar Links - Ensure icons are imported and assigned
  const sellerLinks = [
    { label: "Dashboard", path: "/seller/dashboard", icon: ChartBarIcon },
    { label: "My Products", path: "/seller/products", icon: ArchiveBoxIcon },
    { label: "Add Product", path: "/seller/add-product", icon: PlusCircleIcon },
    { label: "Messages", path: "/seller/messages", icon: ChatBubbleLeftEllipsisIcon }
  ];

  useEffect(() => {
    // Wait for auth state to be loaded and ensure currentUser is available
    if (isAuthLoading) {
        setIsLoadingProduct(true); // Keep product loading until auth is resolved
        return;
    }
    if (!currentUser || userRole !== 'Seller') {
        toast.error("You must be signed in as a Seller to edit products.");
        navigate("/seller/dashboard"); // Or home, or let ProtectedRoute handle
        setIsLoadingProduct(false);
        return;
    }

    setIsLoadingProduct(true);
    let productToEdit = null;
    // Prioritize localStorage for products, as it might contain updates
    let currentProducts = [];
    try {
        const localProductsString = localStorage.getItem("products");
        currentProducts = localProductsString ? JSON.parse(localProductsString) : initialProductsData;
    } catch (e) {
        console.error("Error parsing products from localStorage for edit page:", e);
        currentProducts = initialProductsData; // Fallback to static data on error
    }
    
    productToEdit = currentProducts.find(p => String(p.id) === String(productId) && String(p.sellerId) === String(currentUser.id));

    if (productToEdit) {
      setFormData({ 
        name: productToEdit.name,
        description: productToEdit.description,
        price: String(productToEdit.price), 
        category: productToEdit.category,
      });
      setImagePreview(productToEdit.image); 
      setExistingImageUrl(productToEdit.image); 
    } else {
      toast.error("Product not found or you do not have permission to edit it.");
      navigate("/seller/products"); 
    }
    setIsLoadingProduct(false); 
  }, [productId, currentUser, userRole, isAuthLoading, navigate]); 

  useEffect(() => {
    const currentPreview = imagePreview; 
    return () => {
      if (currentPreview && currentPreview.startsWith("blob:") && currentPreview !== existingImageUrl) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [imagePreview, existingImageUrl]); 

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
      if (file.size > 5 * 1024 * 1024) { 
        setErrors(prev => ({ ...prev, image: "File is too large (max 5MB)." }));
        setSelectedFile(null);
        setImagePreview(existingImageUrl || ""); 
        e.target.value = null; 
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
        setErrors(prev => ({ ...prev, image: "Invalid file type (JPEG, PNG, GIF, WEBP)." }));
        setSelectedFile(null);
        setImagePreview(existingImageUrl || ""); 
        e.target.value = null; 
        return;
      }
      
      if (imagePreview && imagePreview.startsWith("blob:") && imagePreview !== existingImageUrl) {
        URL.revokeObjectURL(imagePreview);
      }
      
      setSelectedFile(file); 
      const previewUrl = URL.createObjectURL(file); 
      setImagePreview(previewUrl);
      setErrors(prev => ({ ...prev, image: null })); 
    }
  };

  const removeImagePreview = () => {
    if (imagePreview && imagePreview.startsWith("blob:") && imagePreview !== existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setSelectedFile(null); 
    setImagePreview(existingImageUrl || "");   
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = null; 
    setErrors(prev => ({ ...prev, image: null })); 
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(initialFormState).forEach(key => { 
        if (key !== 'image') { 
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        }
    });
    if (!imagePreview && !selectedFile && !existingImageUrl) { 
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

    await new Promise(resolve => setTimeout(resolve, 1000)); 

    let finalImageUrl = existingImageUrl; 
    if (selectedFile) {
      const mockImageFileName = `${formData.category.toLowerCase().replace(/\s+/g, '-')}-${formData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()%1000}.jpg`;
      finalImageUrl = `/assets/products/${mockImageFileName}`; 
    } else if (!imagePreview && existingImageUrl) {
      // If user removed the preview of an existing image, and didn't select a new one
      // This means they want to remove the image. Set to placeholder.
      // If image is mandatory, validateForm should catch if !imagePreview && !selectedFile
      finalImageUrl = "/assets/placeholder.png"; 
    }


    const updatedProductData = {
      id: productId, 
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: finalImageUrl, 
      sellerId: currentUser.id // Use ID from AuthContext's currentUser
    };

    let currentProducts = [];
    try {
        const localProductsString = localStorage.getItem("products");
        currentProducts = localProductsString ? JSON.parse(localProductsString) : initialProductsData;
    } catch (err) {
        console.error("Error reading products from localStorage before update:", err);
        currentProducts = initialProductsData; // Fallback
    }

    const updatedProducts = currentProducts.map(p => 
      String(p.id) === String(productId) ? updatedProductData : p
    );
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    invalidateCacheEntry("allProducts"); // Invalidate cache

    toast.success("Product updated successfully!");
    setIsSubmitting(false);
    navigate("/seller/products"); 
  };

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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar links={sellerLinks} userRole="Seller" userName={currentUser?.firstName} /> 
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Product</h1>
          <p className="text-sm text-gray-500 mt-1">Update the details for: <span className="font-medium text-gray-700">{initialFormState.name || formData.name || "Product"}</span></p>
        </header>

        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-xl space-y-6 max-w-3xl mx-auto">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text" name="name" id="name" value={formData.name}
              onChange={handleChange} onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description" id="description" value={formData.description}
              onChange={handleChange} onBlur={handleBlur} rows="4"
              className={`w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${errors.description ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
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
            {existingImageUrl && imagePreview === existingImageUrl && !selectedFile && (
                <p className="text-xs text-gray-500 mt-1 text-center">Currently using existing image. Upload a new file to change it.</p>
            )}
          </div>

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
