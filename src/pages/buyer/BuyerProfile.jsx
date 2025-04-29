// Update info

import React, { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import { useBuyerAuth } from "../../hooks/useBuyerAuth";

/* Buyer Profile Page */
export default function BuyerProfile() {
  const { buyerData, login } = useBuyerAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard" },
    { label: "My Orders", path: "/buyer/orders" },
    { label: "Messages", path: "/buyer/messages" },
    { label: "Profile", path: "/buyer/profile" }
  ];

  useEffect(() => {
    if (buyerData) {
      setFormData({
        firstName: buyerData.firstName || "",
        lastName: buyerData.lastName || "",
        email: buyerData.email || ""
      });
    }
  }, [buyerData]);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle Save Changes
  const handleSave = (e) => {
    e.preventDefault();

    const updatedBuyer = {
      ...buyerData,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email
    };

    localStorage.setItem("buyerData", JSON.stringify(updatedBuyer));
    login(localStorage.getItem("buyerToken"), updatedBuyer);

    alert("Profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar links={buyerLinks} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {/* Profile Form */}
        <form className="max-w-2xl mx-auto grid grid-cols-1 gap-6" onSubmit={handleSave}>
          <div className="flex flex-col">
            <label className="mb-1 font-semibold">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded p-2 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </form>

      </div>
    </div>
  );
}

