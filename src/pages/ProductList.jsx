// Products grid
/* 
  Product List Page
  - Shows all products
  - Filter by category
  - Search by name
*/

// src/pages/ProductList.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useLocation }
from "react-router-dom";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";
import { useFetchCached } from "../hooks/useFetchCached";
import { InboxIcon as EmptyProductStateIcon } from "@heroicons/react/24/outline"; // Changed icon for variety

const PRODUCTS_PER_PAGE = 16; // 4 columns * 4 rows

export default function ProductList() {
  const location = useLocation();

  const {
    data: allProductsData,
    loading: productsLoading,
    error: productsError,
    forceRefetch: refetchProducts
  } = useFetchCached("products", "/data/products.json", { useLocalStoragePersistence: true });

  // Local state for products (raw from fetch)
  const [products, setProducts] = useState([]);
  
  // Filter states from your original component
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortOption, setSortOption] = useState("default");
  const [ratingFilter, setRatingFilter] = useState(0); // 0 for All, 1-4 for stars, 'NO_RATING' for unrated

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (allProductsData) {
      setProducts(allProductsData);
    }
  }, [allProductsData]);

  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    return uniqueCategories.sort();
  }, [products]);

  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    const sourceDataForPriceRange = allProductsData || [];
    if (!sourceDataForPriceRange || sourceDataForPriceRange.length === 0) {
      return { minPossiblePrice: 0, maxPossiblePrice: 1000 };
    }
    const prices = sourceDataForPriceRange.map(p => p.price).filter(p => typeof p === 'number');
    if (prices.length === 0) return { minPossiblePrice: 0, maxPossiblePrice: 1000 };
    return {
      minPossiblePrice: Math.floor(Math.min(...prices)),
      maxPossiblePrice: Math.ceil(Math.max(...prices)),
    };
  }, [allProductsData]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchFromQuery = queryParams.get('search');
    if (searchFromQuery) {
      setSearchTerm(searchFromQuery);
    }
    const categoryFromQuery = queryParams.get('category');
    if (categoryFromQuery && categories.length > 0) {
      if (categories.includes(categoryFromQuery) || categoryFromQuery === "All") {
        setSelectedCategory(categoryFromQuery);
      }
    }
    setCurrentPage(1); // Reset page on query param change
  }, [location.search, categories]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products || products.length === 0) {
      return [];
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
    
    const minPrice = priceRange.min !== '' ? parseFloat(priceRange.min) : -Infinity;
    const maxPrice = priceRange.max !== '' ? parseFloat(priceRange.max) : Infinity;

    if (!isNaN(minPrice)) {
      tempProducts = tempProducts.filter(product => product.price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
      tempProducts = tempProducts.filter(product => product.price <= maxPrice);
    }
    
    if (ratingFilter === 'NO_RATING') {
      tempProducts = tempProducts.filter(product => (product.averageRating === 0 || !product.reviews || product.reviews.length === 0 || product.numberOfReviews === 0));
    } else if (ratingFilter > 0) {
      tempProducts = tempProducts.filter(product => (product.averageRating || 0) >= ratingFilter);
    }

    // Sorting (from your original logic)
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
      default:
        // Default sort by ID to maintain a stable order if products array isn't already sorted
        tempProducts.sort((a, b) => String(a.id).localeCompare(String(b.id)));
        break;
    }
    return tempProducts;
  }, [products, selectedCategory, searchTerm, priceRange, sortOption, ratingFilter]);

  // Pagination logic
  const indexOfLastProduct = currentPage * PRODUCTS_PER_PAGE;
  const indexOfFirstProduct = indexOfLastProduct - PRODUCTS_PER_PAGE;
  const currentProducts = filteredAndSortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredAndSortedProducts.length / PRODUCTS_PER_PAGE);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Scroll to top of product list container or window
      const productListTop = document.getElementById('product-list-section');
      if (productListTop) {
         // Calculate offset if there's a sticky header
        const headerOffset = document.querySelector('header')?.offsetHeight || 0; // Adjust selector for your header
        const elementPosition = productListTop.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset - 20; // 20px for some margin
        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
      } else {
        window.scrollTo(0,0); // Fallback
      }
    }
  };
  
  // Reset all filters (passed to ProductFilter)
  const handleResetAllFilters = () => {
    setSelectedCategory("All");
    setSearchTerm("");
    setPriceRange({ min: '', max: '' });
    setSortOption("default");
    setRatingFilter(0);
    setCurrentPage(1);
  };
  
  // Effect to reset page to 1 if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm, priceRange, sortOption, ratingFilter]);


  if (productsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-10rem)] bg-gray-50">
        <p className="text-gray-600 text-xl animate-pulse">Loading products...</p>
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
  
  // Estimate header height for sticky filter positioning
  const headerHeight = "4rem"; // Adjust this to your actual Navbar height

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title from your original file */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800">Our Products</h1>
          <p className="mt-3 text-lg text-gray-600">Browse our extensive collection of high-quality clothing.</p>
        </div>

        {/* Search Bar - Centered and smaller */}
        <div className="mb-8 max-w-lg mx-auto">
          <input
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          />
        </div>
        
        {/* This ID is for scrolling to the top of this section on pagination */}
        <div id="product-list-section" className="flex flex-col md:flex-row md:gap-8 relative">
          {/* Filters - Left Side (Sticky on md+ screens) */}
          <aside 
            className="w-full md:w-1/3 lg:w-1/4 xl:w-1/5 md:sticky self-start mb-8 md:mb-0"
            style={{ top: `calc(${headerHeight} + 1rem)` }} // Adjust 1rem for desired spacing below header
          >
            <ProductFilter
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              sortOption={sortOption}
              setSortOption={setSortOption}
              minPossiblePrice={minPossiblePrice}
              maxPossiblePrice={maxPossiblePrice}
              ratingFilter={ratingFilter}
              setRatingFilter={setRatingFilter}
              onResetFilters={handleResetAllFilters}
            />
          </aside>

          {/* Products - Right Side */}
          <main 
            id="product-grid-container" // Keep ID if used for other purposes, but not for scrolling container
            className="w-full md:w-2/3 lg:w-3/4 xl:w-4/5"
            >
            {currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-10 mb-4 py-4 border-t border-gray-200" aria-label="Pagination">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstProduct + 1}</span>
                      {' '}to <span className="font-medium">{Math.min(indexOfLastProduct, filteredAndSortedProducts.length)}</span>
                      {' '}of <span className="font-medium">{filteredAndSortedProducts.length}</span> results
                    </p>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => paginate(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Prev
                      </button>
                      {/* Page numbers */}
                      {[...Array(totalPages).keys()].map(num => {
                          const pageNum = num + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          ) {
                            return (
                              <button
                                key={pageNum}
                                onClick={() => paginate(pageNum)}
                                className={`px-3 py-1.5 text-sm font-medium border rounded-md ${
                                  currentPage === pageNum
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          } if (
                            (pageNum === currentPage - 2 && currentPage > 3) ||
                            (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                          ) {
                            return <span key={pageNum} className="px-3 py-1.5 text-sm">...</span>;
                          }
                          return null;
                        })}
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => paginate(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                      >
                        Last
                      </button>
                    </div>
                  </nav>
                )}
              </>
            ) : (
              <div className="col-span-full text-center text-gray-500 py-16 bg-white rounded-lg shadow-md">
                <EmptyProductStateIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">No Products Match Your Filters</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

