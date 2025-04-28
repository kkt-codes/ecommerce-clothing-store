// Modal switching between SignUp and Login

// src/components/SignupLoginModal.jsx
import { useState } from "react";
import { useSignupLoginModal } from "../hooks/useSignupLoginModal";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/24/outline";

/* Signup/Login Modal */
export default function SignupLoginModal() {
  const { isOpen, closeModal } = useSignupLoginModal();
  const [view, setView] = useState("signup"); // "signup" or "login"
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-black">&times;</button>

        {/* Toggle Tabs */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 ${view === "signup" ? "border-b-2 border-blue-600" : ""}`}
            onClick={() => setView("signup")}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-2 ${view === "login" ? "border-b-2 border-blue-600" : ""}`}
            onClick={() => setView("login")}
          >
            Log In
          </button>
        </div>

        {/* Signup or Login Form */}
        {view === "signup" ? (
          <form className="flex flex-col gap-4">
            {/* Floating Labels */}
            <div className="relative">
              <input type="text" id="firstName" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="firstName" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">First Name</label>
            </div>
            <div className="relative">
              <input type="text" id="lastName" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="lastName" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Last Name</label>
            </div>
            <div className="relative">
              <input type="email" id="email" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="email" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Email</label>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="password" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="password" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Password</label>
              {/* Eye Icon */}
              <button type="button" className="absolute right-2 top-3" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="confirmPassword" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="confirmPassword" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Confirm Password</label>
            </div>

            {/* Role select */}
            <select required className="w-full border-b-2 py-2 text-gray-700 focus:outline-none">
              <option value="">Select Role</option>
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>

            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Create Account</button>
          </form>
        ) : (
          <form className="flex flex-col gap-4">
            <div className="relative">
              <input type="email" id="loginEmail" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="loginEmail" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Email</label>
            </div>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} id="loginPassword" className="peer w-full border-b-2 focus:outline-none py-2" placeholder=" " required />
              <label htmlFor="loginPassword" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Password</label>
              {/* Eye Icon */}
              <button type="button" className="absolute right-2 top-3" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Log In</button>
          </form>
        )}
      </div>
    </div>
  );
}
