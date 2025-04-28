// Modal switching between SignUp and Login

import { useState } from "react";
import { useSignupLoginModal } from "../hooks/useSignupLoginModal";
import { useAuth } from "../hooks/useAuth";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/24/outline";

import sellers from "../data/sellers.json";
import buyers from "../data/buyers.json";

/* Signup/Login Modal */
export default function SignupLoginModal() {
  const { isOpen, closeModal } = useSignupLoginModal();
  const [view, setView] = useState("signup"); // "signup" or "login"
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Buyer"
  });

  const { login: sellerLogin } = useAuth();        // Seller login function
  const { login: buyerLogin } = useBuyerAuth();    // Buyer login function

  // Handle form input changes
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // ===== Handle Sign Up Submit =====
  const handleSignup = (e) => {
    e.preventDefault();

    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    // Check if user already exists
    const existingSeller = sellers.find((u) => u.email === email);
    const existingBuyer = buyers.find((u) => u.email === email);

    if (existingSeller || existingBuyer) {
      alert("Account with this email already exists.");
      return;
    }

    // Mock create user
    const newUser = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      firstName,
      lastName,
      email,
      password,
      role
    };

    if (role === "Seller") {
      // Save seller
      localStorage.setItem("sellerToken", `token-${newUser.id}`);
      localStorage.setItem("sellerData", JSON.stringify(newUser));
      sellerLogin(`token-${newUser.id}`, newUser);
    } else {
      // Save buyer
      localStorage.setItem("buyerToken", `token-${newUser.id}`);
      localStorage.setItem("buyerData", JSON.stringify(newUser));
      buyerLogin(`token-${newUser.id}`, newUser);
    }

    closeModal();
    alert("Account created successfully!");
  };

  // ===== Handle Login Submit =====
  const handleLogin = (e) => {
    e.preventDefault();

    const { email, password } = formData;

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    // Check sellers
    const sellerUser = sellers.find((u) => u.email === email && u.password === password);
    if (sellerUser) {
      localStorage.setItem("sellerToken", `token-${sellerUser.id}`);
      localStorage.setItem("sellerData", JSON.stringify(sellerUser));
      sellerLogin(`token-${sellerUser.id}`, sellerUser);
      closeModal();
      return;
    }

    // Check buyers
    const buyerUser = buyers.find((u) => u.email === email && u.password === password);
    if (buyerUser) {
      localStorage.setItem("buyerToken", `token-${buyerUser.id}`);
      localStorage.setItem("buyerData", JSON.stringify(buyerUser));
      buyerLogin(`token-${buyerUser.id}`, buyerUser);
      closeModal();
      return;
    }

    alert("Invalid email or password.");
  };

  if (!isOpen) return null; // Modal hidden when closed

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 relative">
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-2 right-2 text-gray-600 hover:text-black">&times;</button>

        {/* Toggle Tabs */}
        <div className="flex mb-6">
          <button
            className={`flex-1 py-2 ${view === "signup" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
            onClick={() => setView("signup")}
          >
            Sign Up
          </button>
          <button
            className={`flex-1 py-2 ${view === "login" ? "border-b-2 border-blue-600 font-semibold" : ""}`}
            onClick={() => setView("login")}
          >
            Log In
          </button>
        </div>

        {/* ===== Sign Up Form ===== */}
        {view === "signup" ? (
          <form className="flex flex-col gap-4" onSubmit={handleSignup}>
            {/* Floating Labels */}
            {["firstName", "lastName", "email"].map((field) => (
              <div key={field} className="relative">
                <input
                  type="text"
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder=" "
                  required
                  className="peer w-full border-b-2 focus:outline-none py-2"
                />
                <label
                  htmlFor={field}
                  className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all"
                >
                  {field === "firstName" ? "First Name" : field === "lastName" ? "Last Name" : "Email"}
                </label>
              </div>
            ))}

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full border-b-2 focus:outline-none py-2"
              />
              <label htmlFor="password" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Password</label>
              <button type="button" className="absolute right-2 top-3" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full border-b-2 focus:outline-none py-2"
              />
              <label htmlFor="confirmPassword" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Confirm Password</label>
            </div>

            {/* Role Select */}
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border-b-2 py-2 text-gray-700 focus:outline-none"
            >
              <option value="Buyer">Buyer</option>
              <option value="Seller">Seller</option>
            </select>

            {/* Signup Submit */}
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Create Account
            </button>
          </form>
        ) : (
          /* ===== Login Form ===== */
          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full border-b-2 focus:outline-none py-2"
              />
              <label htmlFor="loginEmail" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Email</label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder=" "
                required
                className="peer w-full border-b-2 focus:outline-none py-2"
              />
              <label htmlFor="loginPassword" className="absolute left-0 top-2 text-gray-500 text-sm peer-placeholder-shown:top-4 peer-placeholder-shown:text-base transition-all">Password</label>
              <button type="button" className="absolute right-2 top-3" onClick={togglePasswordVisibility}>
                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-400" /> : <EyeIcon className="h-5 w-5 text-gray-400" />}
              </button>
            </div>

            {/* Login Submit */}
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
              Log In
            </button>
          </form>
        )}

      </div>
    </div>
  );
}



