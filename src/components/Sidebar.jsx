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
    <aside className="h-screen bg-white shadow-2xl flex flex-col sticky top-0 left-0 z-40 print:hidden w-20 md:w-20 lg:w-60">
      {/* User Info Area */}
      <div className="p-2 lg:p-5 border-b border-gray-200">
        <div className="flex flex-col items-center lg:flex-row lg:items-center lg:gap-3">
          <UserCircleIcon className="h-10 w-10 text-gray-400" />

          <div className="mt-1 lg:mt-0 text-center lg:text-left">
            <p
              className="hidden lg:block text-sm font-semibold text-gray-800 capitalize truncate"
              title={userName || "User"}
            >
              {userName || "User"}
            </p>
            <p className="hidden lg:block text-xs text-gray-500 capitalize">
              {userRole ? `${userRole} Account` : "Account"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow p-2 lg:p-4 space-y-1.5 overflow-y-auto">
        {links && links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path.endsWith('dashboard')}
            className={({ isActive }) =>
              `flex flex-col lg:flex-row items-center lg:items-start gap-1 lg:gap-3.5 px-3 lg:px-4 py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-all duration-200 ease-in-out group 
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            {link.icon && React.createElement(link.icon, {
              className: `h-5 w-5 transition-colors group-hover:text-blue-500 ${
                location.pathname === link.path ? 'text-white' : 'text-gray-400'
              }`
            })}
            <span className="hidden lg:inline">{link.label}</span>
            <span className="lg:hidden text-[10px] text-center block">{link.label}</span> {/* small text under icon */}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="p-2 lg:p-4 mt-auto border-t border-gray-200">
        <button
          onClick={handleSignOut}
          disabled={authIsLoading}
          className="w-full flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 lg:px-4 py-2.5 rounded-lg text-xs lg:text-sm text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition"
        >
          <ArrowLeftStartOnRectangleIcon className="h-5 w-5 text-red-500" />
          <span className="hidden lg:inline">Sign Out</span>
          <span className="lg:hidden text-[10px]">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
