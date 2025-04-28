// Hero, Featured Categories

import React from "react";

/* Home page: Hero + Featured Categories */
export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <section className="w-full h-96 bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: 'url(/assets/hero.jpg)' }}>
        <h1 className="text-4xl font-bold">Welcome to ClothingStore</h1>
      </section>
      
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">Featured Categories</h2>
        {/* Categories will be listed here */}
      </section>
    </div>
  );
}
