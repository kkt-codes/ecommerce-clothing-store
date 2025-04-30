import { useState, useEffect } from "react";
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

const isActive = (path, current) => path === current;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const { isAuthenticated: sellerLoggedIn, sellerData, logout: sellerLogout } = useAuth();
  const { isAuthenticated: buyerLoggedIn, buyerData, logout: buyerLogout } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();

  const userLoggedIn = sellerLoggedIn || buyerLoggedIn;
  const userData = sellerLoggedIn ? sellerData : buyerData;

  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (buyerLoggedIn) {
      const orders = JSON.parse(localStorage.getItem("orders")) || [];
      const buyerOrders = orders.filter(order => order.buyerId === buyerData?.id);
      setOrderCount(buyerOrders.length);
    } else {
      setOrderCount(0);
    }
  }, [buyerLoggedIn, buyerData]);

  const handleLogout = () => {
    sellerLogout?.();
    buyerLogout?.();
    setOrderCount(0);
    navigate("/");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?category=${encodeURIComponent(searchValue.trim())}`);
      setSearchVisible(false);
      setSearchValue("");
    }
  };

  return (
    <nav className="bg-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 rounded hover:bg-gray-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          <Link to="/">
            <img src="/assets/logo.png" alt="Logo" className="h-10" />
          </Link>
        </div>

        {/* Center: Desktop Nav Links */}
        <div className="hidden md:flex gap-10 font-medium">
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
                isActive(path, location.pathname) ? "border-b-2 border-blue-600" : ""
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right: Search + Cart + Profile */}
        <div className="flex items-center gap-3">
          {/* Search Field (to the left of the icon) */}
          <div className="flex items-center">
            {searchVisible && (
              <form onSubmit={handleSearchSubmit} className="flex items-center mr-1">
                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="border px-3 py-1 rounded-l focus:outline-none"
                  placeholder="Search..."
                />
              </form>
            )}

            {/* Search Icon (always visible, right-aligned to input) */}
            <button
              onClick={() => setSearchVisible(!searchVisible)}
              className={`p-2 hover:bg-gray-100 rounded-r ${searchVisible ? "border border-l-0 border-gray-300 bg-white" : ""}`}
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>

          {/* Cart Icon */}
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 hover:bg-gray-100 rounded"
            aria-label="Cart"
          >
            <ShoppingCartIcon className="h-6 w-6 text-gray-700" />
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">
                {orderCount}
              </span>
            )}
          </button>

          {/* Person or Initials */}
          {!userLoggedIn ? (
            <button
              onClick={openModal}
              className="p-2 rounded-full hover:bg-gray-100"
              aria-label="Sign In / Sign Up"
            >
              <UserIcon className="h-6 w-6 text-gray-700" />
            </button>
          ) : (
            <div className="relative group">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full cursor-pointer">
                {userData?.firstName?.charAt(0)}
                {userData?.lastName?.charAt(0)}
              </div>
              <div className="hidden group-hover:flex flex-col absolute right-0 mt-2 w-48 bg-white shadow-lg rounded z-20 transition">
                <span className="px-4 pt-3 font-semibold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </span>
                <span className="px-4 text-sm text-gray-500 mb-2">
                  {userData.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Menu (slide-in from left) */}
      {mobileOpen && (
        <div className="md:hidden flex flex-col items-start gap-4 px-6 py-4 border-t animate-slide-in-left transition-all duration-200">
          {["/", "/products", "/about", "/contact"].map((path, i) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`hover:text-blue-600 pb-1 ${
                isActive(path, location.pathname) ? "border-b-2 border-blue-600" : ""
              }`}
            >
              {["Home", "Products", "About", "Contact"][i]}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
