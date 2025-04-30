import { useState } from "react";
import { Dialog } from "@headlessui/react";
import { EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useSignupLoginModal } from "../hooks/useSignupLoginModal";

export default function SignupLoginModal() {
  const { isOpen, closeModal, activeTab, switchToTab } = useSignupLoginModal();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Buyer",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submit", formData);
    // add your auth logic here
    closeModal();
  };

  return (
    <Dialog open={isOpen} onClose={closeModal} className="fixed z-50 inset-0 flex items-center justify-center bg-black/30">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg relative p-6 mx-4 md:mx-0">
        {/* Close Button */}
        <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-black">
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Tab Buttons */}
        <div className="flex justify-center mb-6 border-b pb-2">
          <button
            onClick={() => switchToTab("signup")}
            className={`px-4 py-2 text-sm font-semibold ${activeTab === "signup" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Sign Up
          </button>
          <button
            onClick={() => switchToTab("signin")}
            className={`px-4 py-2 text-sm font-semibold ml-4 ${activeTab === "signin" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500"}`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            setShow={setShowPassword}
          />

          {activeTab === "signup" && (
            <>
              <FloatingPasswordInput
                label="Confirm Password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                show={showPassword}
                setShow={setShowPassword}
              />
              <div className="mt-2">
                <label className="text-sm font-medium text-gray-600">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full mt-1 border px-3 py-2 rounded text-sm focus:outline-blue-500"
                >
                  <option>Buyer</option>
                  <option>Seller</option>
                </select>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
          >
            {activeTab === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>
      </div>
    </Dialog>
  );
}

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

function FloatingPasswordInput({ label, name, value, onChange, show, setShow }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        className="peer w-full border px-3 py-2 rounded text-sm placeholder-transparent focus:outline-none focus:border-blue-600"
      />
      <label
        htmlFor={name}
        className="absolute left-3 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-1 peer-focus:text-sm peer-focus:text-blue-600"
      >
        {label}
      </label>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-2.5 text-gray-500"
      >
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}
