// Single product card

import { Link } from "react-router-dom";

/* Product Card */
export default function ProductCard({ product }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <Link to={`/products/${product.id}`}>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
        <div className="p-4">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-gray-600">{product.category}</p>
          <p className="text-blue-600 font-bold mt-2">${product.price}</p>
        </div>
      </Link>
    </div>
  );
}
