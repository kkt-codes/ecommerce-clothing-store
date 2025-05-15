// Products grid
/* 
  Product List Page
  - Shows all products
  - Filter by category
  - Search by name
*/

import React, { useEffect, useState, useMemo } from "react";
import { useLocation } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
// Removed direct import of allProductsData
// import allProductsData from "../data/products.json"; 
import { useFetchCached } from "../hooks/useFetchCached"; // Import the custom hook

export default function ProductList() {
  const location = useLocation();

  // Use the useFetchCached hook to get products
  const { 
    data: allProductsData, // Renamed from 'data' to 'allProductsData' for clarity
    loading: productsLoading, 
    error: productsError,
    forceRefetch: refetchProducts // If you need a manual refetch button later
  } = useFetchCached("allProducts", "/data/products.json"); // Cache key and URL

  const [products, setProducts] = useState([]);             // All products from data source (will be set by the hook)
  const [filteredProducts, setFilteredProducts] = useState([]); // Products to display after filtering/sorting
  
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState("default");

  // Update local 'products' state when data from the hook changes
  useEffect(() => {
    if (allProductsData) {
      setProducts(allProductsData);
    }
  }, [allProductsData]);


  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    // Ensure "All" is always first, even if no products yet, then add unique categories
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    return ["All", ...uniqueCategories];
  }, [products]);

  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    if (!products || products.length === 0) { // Use 'products' state which is derived from cached data
      return { minPossiblePrice: 0, maxPossiblePrice: 1000 }; 
    }
    const prices = products.map(p => p.price);
    return {
      minPossiblePrice: Math.min(...prices),
      maxPossiblePrice: Math.max(...prices),
    };
  }, [products]); // Depends on the 'products' state now

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchFromQuery = queryParams.get('search');
    if (searchFromQuery) {
      setSearchTerm(searchFromQuery);
    } else {
      // Optional: Clear search term if not in query, or maintain current state
      // setSearchTerm(""); 
    }
    const categoryFromQuery = queryParams.get('category');
    if (categoryFromQuery && categories.includes(categoryFromQuery)) {
        setSelectedCategory(categoryFromQuery);
    } else if (categoryFromQuery === null && !searchFromQuery) { // Only reset if no other filters from URL
        // Optional: Reset category if no category query param
        // setSelectedCategory("All");
    }
  }, [location.search, categories]);

  useEffect(() => {
    if (!products || products.length === 0) {
        setFilteredProducts([]); // Ensure filteredProducts is empty if no base products
        return;
    }

    let tempProducts = [...products];

    if (selectedCategory !== "All") {
      tempProducts = tempProducts.filter(
        (product) => product.category === selectedCategory
      );
    }

    if (searchTerm.trim() !== "") {
      tempProducts = tempProducts.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const minPrice = parseFloat(priceRange.min);
    const maxPrice = parseFloat(priceRange.max);

    if (!isNaN(minPrice) && priceRange.min !== '') {
        tempProducts = tempProducts.filter(product => product.price >= minPrice);
    }
    if (!isNaN(maxPrice) && priceRange.max !== '') {
        tempProducts = tempProducts.filter(product => product.price <= maxPrice);
    }

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
      default:
        break;
    }

    setFilteredProducts(tempProducts);
  }, [products, selectedCategory, searchTerm, priceRange, sortOption]);

  // UI for loading and error states from the hook
  if (productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] bg-gray-50">
        <p className="text-gray-600 text-xl animate-pulse">Loading products...</p>
        {/* A a spinner component can be added here */}
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
          onClick={refetchProducts}
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
        <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Our Products</h1>
            <p className="mt-3 text-lg text-gray-600">Browse our extensive collection of high-quality clothing.</p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          />
        </div>

        <ProductFilter
          categories={categories.filter(cat => cat !== "All")}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortOption={sortOption}
          setSortOption={setSortOption}
          minPossiblePrice={minPossiblePrice}
          maxPossiblePrice={maxPossiblePrice}
        />

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8 mt-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="col-span-full text-center text-gray-500 py-10 mt-8 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">No Products Found</h3>
            <p>Try adjusting your filters or search term, or check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
}

