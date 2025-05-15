import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { UserCircleIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/solid"; 
import { useAuth } from '../hooks/useAuth'; 
import { useBuyerAuth } from '../hooks/useBuyerAuth'; 
import toast from "react-hot-toast";


export default function Sidebar({ links, userRole, userName }) {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const { logout: sellerLogout, isAuthenticated: isSellerAuth } = useAuth();
  const { logout: buyerLogout, isAuthenticated: isBuyerAuth } = useBuyerAuth();

  const handleLogout = () => {
    if (userRole === 'Seller' && isSellerAuth) {
      sellerLogout();
      toast.success("Seller signed out successfully.");
    } else if (userRole === 'Buyer' && isBuyerAuth) {
      buyerLogout();
      toast.success("Buyer signed out successfully.");
    } else {
      // Fallback or if role doesn't match auth state, clear both just in case
      // This might not be necessary if ProtectedRoutes handle unauth state well
      if(isSellerAuth) sellerLogout();
      if(isBuyerAuth) buyerLogout();
      toast.success("Signed out.");
    }
    navigate('/');
  };

  return (
    <aside className="w-60 md:w-64 h-screen bg-white shadow-2xl flex flex-col sticky top-0 left-0 z-40 print:hidden"> {/* Added print:hidden */}
      {/* User Info Area */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <UserCircleIcon className="h-12 w-12 text-gray-400 flex-shrink-0"/>
            <div className="overflow-hidden"> {/* Prevents text overflow issues */}
                <p className="text-sm font-semibold text-gray-800 capitalize truncate" title={userName || userRole}>
                  {userName || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userRole} Account</p>
            </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto"> 
        {links && links.map((link) => (
          <NavLink 
            key={link.path}
            to={link.path}
            // `end` prop is important for "Dashboard" link to not stay active for sub-routes like /dashboard/settings
            // Only apply 'end' if the path is exactly a dashboard path, not for other specific paths.
            end={link.path.endsWith('dashboard') || link.path === '/seller/dashboard' || link.path === '/buyer/dashboard'} 
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
              }`
            }
          >
            {link.icon && <link.icon className={`h-5 w-5 flex-shrink-0 transition-colors group-hover:text-blue-500 ${link.path === location.pathname ? 'text-white' : 'text-gray-400'}`} />}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 ease-in-out group"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
