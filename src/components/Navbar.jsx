import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  ShoppingCartIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "../hooks/useAuth";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import { useCart } from "../context/CartContext"; // Import useCart

const isActive = (path, current) => path === current;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { isAuthenticated: sellerLoggedIn, sellerData, logout: sellerLogout } = useAuth();
  const { isAuthenticated: buyerLoggedIn, buyerData, logout: buyerLogout } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();
  const { getItemCount } = useCart(); // Get getItemCount from CartContext

  const userLoggedIn = sellerLoggedIn || buyerLoggedIn;
  const userData = sellerLoggedIn ? sellerData : buyerData;

  // Removed old orderCount state, using getItemCount() from CartContext instead
  const cartItemCount = getItemCount();

  const handleLogout = () => {
    if (sellerLoggedIn) sellerLogout();
    if (buyerLoggedIn) buyerLogout();
    // No need to setOrderCount(0) anymore
    setDropdownOpen(false);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      // Consider if this search should also look at product names, not just categories.
      // For now, it searches categories based on your previous implementation.
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchVisible(false);
      setSearchValue("");
    }
  };
  
  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.profile-dropdown-container')) {
        setDropdownOpen(false);
      }
      if (searchVisible && !event.target.closest('.search-container')) {
        setSearchVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen, searchVisible]);


  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50"> {/* Changed to sticky */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          <Link to="/" className="flex-shrink-0">
            <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" /> {/* Added w-auto */}
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8 font-medium text-gray-700">
          {[
            { label: "Home", path: "/" },
            { label: "Products", path: "/products" },
            { label: "About", path: "/about" },
            { label: "Contact", path: "/contact" },
          ].map(({ label, path }) => (
            <Link
              key={path}
              to={path}
              className={`hover:text-blue-600 pb-1 ${
                isActive(path, location.pathname) ? "border-b-2 border-blue-600 text-blue-600" : "border-b-2 border-transparent"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 relative"> {/* Search container class added for click outside */}
          <div className="search-container"> {/* Search container */}
            {searchVisible && (
              <form onSubmit={handleSearchSubmit} className="absolute right-full mr-2 md:static md:mr-0 md:flex items-center animate-fade-in-fast">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="border rounded-l-md px-3 py-1.5 focus:outline-none focus:border-blue-500 text-sm w-40 sm:w-auto"
                  placeholder="Search products..."
                />
                <button type="submit" className="bg-gray-200 hover:bg-gray-300 px-3 py-1.5 rounded-r-md border-l-0 border border-gray-300">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-600" />
                </button>
              </form>
            )}
            <button
              onClick={() => setSearchVisible(!searchVisible)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
          </div>

          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 hover:bg-gray-100 rounded-full text-gray-700"
            aria-label="Shopping Cart"
          >
            <ShoppingCartIcon className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>

          <div className="profile-dropdown-container"> {/* Added container for click outside */}
            {!userLoggedIn ? (
              <button
                onClick={() => { openModal(); switchToTab('signin');}} // Default to signin
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Sign In / Sign Up"
              >
                <UserIcon className="h-6 w-6 text-gray-700" />
              </button>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {userData?.firstName?.charAt(0).toUpperCase()}
                  {userData?.lastName?.charAt(0).toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md border border-gray-200 z-50 text-sm animate-fade-in-fast origin-top-right">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="font-semibold text-gray-800 truncate">{userData.firstName} {userData.lastName}</p>
                      <p className="text-gray-500 truncate">{userData.email}</p>
                    </div>
                    {/* Dynamic Dashboard Link */}
                    {(buyerLoggedIn && 
                        <Link to="/buyer/dashboard" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600">My Dashboard</Link>)}
                    {(sellerLoggedIn && 
                        <Link to="/seller/dashboard" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600">Seller Dashboard</Link>)}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 animate-slide-in-left z-40">
          <div className="flex flex-col items-start gap-1 px-4 py-3">
            {[
                { label: "Home", path: "/" },
                { label: "Products", path: "/products" },
                { label: "About", path: "/about" },
                { label: "Contact", path: "/contact" },
            ].map(({ label, path }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)} // Close menu on click
                className={`block w-full py-2 px-3 rounded-md hover:bg-gray-100 hover:text-blue-600 font-medium ${
                  isActive(path, location.pathname) ? "text-blue-600 bg-blue-50" : "text-gray-700"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}