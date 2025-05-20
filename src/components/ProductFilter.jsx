// Filters for category, price, rating, search

// src/components/ProductFilter.jsx
import React from 'react';
import { AdjustmentsHorizontalIcon, ArrowsUpDownIcon, StarIcon as OutlineStarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as SolidStarIcon } from '@heroicons/react/24/solid';

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
  ratingFilter,
  setRatingFilter,
  onResetFilters, // Added for a master reset
}) {

  const handleMinPriceChange = (e) => {
    const value = e.target.value;
    // Allow empty string or valid number
    setPriceRange(prev => ({ ...prev, min: value === '' ? '' : parseInt(value, 10) }));
  };

  const handleMaxPriceChange = (e) => {
    const value = e.target.value;
    setPriceRange(prev => ({ ...prev, max: value === '' ? '' : parseInt(value, 10) }));
  };

  const sortOptions = [
    { value: 'default', label: 'Default Sorting' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'name-asc', label: 'Name: A to Z' },
    { value: 'name-desc', label: 'Name: Z to A' },
    { value: 'rating-desc', label: 'Rating: High to Low' },
  ];

  // Rating options: 0 for all, 'NO_RATING' for unrated, 1-4 for stars and up
  const ratingButtons = [
    { value: 0, label: 'All Ratings' },
    { value: 'NO_RATING', label: 'No Rating Yet' },
    { value: 4, label: '4 Stars & Up' },
    { value: 3, label: '3 Stars & Up' },
    { value: 2, label: '2 Stars & Up' },
    { value: 1, label: '1 Star & Up' },
  ];

  const renderRatingStars = (starsToFill) => {
    let starIcons = [];
    for (let i = 0; i < 5; i++) {
      if (i < starsToFill) {
        starIcons.push(<SolidStarIcon key={`solid-${i}`} className="h-4 w-4 text-yellow-400 inline-block" />);
      } else {
        starIcons.push(<OutlineStarIcon key={`outline-${i}`} className="h-4 w-4 text-gray-300 inline-block" />);
      }
    }
    return starIcons;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
        <button
          onClick={onResetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
          title="Reset all filters"
        >
          <XCircleIcon className="h-5 w-5 mr-1" /> Reset All
        </button>
      </div>
      {/* Category Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-gray-500" />
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 ${
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
              className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 ${
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

      {/* Price Range Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Price Range</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative w-full sm:w-auto flex-1">
            <label htmlFor="minPrice" className="sr-only">Min Price</label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">$</div>
            <input
              type="number" id="minPrice" placeholder={`Min (${minPossiblePrice || 0})`}
              value={priceRange.min} // Controlled component
              onChange={handleMinPriceChange} min="0"
              className="w-full pl-6 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <span className="text-gray-500 hidden sm:inline-block">–</span>
          <div className="relative w-full sm:w-auto flex-1">
            <label htmlFor="maxPrice" className="sr-only">Max Price</label>
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-500">$</div>
            <input
              type="number" id="maxPrice" placeholder={`Max (${maxPossiblePrice || 'Any'})`}
              value={priceRange.max} // Controlled component
              onChange={handleMaxPriceChange} min="0"
              className="w-full pl-5 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <OutlineStarIcon className="h-5 w-5 mr-2 text-gray-500" />
          Rating
        </h3>
        <div className="flex flex-wrap gap-2">
          {ratingButtons.map(option => (
            <button
              key={option.value}
              onClick={() => setRatingFilter(option.value)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors duration-200 flex items-center gap-1 ${
                ratingFilter === option.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {typeof option.value === 'number' && option.value > 0 && renderRatingStars(option.value)}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div className="pt-2"> {/* Adjusted padding */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
          <ArrowsUpDownIcon className="h-5 w-5 mr-2 text-gray-500" />
          Sort By
        </h3>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm"
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
