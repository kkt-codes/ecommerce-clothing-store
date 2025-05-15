// Filters for category, price, search
import React from 'react';
import { AdjustmentsHorizontalIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

export default function ProductFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  sortOption,
  setSortOption,
  minPossiblePrice, // Smallest price among all products
  maxPossiblePrice  // Largest price among all products
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
    // { value: 'newest', label: 'Newest Arrivals' }, // Add if you have date data
  ];

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg mb-8">
      {/* Category Filters */}
      <div className="mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
        {/* Price Range Filter */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter by Price</h3>
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-auto">
              <label htmlFor="minPrice" className="sr-only">Min Price</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
              <input
                type="number"
                id="minPrice"
                placeholder={`Min (${minPossiblePrice || 0})`}
                value={priceRange.min === null || priceRange.min === undefined ? '' : priceRange.min}
                onChange={handleMinPriceChange}
                min="0"
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <span className="text-gray-500 hidden sm:inline-block">–</span>
            <div className="relative w-full sm:w-auto">
              <label htmlFor="maxPrice" className="sr-only">Max Price</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
              <input
                type="number"
                id="maxPrice"
                placeholder={`Max (${maxPossiblePrice || 'Any'})`}
                value={priceRange.max === null || priceRange.max === undefined ? '' : priceRange.max}
                onChange={handleMaxPriceChange}
                min="0"
                className="w-full pl-7 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center md:justify-start">
            <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-gray-500" />
            Sort By
          </h3>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
