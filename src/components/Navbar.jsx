// Navbar with logo and menu
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ShoppingCartIcon, UserCircleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 shadow-md">
      <Link to="/" className="text-2xl font-bold">ClothingStore</Link>
      <div className="flex items-center gap-4">
        <Link to="/products">Products</Link>
        <Link to="/cart">
          <ShoppingCartIcon className="h-6 w-6" />
        </Link>
        {isAuthenticated ? (
          <button onClick={logout} className="text-red-500">Logout</button>
        ) : (
          <Link to="/seller/login">
            <UserCircleIcon className="h-6 w-6" />
          </Link>
        )}
      </div>
    </nav>
  );
}