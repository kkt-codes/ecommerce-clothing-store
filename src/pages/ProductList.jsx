// Products grid

import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import ProductFilter from "../components/ProductFilter";

/* 
  Product List Page
  - Shows all products
  - Filter by category
  - Search by name
*/

export default function ProductList() {
  const [products, setProducts] = useState([]);             // All products
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered to display
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Categories (fixed as per project)
  const categories = ["Dress", "Jacket", "Kids", "Shirt", "T-shirt", "Trouser"];

  // Fetch mock products
  useEffect(() => {
    fetch("src/data/products.json")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((err) => console.error("Error loading products:", err));
  }, []);

  // Handle category filtering
  useEffect(() => {
    let filtered = [...products];

    if (selectedCategory !== "All") {
      filtered = filtered.filter((product) => product.category === selectedCategory);
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, searchTerm, products]);

  return (
    <div className="p-6 md:px-20">

      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-8 text-center">Our Products</h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md border p-2 rounded focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Category Filters */}
      <ProductFilter
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600">No products found.</div>
        )}
      </div>

    </div>
  );
}

