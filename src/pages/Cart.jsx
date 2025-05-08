import React from 'react';
import { Link, useNavigate }
from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBuyerAuth } from '../hooks/useBuyerAuth';
import { useSignupSigninModal } from '../hooks/useSignupSigninModal';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

export default function Cart() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getItemCount,
  } = useCart();
  const { isAuthenticated, buyerData } = useBuyerAuth();
  const { openModal, switchToTab } = useSignupSigninModal();
  const navigate = useNavigate();

  const handleQuantityChange = (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      removeFromCart(productId); // Or just don't let it go below 1 from UI, and use remove button
    }
  };

  const handlePlaceOrder = () => {
    if (!isAuthenticated || !buyerData) {
      alert("Please sign in as a buyer to place an order.");
      switchToTab("signin");
      openModal();
      return;
    }

    // Create orders from cart items
    const newOrders = cartItems.map(item => ({
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      buyerId: buyerData.id,
      buyerName: `${buyerData.firstName} ${buyerData.lastName}`,
      productId: item.id,
      productName: item.name,
      productPrice: item.price,
      quantity: item.quantity,
      category: item.category, // Assuming product object in cart has category
      sellerId: item.sellerId, // Assuming product object in cart has sellerId
      date: new Date().toISOString(), // Use ISO string for better date handling
    }));

    // Retrieve existing orders and add new ones
    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const updatedOrders = [...existingOrders, ...newOrders];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    alert("Order placed successfully!");
    clearCart(); // Clear the cart after placing the order
    navigate('/buyer/orders'); // Navigate to buyer's order page
  };


  if (!isAuthenticated && cartItems.length === 0) { // Guest with empty cart
     return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-8">
        <img
          src="/assets/empty-cart.png" // Make sure you have this image
          alt="Empty cart"
          className="w-48 sm:w-52 mb-6"
        />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Looks like you haven't added anything to your cart yet. Start shopping to see your items here!
        </p>
        <Link
          to="/products"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold text-lg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }


  if (cartItems.length === 0) { // Logged in or guest, but cart is empty
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-8">
        <img
          src="/assets/empty-cart.png" // Make sure you have this image
          alt="Empty cart"
          className="w-48 sm:w-52 mb-6"
        />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty!</h2>
        {isAuthenticated ? (
            <p className="text-gray-600 mb-6">Add some products to get started.</p>
        ) : (
            <p className="text-gray-600 mb-6">Sign in to see your saved items, or start shopping!</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
            <Link
                to="/products"
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
                Continue Shopping
            </Link>
            {!isAuthenticated && (
                <button
                    onClick={() => { switchToTab("signin"); openModal(); }}
                    className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition font-medium"
                >
                    Sign in to your account
                </button>
            )}
        </div>
      </div>
    );
  }

  // Cart has items
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>
      
      <div className="bg-white shadow-lg rounded-lg">
        {/* Cart Items */}
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item.id} className="flex flex-col sm:flex-row items-center p-4 sm:p-6 gap-4">
              <img
                src={item.image || '/assets/placeholder.png'}
                alt={item.name}
                className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0"
              />
              <div className="flex-grow text-center sm:text-left">
                <Link to={`/products/${item.id}`} className="hover:text-blue-600">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm text-blue-500 font-medium">
                  Price: ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-0">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                  className="p-1.5 rounded-full text-gray-600 hover:bg-gray-200"
                  aria-label="Decrease quantity"
                >
                  <MinusIcon className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => {
                      const newQuantity = parseInt(e.target.value);
                      if (!isNaN(newQuantity) && newQuantity >= 1) {
                          updateQuantity(item.id, newQuantity);
                      } else if (e.target.value === "") {
                          // Allow temporarily empty for typing, but don't update context with it
                      }
                  }}
                  onBlur={(e) => { // Final check on blur
                    if (e.target.value === "" || parseInt(e.target.value) < 1) {
                        updateQuantity(item.id, 1); // Reset to 1 if invalid or empty on blur
                    }
                  }}
                  className="w-12 sm:w-14 text-center border-gray-300 rounded-md p-1.5 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={`Quantity for ${item.name}`}
                />
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                  className="p-1.5 rounded-full text-gray-600 hover:bg-gray-200"
                  aria-label="Increase quantity"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-md font-semibold w-20 text-center sm:text-right">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-2 rounded-full text-red-500 hover:bg-red-100"
                aria-label={`Remove ${item.name} from cart`}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>

        {/* Cart Summary & Actions */}
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Subtotal ({getItemCount()} items):
            </h2>
            <p className="text-2xl font-bold text-blue-600">
              ${getCartTotal().toFixed(2)}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button
              onClick={clearCart}
              className="px-6 py-2.5 border border-red-500 text-red-500 rounded-md hover:bg-red-50 transition font-medium"
            >
              Clear Cart
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={cartItems.length === 0}
              className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors duration-300
                ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              Proceed to Checkout
            </button>
          </div>
          {!isAuthenticated && cartItems.length > 0 && (
            <p className="text-center text-sm text-orange-600 mt-4">
              You'll be asked to <button onClick={() => { switchToTab("signin"); openModal(); }} className="underline hover:text-orange-700">Sign In</button> or <button onClick={() => { switchToTab("signup"); openModal(); }} className="underline hover:text-orange-700">Create an Account</button> to complete your order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}