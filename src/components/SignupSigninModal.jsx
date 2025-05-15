import { useState } from "react";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal.jsx";
import { useAuth } from "../hooks/useAuth";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import buyers from "../data/buyers.json";
import sellers from "../data/sellers.json";
import toast from 'react-hot-toast';

export default function SignupSigninModal() {
  const { isOpen, closeModal, activeTab, switchToTab } = useSignupSigninModal();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Buyer",
  });

  // Separate state for each password field's visibility
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { login: sellerLogin } = useAuth();
  const { login: buyerLogin } = useBuyerAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Toggle functions for each password field
  const toggleMainPasswordVisibility = () => {
    setShowMainPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "Buyer",
    });
    setShowMainPassword(false); // Reset visibility states too
    setShowConfirmPassword(false);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const existingUser = [...buyers, ...sellers].find((u) => u.email === email);
    if (existingUser) {
      toast.error("Email already in use");
      return;
    }

    const newUser = {
      id: `${role.toLowerCase()}-${Date.now()}`,
      firstName,
      lastName,
      email,
      password, 
      role,
    };

    if (role === "Buyer") {
      localStorage.setItem("buyerToken", `token-${newUser.id}`); 
      localStorage.setItem("buyerData", JSON.stringify(newUser));
      buyerLogin(`token-${newUser.id}`, newUser);
    } else {
      localStorage.setItem("sellerToken", `token-${newUser.id}`); 
      localStorage.setItem("sellerData", JSON.stringify(newUser));
      sellerLogin(`token-${newUser.id}`, newUser);
    }

    resetForm();
    closeModal();
  };

  const handleSignin = (e) => {
    e.preventDefault();
    const { email, password } = formData;

    if (!email || !password) {
      toast.error("Please enter email and password.");
        return;
    }

    const seller = sellers.find((s) => s.email === email && s.password === password);
    if (seller) {
      localStorage.setItem("sellerToken", `token-${seller.id}`);
      localStorage.setItem("sellerData", JSON.stringify(seller));
      sellerLogin(`token-${seller.id}`, seller);
      resetForm();
      closeModal();
      return;
    }

    const buyer = buyers.find((b) => b.email === email && b.password === password);
    if (buyer) {
      localStorage.setItem("buyerToken", `token-${buyer.id}`);
      localStorage.setItem("buyerData", JSON.stringify(buyer));
      buyerLogin(`token-${buyer.id}`, buyer);
      resetForm();
      closeModal();
      return;
    }

    toast.error("Invalid email or password");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4 py-8">
      <div className="bg-white w-full max-w-md rounded-lg shadow-xl p-6 sm:p-8 relative animate-fade-in max-h-[90vh] overflow-y-auto">
        <button 
          onClick={() => { resetForm(); closeModal(); }} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close modal"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex justify-center gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => { switchToTab("signup"); resetForm(); }}
            className={`pb-2 text-base sm:text-lg font-medium transition-colors ${activeTab === "signup" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { switchToTab("signin"); resetForm(); }}
            className={`pb-2 text-base sm:text-lg font-medium transition-colors ${activeTab === "signin" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={activeTab === "signup" ? handleSignup : handleSignin} className="space-y-6"> 
          {activeTab === "signup" && (
            <>
              <FloatingInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} autoComplete="given-name" />
              <FloatingInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} autoComplete="family-name"/>
            </>
          )}
          <FloatingInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email"/>
          <FloatingPasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            show={showMainPassword}
            toggleShow={toggleMainPasswordVisibility}
            autoComplete={activeTab === "signup" ? "new-password" : "current-password"}
          />
          {activeTab === "signup" && (
            <>
              <FloatingPasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showConfirmPassword}
                toggleShow={toggleConfirmPasswordVisibility}
                autoComplete="new-password"
              />
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-1 border border-gray-300 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-base mt-8"
          >
            {activeTab === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Floating Label Input Component - Notched Style (No label shrink)
function FloatingInput({ label, name, type = "text", value, onChange, autoComplete }) {
  return (
    <div className="relative mt-2"> 
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" " // Crucial: A single space for :placeholder-shown to work
        className="
          peer w-full px-3 pt-4 pb-2  /* Padding: top for placeholder, bottom for text */
          text-base text-gray-900    /* Input text size */
          border border-gray-300 rounded-lg /* Standard box bordr */
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent /* Focus style */
        "
        required
        autoComplete={autoComplete}
      />
      {/* This label styling creates the "notch" effect for the floated label */}
      <label
        htmlFor={name}
        className={`
          absolute left-3 pointer-events-none 
          text-base text-gray-500          
          transition-all duration-200 ease-out 
          
          peer-placeholder-shown:top-3.5 /* Label inside input */
          
          /* Floated label - with bg-white and px-1 to create the notch */
          peer-focus:-top-2.5 peer-focus:left-2 peer-focus:px-1 peer-focus:bg-white 
          peer-focus:text-blue-600 
          
          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-white
          peer-[:not(:placeholder-shown)]:text-gray-700 
        `}
      >
        {label}
      </label>
    </div>
  );
}

// Floating Label Password Input Component - Notched Style (No label shrink)
// This component's label styling is identical to FloatingInput's label styling.
function FloatingPasswordInput({ label, name, value, onChange, show, toggleShow, autoComplete }) {
  return (
    <div className="relative mt-2"> 
      <input
        type={show ? "text" : "password"}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" " 
        className="
          peer w-full px-3 pt-4 pb-2 
          text-base text-gray-900 
          border border-gray-300 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        "
        required
        autoComplete={autoComplete}
      />
      {/* This label styling creates the "notch" effect for the floated label */}
      <label
        htmlFor={name}
        className={`
          absolute left-3 pointer-events-none
          text-base text-gray-500
          transition-all duration-200 ease-out 
          
          peer-placeholder-shown:top-3.5 /* Label inside input */
          
          /* Floated label - with bg-white and px-1 to create the notch */
          peer-focus:-top-2.5 peer-focus:left-2 peer-focus:px-1 peer-focus:bg-white
          peer-focus:text-blue-600
          
          peer-[:not(:placeholder-shown)]:-top-2.5 peer-[:not(:placeholder-shown)]:left-2 peer-[:not(:placeholder-shown)]:px-1 peer-[:not(:placeholder-shown)]:bg-white
          peer-[:not(:placeholder-shown)]:text-gray-700
        `}
      >
        {label}
      </label>
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 transform text-gray-500 hover:text-gray-700 transition-colors"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
