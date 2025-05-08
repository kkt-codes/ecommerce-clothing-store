import { Link } from "react-router-dom";
import { ShoppingCartIcon } from "@heroicons/react/24/solid"; // Or outline
import { useCart } from "../context/CartContext"; // Import useCart

export default function ProductCard({ product }) {
  const { addToCart } = useCart(); // Get addToCart function

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent link navigation if button is inside Link
    e.stopPropagation(); // Prevent event bubbling to the Link
    addToCart(product, 1); // Add 1 quantity of this product
    // alert(`${product.name} added to cart!`); // Simple feedback, we'll improve with toasts later
    console.log(`${product.name} added to cart!`);
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition flex flex-col">
      <Link to={`/products/${product.id}`} className="block group">
        <img
          src={product.image || '/assets/placeholder.png'} // Added placeholder
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold truncate" title={product.name}>{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category}</p>
          <p className="text-blue-600 font-bold mt-2">${product.price.toFixed(2)}</p>
        </div>
      </Link>
      <div className="mt-auto p-4 pt-0"> {/* Ensure button is at the bottom */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          <ShoppingCartIcon className="h-5 w-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
}