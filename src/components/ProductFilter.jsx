// Filters for category, price, rating, search

import React from 'react';
import { AdjustmentsHorizontalIcon, ArrowsUpDownIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';


export default function ProductFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortOption,
  setSortOption,
  minPossiblePrice, 
  maxPossiblePrice,
  ratingFilter,      // New: Current selected rating filter (e.g., 4)
  setRatingFilter    // New: Function to set the rating filter
}) {

  const handleMinPriceChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : '';
    setPriceRange(prev => ({ ...prev, min: value }));
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value ? parseInt(e.target.value, 10) : '';
    setPriceRange(prev => ({ ...prev, max: value }));
  };

  const sortOptions = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
    { value: 'rating-asc', label: 'Rating: Low to High' },
  ];

  const ratingFilterOptions = [
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
    { value: 1, label: '1 Star & Up' },
  ];

  const renderRatingStars = (stars) => {
    let starIcons = [];
    for(let i = 0; i < 5; i++) {
        if (i < stars) {
            starIcons.push(<StarSolidIcon key={i} className="h-4 w-4 text-yellow-400 inline-block" />);
        } else {
            starIcons.push(<StarIcon key={i} className="h-4 w-4 text-gray-300 inline-block" />);
        }
    }
    return starIcons;
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-8 space-y-6">
      {/* Category Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
          Filter by Category
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
              selectedCategory === 'All' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                selectedCategory === cat 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range & Rating Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        {/* Price Range Filter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter by Price</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-auto">
              <label htmlFor="minPrice" className="sr-only">Min Price</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
              <input
                type="number" id="minPrice" placeholder={`Min (${minPossiblePrice || 0})`}
                value={priceRange.min === null || priceRange.min === undefined ? '' : priceRange.min}
                onChange={handleMinPriceChange} min="0"
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <span className="text-gray-500 hidden sm:inline-block">–</span>
            <div className="relative w-full sm:w-auto">
              <label htmlFor="maxPrice" className="sr-only">Max Price</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
              <input
                type="number" id="maxPrice" placeholder={`Max (${maxPossiblePrice || 'Any'})`}
                value={priceRange.max === null || priceRange.max === undefined ? '' : priceRange.max}
                onChange={handleMaxPriceChange} min="0"
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
            <StarIcon className="h-5 w-5 mr-2 text-gray-500" />
            Filter by Rating
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setRatingFilter(0)} // 0 means all ratings
              className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 ${
                ratingFilter === 0 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All Ratings
            </button>
            {ratingFilterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setRatingFilter(option.value)}
                className={`px-4 py-2 text-sm rounded-full transition-colors duration-200 flex items-center gap-1 ${
                  ratingFilter === option.value 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {renderRatingStars(option.value)} <span className="ml-1">& Up</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Sort Options - Placed separately for better layout flow */}
      <div className="pt-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Sort By
        </h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full md:w-1/2 lg:w-1/3 px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
