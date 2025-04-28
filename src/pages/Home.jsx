import React from "react";
import { Link } from "react-router-dom";

/* 
  Home Page
  - Hero Section
  - Featured Categories
*/

export default function Home() {
  // Categories for browsing
  const categories = [
    { name: "Dress", image: "/assets/categories/dress.jpg" },
    { name: "Jacket", image: "/assets/categories/jacket.jpg" },
    { name: "Kids", image: "/assets/categories/kids.jpg" },
    { name: "Shirt", image: "/assets/categories/shirt.jpg" },
    { name: "T-shirt", image: "/assets/categories/tshirt.jpg" },
    { name: "Trouser", image: "/assets/categories/trouser.jpg" },
  ];

  return (
    <div>

      {/* ===== Hero Section ===== */}
      <section className="relative w-full h-[450px] bg-center bg-cover flex items-center justify-center text-white" style={{ backgroundImage: "url('/assets/hero-banner.jpg')" }}>
        <div className="bg-black/50 absolute inset-0"></div> {/* Dark overlay */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Discover Your Style</h1>
          <p className="text-lg mb-6">Shop the latest trends in fashion</p>
          <Link to="/products" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition rounded text-white font-semibold">
            Shop Now
          </Link>
        </div>
      </section>

      {/* ===== Featured Categories ===== */}
      <section className="py-16 px-6 md:px-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Featured Categories</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link key={category.name} to={`/products?category=${category.name}`} className="relative group overflow-hidden rounded-lg shadow hover:shadow-lg transition">
              <img src={category.image} alt={category.name} className="w-full h-48 object-cover transform group-hover:scale-110 transition duration-300" />
              <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-50 transition flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}

