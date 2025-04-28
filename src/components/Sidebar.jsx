// Sidebar menu links

import { Link } from "react-router-dom";

/* Sidebar Menu for Dashboards */
export default function Sidebar({ links }) {
  return (
    <div className="w-64 h-full bg-white shadow-md p-6 flex flex-col gap-6">
      {links.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="text-gray-700 hover:text-blue-600 font-medium"
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
