// Navbar with logo and menu

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useSignupLoginModal } from "../hooks/useSignupLoginModal";
import logo from "../assets/logo.png"; // Your logo image

/* Navbar Component */
export default function Navbar() {
  const { isAuthenticated: isSeller, sellerData, logout: sellerLogout } = useAuth();
  const { isAuthenticated: isBuyer, buyerData, logout: buyerLogout } = useBuyerAuth();
  const { openModal } = useSignupLoginModal();

  // Handle logout depending on role
  const handleLogout = () => {
    if (isSeller) sellerLogout();
    if (isBuyer) buyerLogout();
  };

  // Render initials (First letter of First Name and Last Name)
  const getUserInitials = (user) => {
    if (!user) return "";
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const loggedInUser = isBuyer ? buyerData : (isSeller ? sellerData : null);

  return (
    <nav className="flex justify-between items-center p-4 shadow-md bg-white">
      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="ClothingStore Logo" className="h-10" />
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4">
        <Link to="/products" className="font-medium">Products</Link>
        <Link to="/cart" className="font-medium">Cart</Link>

        {/* If logged in, show user initials and profile menu */}
        {loggedInUser ? (
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold cursor-pointer">
              {getUserInitials(loggedInUser)}
            </div>
            {/* Dropdown */}
            <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md py-2 z-20">
              <p className="text-center font-semibold text-sm">{loggedInUser.firstName} {loggedInUser.lastName}</p>
              <p className="text-center text-xs mb-2">{loggedInUser.email}</p>
              <hr className="my-2" />
              <button onClick={handleLogout} className="w-full text-center text-red-500 hover:bg-gray-100 p-2 text-sm">Logout</button>
            </div>
          </div>
        ) : (
          // If not logged in, show SignUp/Login
          <button onClick={openModal} className="font-semibold text-blue-600">
            Sign Up / Log In
          </button>
        )}
      </div>
    </nav>
  );
}
