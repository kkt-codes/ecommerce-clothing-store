// Products grid
/* 
  Product List Page
  - Shows all products
  - Filter by category
  - Search by name
*/

// src/pages/ProductList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom"; // To read query params like ?search=
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import { useFetchCached } from "../hooks/useFetchCached"; // Custom hook to fetch and cache data
import { StarIcon as EmptyProductStateIcon } from "@heroicons/react/24/outline"; // For empty state icon

export default function ProductList() {
  const location = useLocation(); // For reading search query from URL

  // Use the useFetchCached hook to get products
  const { 
    data: allProductsData, // Renamed from 'data' to 'allProductsData' for clarity
    loading: productsLoading, 
    error: productsError,
    forceRefetch: refetchProducts // If you need a manual refetch button later
  } = useFetchCached("allProducts", "/data/products.json"); // Cache key and URL

  const [products, setProducts] = useState([]);             // All products from data source (will be set by the hook)
  const [filteredProducts, setFilteredProducts] = useState([]); // Products to display after filtering/sorting
  
  // State for filters
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: '', max: '' }); // Initialize with empty strings
  const [sortOption, setSortOption] = useState("default"); // e.g., 'default', 'price-asc', 'price-desc'
  const [ratingFilter, setRatingFilter] = useState(0); // New: 0 means all ratings

  // Update local 'products' state when data from the hook changes
  useEffect(() => {
    if (allProductsData) {
      setProducts(allProductsData);
    }
  }, [allProductsData]);


  // Memoize categories to prevent re-computation on every render
  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Get unique categories from the products array
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    return uniqueCategories.sort(); // Sort categories alphabetically
  }, [products]); // Depends on the 'products' state

  // Memoize min/max possible prices from the full dataset for filter placeholders
  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    // Use allProductsData here if you want the true min/max of the entire dataset
    // If you use 'products' state, it might change if 'products' is pre-filtered elsewhere (not in this component)
    const sourceDataForPriceRange = allProductsData || []; 
    if (!sourceDataForPriceRange || sourceDataForPriceRange.length === 0) {
      return { minPossiblePrice: 0, maxPossiblePrice: 1000 }; // Default if no products
    }
    const prices = sourceDataForPriceRange.map(p => p.price);
    return {
      minPossiblePrice: Math.floor(Math.min(...prices)),
      maxPossiblePrice: Math.ceil(Math.max(...prices)),
    };
  }, [allProductsData]); // Depends on the initial full dataset from cache/fetch

  // Effect to handle search term and category from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchFromQuery = queryParams.get('search');
    if (searchFromQuery) {
      setSearchTerm(searchFromQuery);
    }
    // Only set category from query if categories are loaded to avoid issues
    const categoryFromQuery = queryParams.get('category');
    if (categoryFromQuery && categories.length > 0) { // Check if categories array is populated
        if (categories.includes(categoryFromQuery) || categoryFromQuery === "All") {
            setSelectedCategory(categoryFromQuery);
        }
    }
  }, [location.search, categories]); // Rerun if location.search or categories array changes

  // Main effect for filtering and sorting products
  useEffect(() => {
    if (!products || products.length === 0) {
        setFilteredProducts([]); // Ensure filteredProducts is empty if no base products
        return;
    }

    let tempProducts = [...products]; // Start with all products

    // 1. Filter by Category
    if (selectedCategory !== "All") {
      tempProducts = tempProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    // 2. Filter by Search Term (product name)
    if (searchTerm.trim() !== "") {
      tempProducts = tempProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 3. Filter by Price Range
    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    if (!isNaN(minPrice) && String(priceRange.min).trim() !== '') { // Check if not empty string
        tempProducts = tempProducts.filter(product => product.price >= minPrice);
    }
    if (!isNaN(maxPrice) && String(priceRange.max).trim() !== '') { // Check if not empty string
        tempProducts = tempProducts.filter(product => product.price <= maxPrice);
    }

    // 4. Filter by Rating
    if (ratingFilter > 0) {
      tempProducts = tempProducts.filter(product => (product.averageRating || 0) >= ratingFilter);
    }

    // 5. Sort Products
    switch (sortOption) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'rating-desc':
        tempProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'rating-asc':
        tempProducts.sort((a, b) => (a.averageRating || 0) - (b.averageRating || 0));
        break;
      default: // 'default' or any other case
        // Optionally, sort by ID to maintain a stable "default" order if products array isn't already sorted
        tempProducts.sort((a, b) => String(a.id).localeCompare(String(b.id))); 
        break;
    }

    setFilteredProducts(tempProducts);
  }, [products, selectedCategory, searchTerm, priceRange, sortOption, ratingFilter]);


  // UI for loading and error states from the useFetchCached hook
  if (productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] bg-gray-50">
        <p className="text-gray-600 text-xl animate-pulse">Loading products...</p>
        {/* You can add a spinner component here */}
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-10rem)] bg-gray-50 text-center px-4">
        <h2 className="text-2xl font-semibold text-red-600 mb-3">Oops! Something went wrong.</h2>
        <p className="text-gray-700 mb-2">We couldn't load the products at this time.</p>
        <p className="text-sm text-gray-500 mb-6">Error: {productsError.message}</p>
        <button 
          onClick={refetchProducts} // Allows user to try fetching again
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Our Products</h1>
            <p className="mt-3 text-lg text-gray-600">Browse our extensive collection of high-quality clothing.</p>
        </div>

        {/* Search Bar - Centralized */}
        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          />
        </div>

        {/* Filters & Sorting Component */}
        <ProductFilter
          categories={categories} // Pass unique categories (ProductFilter handles "All" button)
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortOption={sortOption}
          setSortOption={setSortOption}
          minPossiblePrice={minPossiblePrice}
          maxPossiblePrice={maxPossiblePrice}
          ratingFilter={ratingFilter}     // Pass rating filter state
          setRatingFilter={setRatingFilter} // Pass setter for rating filter
        />

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 mt-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          // Displayed when filters result in no products
          <div className="col-span-full text-center text-gray-500 py-10 mt-8 bg-white rounded-lg shadow-md">
            <EmptyProductStateIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" /> {/* Using a different icon */}
            <h3 className="text-xl font-semibold mb-2">No Products Match Your Filters</h3>
            <p>Try adjusting your search, category, price, or rating filters, or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}
