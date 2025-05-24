import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { UserCircleIcon, ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/solid"; 
import { useAuthContext } from '../context/AuthContext'; // Import the global AuthContext
import toast from "react-hot-toast";


export default function Sidebar({ links, userRole, userName }) {
  const navigate = useNavigate();
  const location = useLocation(); 
  const { signout, isLoading: authIsLoading } = useAuthContext(); // Get signout function and loading state

  const handleSignOut = async () => {
    // console.log("Sidebar: handleSignOut called");
    try {
      await signout(); // Call the signout function from AuthContext
      // Toast for successful signout is now handled within AuthContext's signout if desired,
      // or can be added here. AuthContext already navigates to '/'.
      // toast.success("Signed out successfully."); // Optional: if not handled in context
    } catch (error) {
      console.error("Sidebar: Error during signout:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  return (
    <aside className="w-60 md:w-64 h-screen bg-white shadow-2xl flex flex-col sticky top-0 left-0 z-40 print:hidden"> 
      {/* User Info Area */}
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center gap-3">
            <UserCircleIcon className="h-12 w-12 text-gray-400 flex-shrink-0"/>
            <div className="overflow-hidden"> 
                <p className="text-sm font-semibold text-gray-800 capitalize truncate" title={userName || "User"}>
                  {userName || "User"}
                </p>
                <p className="text-xs text-gray-500 capitalize">{userRole ? `${userRole} Account` : "Account"}</p>
            </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto"> 
        {links && links.map((link) => (
          <NavLink 
            key={link.path}
            to={link.path}
            end={link.path.endsWith('dashboard') || link.path === '/seller/dashboard' || link.path === '/buyer/dashboard'} 
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out group
              ${isActive 
                ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:translate-x-1'
              }`
            }
          >
            {/* Ensure link.icon is a valid React component */}
            {link.icon && React.createElement(link.icon, { 
                className: `h-5 w-5 flex-shrink-0 transition-colors group-hover:text-blue-500 ${
                    location.pathname === link.path ? 'text-white' : 'text-gray-400'
                }`
            })}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto border-t border-gray-200">
        <button
          onClick={handleSignOut}
          disabled={authIsLoading} // Disable button if auth operations are in progress
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 transition-all duration-200 ease-in-out group disabled:opacity-70"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-red-500 group-hover:text-red-600 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
