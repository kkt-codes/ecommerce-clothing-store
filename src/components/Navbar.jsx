import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bars3Icon, XMarkIcon, UserIcon, ShoppingCartIcon, MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

// Import the new AuthContext hook
import { useAuthContext } from "../context/AuthContext"; 
// Keep useSignupSigninModal for opening the modal
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import { useCart } from "../context/CartContext";

const isActive = (path, current) => path === current;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Destructure values from the new AuthContext
  const { currentUser, isAuthenticated, userRole, signout, isLoading: authIsLoading } = useAuthContext(); 
  const { openModal, switchToTab } = useSignupSigninModal();
  const { getItemCount } = useCart();

  const cartItemCount = getItemCount();

  const handleSignout = () => {
    signout(); // Call signout from AuthContext
    setDropdownOpen(false);
    // navigate('/'); // signout in AuthContext already navigates
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchVisible(false);
      setSearchValue("");
    }
  };
  
  const toggleSearch = () => setSearchVisible(!searchVisible);

  // Close mobile menu on navigation
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); 

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close search input when clicking outside
  useEffect(() => {
    const handleClickOutsideSearch = (event) => {
        // Check if the search area is visible, the ref is set, and the click is outside
        if (searchVisible && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
            // Additional check: ensure the click wasn't on the search toggle icon itself
            // This requires the toggle icon to also be part of the ref or have its own ref.
            // For simplicity, if the search input area is open, any click outside it will close it.
            // The toggle button itself will handle its own state changes.
            setSearchVisible(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutsideSearch);
    return () => {
        document.removeEventListener('mousedown', handleClickOutsideSearch);
    };
  }, [searchVisible]); // Only depends on searchVisible

  // Determine initials for the profile button
  const userInitials = currentUser?.firstName && currentUser?.lastName
    ? `${currentUser.firstName.charAt(0).toUpperCase()}${currentUser.lastName.charAt(0).toUpperCase()}`
    : currentUser?.firstName // Fallback if only first name (e.g. during signup before full data)
    ? currentUser.firstName.charAt(0).toUpperCase()
    : "U"; // Default if no name

  return (
    <nav className="bg-white shadow-md sticky top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"> {/* Adjusted py */}
        <div className="flex items-center justify-between">
          {/* SECTION 1: Left - Hamburger (Mobile) / Logo (Desktop) */}
          <div className="flex items-center">
            <div className="md:hidden">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded text-gray-600 hover:bg-gray-100" aria-label="Toggle Menu" aria-expanded={mobileOpen}>
                {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
            <Link to="/" className="flex-shrink-0 hidden md:block">
              <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* SECTION 2: Center - Logo (Mobile) / Nav Links (Desktop) */}
          <div className="md:hidden flex-1 flex justify-center px-2">
            <Link to="/" className="flex-shrink-0">
              <img src="/assets/logo.png" alt="Logo" className="h-10 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex flex-1 justify-center items-baseline space-x-8">
            {[
              { label: "Home", path: "/" }, { label: "Products", path: "/products" },
              { label: "About", path: "/about" }, { label: "Contact", path: "/contact" },
            ].map(({ label, path }) => (
              <Link key={path} to={path} className={`font-medium pb-1 ${isActive(path, location.pathname) ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-blue-600 border-b-2 border-transparent"}`}>
                {label}
              </Link>
            ))}
          </div>

          {/* SECTION 3: Right Section (Search, Cart, Profile - Common for Mobile & Desktop) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div ref={searchContainerRef} className="flex items-center">
              {searchVisible && (
                <form onSubmit={handleSearchSubmit} className="mr-1 animate-fade-in-fast">
                  <input type="text" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="border border-gray-300 rounded-l-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm w-32 sm:w-40 transition-all duration-300" placeholder="Search products..." autoFocus />
                </form>
              )}
              <button onClick={searchVisible && searchValue.trim() ? handleSearchSubmit : toggleSearch} type={searchVisible && searchValue.trim() ? "submit" : "button"} className={`p-2 hover:bg-gray-100 rounded-full text-gray-700 ${searchVisible ? (searchValue.trim() ? 'bg-blue-100 hover:bg-blue-200 rounded-r-md rounded-l-none -ml-px border border-blue-500' : 'bg-gray-100 rounded-r-md rounded-l-none -ml-px border border-gray-300') : ''}`} aria-label={searchVisible ? "Submit search" : "Open search"}>
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>

            <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-gray-100 rounded-full text-gray-700" aria-label="Shopping Cart">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItemCount > 0 && (<span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded-full">{cartItemCount}</span>)}
            </button>

            <div ref={profileDropdownRef} className="relative">
              {/* Display based on isAuthenticated from AuthContext */}
              {!authIsLoading && !isAuthenticated && (
                <button onClick={() => { openModal(); switchToTab('signin');}} className="p-2 rounded-full hover:bg-gray-100" aria-label="Sign In / Sign Up">
                  <UserIcon className="h-6 w-6 text-gray-700" />
                </button>
              )}
              {!authIsLoading && isAuthenticated && currentUser && (
                <>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-expanded={dropdownOpen} aria-haspopup="true">
                    {userInitials}
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md border border-gray-200 z-50 text-sm animate-fade-in-fast origin-top-right">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="font-semibold text-gray-800 truncate">{currentUser.firstName} {currentUser.lastName}</p>
                        <p className="text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      {/* Use userRole from AuthContext to determine dashboard link */}
                      {(userRole === 'Buyer' && <Link to="/buyer/dashboard" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600">My Dashboard</Link>)}
                      {(userRole === 'Seller' && <Link to="/seller/dashboard" onClick={() => setDropdownOpen(false)} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600">Seller Dashboard</Link>)}
                      <button onClick={handleSignout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 hover:text-red-700">
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              )}
              {/* Optional: Show a subtle loading indicator for the auth icon if needed */}
              {authIsLoading && (
                <div className="p-2 rounded-full">
                    <div className="h-6 w-6 animate-pulse bg-gray-300 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-t border-gray-200 animate-slide-in-left z-40">
          <div className="flex flex-col items-start gap-1 px-4 py-3">
            {[
                { label: "Home", path: "/" }, { label: "Products", path: "/products" },
                { label: "About", path: "/about" }, { label: "Contact", path: "/contact" },
            ].map(({ label, path }) => (
              <Link key={path} to={path} onClick={() => setMobileOpen(false)} className={`block w-full py-2 px-3 rounded-md hover:bg-gray-100 hover:text-blue-600 font-medium ${isActive(path, location.pathname) ? "text-blue-600 bg-blue-50" : "text-gray-700"}`}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
