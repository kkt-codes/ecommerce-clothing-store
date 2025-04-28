// Sidebar menu links

import { Link, useLocation } from "react-router-dom";

/* Sidebar Menu */
export default function Sidebar({ links }) {
  const location = useLocation(); // Get current route

  return (
    <div className="w-64 h-full bg-white shadow-md p-6 flex flex-col gap-6">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`text-gray-700 font-medium hover:text-blue-600 ${
            location.pathname === link.path ? "text-blue-600" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}

