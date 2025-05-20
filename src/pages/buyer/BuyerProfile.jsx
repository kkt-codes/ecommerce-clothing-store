// Update info

import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UserCircleIcon, EnvelopeIcon, DevicePhoneMobileIcon, ChartBarIcon, ListBulletIcon, ChatBubbleLeftEllipsisIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function BuyerProfile() {
  // Use the global AuthContext
  const { currentUser, isAuthenticated, userRole, isLoading: isAuthLoading, updateCurrentUserData } = useAuthContext();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    // Password change would typically be a separate, more secure form
    // For now, we'll focus on name and email.
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buyer Sidebar Links - Ensure icons are imported and assigned
  const buyerLinks = [
    { label: "Dashboard", path: "/buyer/dashboard", icon: ChartBarIcon },
    { label: "My Orders", path: "/buyer/orders", icon: ListBulletIcon },
    { label: "Messages", path: "/buyer/messages", icon: ChatBubbleLeftEllipsisIcon },
    { label: "My Profile", path: "/buyer/profile", icon: UserCircleIcon },
    { label: "My Favorites", path: "/buyer/favorites", icon: HeartIcon },
  ];

  // Pre-fill form when currentUser data is available
  useEffect(() => {
    if (currentUser && userRole === 'Buyer') {
      setFormData({
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || '', // Email is usually not editable, but display it
      });
    }
  }, [currentUser, userRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateProfileForm = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    // Email is typically not editable by the user directly in a profile update form
    // If it were, you'd add validation:
    // if (!formData.email.trim()) errors.email = "Email is required.";
    // else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email is invalid.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!validateProfileForm()) {
      toast.error("Please correct the form errors.");
      return;
    }
    if (!currentUser || userRole !== 'Buyer') {
        toast.error("You must be signed in as a Buyer to update your profile.");
        return;
    }

    setIsSubmitting(true);
    const detailsToUpdate = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      // Do not allow email change through this simple form for now
      // email: formData.email, // If email change was allowed
    };

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 700));

    const success = updateCurrentUserData(detailsToUpdate);

    if (success) {
      toast.success("Profile updated successfully!");
      setIsEditing(false); // Exit editing mode
    } else {
      toast.error("Failed to update profile. Please try again.");
    }
    setIsSubmitting(false);
  };
  
  // Handle loading state from AuthContext
  if (isAuthLoading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" /> {/* Show basic sidebar */}
        <main className="flex-1 p-6 sm:p-8 flex justify-center items-center">
          <p className="text-gray-500 animate-pulse text-lg">Loading Profile...</p>
        </main>
      </div>
    );
  }

  // Handle case where user is not a Buyer or not authenticated
  // (ProtectedRoute should also catch this, but good for robustness)
  if (!isAuthenticated || userRole !== 'Buyer' || !currentUser) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar links={buyerLinks} userRole="Buyer" />
        <main className="flex-1 p-6 sm:p-8 flex flex-col justify-center items-center text-center">
          <UserCircleIcon className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please sign in as a Buyer to view your profile.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar links={buyerLinks} userRole="Buyer" userName={currentUser.firstName} />
      <main className="flex-1 p-6 sm:p-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <UserCircleIcon className="h-8 w-8 mr-3 text-blue-600" />
            My Profile
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            View and update your account details.
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl max-w-2xl mx-auto">
          {!isEditing ? (
            // View Mode
            <div className="space-y-5">
              <div className="flex items-center">
                <UserCircleIcon className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-md font-medium text-gray-800">{currentUser.firstName} {currentUser.lastName}</p>
                </div>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Email Address</p>
                  <p className="text-md font-medium text-gray-800">{currentUser.email}</p>
                </div>
              </div>
              {/* Add more fields to display if needed, e.g., phone (if you add it to UserDTO) */}
              {/* <div className="flex items-center">
                <DevicePhoneMobileIcon className="h-6 w-6 text-gray-400 mr-3" />
                <div>
                  <p className="text-xs text-gray-500">Phone Number</p>
                  <p className="text-md font-medium text-gray-800">{currentUser.phone || "Not provided"}</p>
                </div>
              </div> */}
              <button
                onClick={() => setIsEditing(true)}
                className="mt-6 w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text" name="firstName" id="firstName" value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {formErrors.firstName && <p className="text-xs text-red-600 mt-1">{formErrors.firstName}</p>}
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text" name="lastName" id="lastName" value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 sm:text-sm ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`}
                />
                {formErrors.lastName && <p className="text-xs text-red-600 mt-1">{formErrors.lastName}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address (Cannot be changed)</label>
                <input
                  type="email" name="email" id="email" value={formData.email}
                  readOnly // Email is not editable
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 sm:text-sm cursor-not-allowed"
                />
              </div>
              {/* Add password change fields here if implementing that feature */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    // Reset form to original currentUser data if user cancels edit
                    if (currentUser) {
                        setFormData({
                            firstName: currentUser.firstName || '',
                            lastName: currentUser.lastName || '',
                            email: currentUser.email || '',
                        });
                    }
                    setFormErrors({});
                  }}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
