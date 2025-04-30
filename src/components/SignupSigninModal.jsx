import { useState } from "react";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSignupSigninModal } from "../hooks/useSignupSigninModal";
import { useAuth } from "../hooks/useAuth";
import { useBuyerAuth } from "../hooks/useBuyerAuth";
import buyers from "../data/buyers.json";
import sellers from "../data/sellers.json";

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

  const [showPassword, setShowPassword] = useState(false);

  const { login: sellerLogin } = useAuth();
  const { login: buyerLogin } = useBuyerAuth();

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
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
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword, role } = formData;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    const existing = [...buyers, ...sellers].find((u) => u.email === email);
    if (existing) {
      alert("Email already in use");
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

    const seller = sellers.find((s) => s.email === email && s.password === password);
    if (seller) {
      localStorage.setItem("sellerToken", `token-${seller.id}`);
      localStorage.setItem("sellerData", JSON.stringify(seller));
      sellerLogin(`token-${seller.id}`, seller);
      closeModal();
      return;
    }

    const buyer = buyers.find((b) => b.email === email && b.password === password);
    if (buyer) {
      localStorage.setItem("buyerToken", `token-${buyer.id}`);
      localStorage.setItem("buyerData", JSON.stringify(buyer));
      buyerLogin(`token-${buyer.id}`, buyer);
      closeModal();
      return;
    }

    alert("Invalid email or password");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative animate-fade-in">
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-black">
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Tab Switch */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => switchToTab("signup")}
            className={`pb-1 ${activeTab === "signup" ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-gray-500"}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => switchToTab("signin")}
            className={`pb-1 ${activeTab === "signin" ? "border-b-2 border-blue-600 font-semibold text-blue-600" : "text-gray-500"}`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={activeTab === "signup" ? handleSignup : handleSignin} className="space-y-4">
          {activeTab === "signup" && (
            <>
              <FloatingInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <FloatingInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            </>
          )}
          <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
          <FloatingPasswordInput
            label="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            show={showPassword}
            toggleShow={togglePasswordVisibility}
          />
          {activeTab === "signup" && (
            <>
              <FloatingPasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showPassword}
                toggleShow={togglePasswordVisibility}
              />
              <div>
                <label className="text-sm text-gray-600 font-medium">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-1 border px-3 py-2 rounded text-sm"
                >
                  <option value="Buyer">Buyer</option>
                  <option value="Seller">Seller</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {activeTab === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Floating Label Input
function FloatingInput({ label, name, type = "text", value, onChange }) {
  return (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border px-3 py-2 rounded text-sm placeholder-transparent focus:outline-none focus:border-blue-600"
        required
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
    </div>
  );
}

// Floating Label Password Input
function FloatingPasswordInput({ label, name, value, onChange, show, toggleShow }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border px-3 py-2 rounded text-sm placeholder-transparent focus:outline-none focus:border-blue-600"
        required
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-2.5 text-gray-500"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
