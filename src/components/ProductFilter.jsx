// Filters for category, price, search

/* Filter Component */
export default function ProductFilter({ categories, selectedCategory, setSelectedCategory }) {
    return (
      <div className="flex gap-4 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-full ${selectedCategory === 'All' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            {cat}
          </button>
        ))}
      </div>
    );
  }
  