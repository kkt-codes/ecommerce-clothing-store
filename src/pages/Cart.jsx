// src/pages/Cart.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useBuyerAuth } from '../hooks/useBuyerAuth';
import { useSignupSigninModal } from '../hooks/useSignupSigninModal';
import { TrashIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast'; // Import toast

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

  const handleQuantityChange = (productId, itemName, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      // If quantity becomes 0 or less by clicking minus, remove the item
      removeFromCart(productId);
      toast.error(`${itemName} removed from cart.`);
    }
  };

  const handleDirectQuantityInput = (productId, eventValue) => {
    const newQuantity = parseInt(eventValue, 10);
    if (!isNaN(newQuantity) && newQuantity >= 1) {
        updateQuantity(productId, newQuantity);
    }
    // If input is cleared or invalid, onBlur will handle resetting to 1
  };

  const handleBlurQuantityInput = (productId, eventValue) => {
    if (eventValue === "" || parseInt(eventValue, 10) < 1 || isNaN(parseInt(eventValue,10))) {
        updateQuantity(productId, 1); // Reset to 1 if invalid or empty on blur
        toast.error("Quantity reset to 1.", { duration: 2000 });
    }
  };
  
  const handleRemoveItem = (productId, itemName) => {
    removeFromCart(productId);
    toast.error(`${itemName} removed from cart.`);
  };

  const handleClearCart = () => {
    clearCart();
    toast.error("Cart cleared!");
  }

  const handlePlaceOrder = () => {
    if (!isAuthenticated || !buyerData) {
      toast.error("Please sign in as a buyer to place an order."); // Replaced alert
      switchToTab("signin");
      openModal();
      return;
    }

    const newOrders = cartItems.map(item => ({
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buyerId: buyerData.id,
      buyerName: `${buyerData.firstName} ${buyerData.lastName}`,
      productId: item.id,
      productName: item.name,
      productPrice: item.price,
      quantity: item.quantity,
      category: item.category, 
      sellerId: item.sellerId, 
      date: new Date().toISOString(),
    }));

    const existingOrders = JSON.parse(localStorage.getItem("orders")) || [];
    const updatedOrders = [...existingOrders, ...newOrders];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    toast.success("Order placed successfully!"); // Replaced alert
    clearCart(); 
    navigate('/buyer/orders'); 
  };

  // Adjusted min-height to account for navbar and footer approximately
  const emptyCartMinHeight = "min-h-[calc(100vh-16rem)] sm:min-h-[calc(100vh-12rem)]"; 

  if (!isAuthenticated && cartItems.length === 0) {
     return (
      <div className={`flex flex-col items-center justify-center ${emptyCartMinHeight} text-center px-4 py-8`}>
        <img src="/assets/empty-cart.png" alt="Empty cart" className="w-48 sm:w-52 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Looks like you haven't added anything to your cart yet. Start shopping to see your items here!
        </p>
        <Link to="/products" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-semibold text-lg">
          Start Shopping
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) { 
    return (
      <div className={`flex flex-col items-center justify-center ${emptyCartMinHeight} text-center px-4 py-8`}>
        <img src="/assets/empty-cart.png" alt="Empty cart" className="w-48 sm:w-52 mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Your cart is empty!</h2>
        {isAuthenticated ? (
            <p className="text-gray-600 mb-6">Add some products to get started.</p>
        ) : (
            <p className="text-gray-600 mb-6">Sign in to see your saved items, or start shopping!</p>
        )}
        <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/products" className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium">
                Continue Shopping
            </Link>
            {!isAuthenticated && (
                <button onClick={() => { switchToTab("signin"); openModal(); }} className="px-5 py-2.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition font-medium">
                    Sign in to your account
                </button>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Shopping Cart</h1>
      <div className="bg-white shadow-xl rounded-lg"> {/* Added shadow-xl */}
        <ul className="divide-y divide-gray-200">
          {cartItems.map((item) => (
            <li key={item.id} className="flex flex-col sm:flex-row items-center p-4 sm:p-6 gap-4">
              <img src={item.image || '/assets/placeholder.png'} alt={item.name} className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-md flex-shrink-0 shadow-sm" /> {/* Added shadow-sm */}
              <div className="flex-grow text-center sm:text-left">
                <Link to={`/products/${item.id}`} className="hover:text-blue-600">
                  <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{item.category}</p>
                <p className="text-sm text-blue-600 font-medium">
                  Price: ${item.price.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 my-3 sm:my-0">
                <button onClick={() => handleQuantityChange(item.id, item.name, item.quantity, -1)} className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors" aria-label="Decrease quantity">
                  <MinusIcon className="h-5 w-5" />
                </button>
                <input type="number" value={item.quantity} 
                  onChange={(e) => handleDirectQuantityInput(item.id, e.target.value)}
                  onBlur={(e) => handleBlurQuantityInput(item.id, e.target.value)}
                  className="w-12 sm:w-14 text-center border-gray-300 rounded-md p-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label={`Quantity for ${item.name}`} />
                <button onClick={() => handleQuantityChange(item.id, item.name, item.quantity, 1)} className="p-1.5 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-colors" aria-label="Increase quantity">
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <p className="text-md font-semibold text-gray-800 w-24 text-center sm:text-right"> {/* Increased width for price */}
                ${(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => handleRemoveItem(item.id, item.name)} className="p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors" aria-label={`Remove ${item.name} from cart`}>
                <TrashIcon className="h-5 w-5" />
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Subtotal ({getItemCount()} items):</h2>
            <p className="text-2xl font-bold text-blue-600">${getCartTotal().toFixed(2)}</p>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button onClick={handleClearCart} className="px-6 py-2.5 border-2 border-red-500 text-red-600 font-semibold rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300">
              Clear Cart
            </button>
            <button onClick={handlePlaceOrder} disabled={cartItems.length === 0} className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-colors duration-300 shadow-md hover:shadow-lg ${cartItems.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}>
              Proceed to Checkout
            </button>
          </div>
          {!isAuthenticated && cartItems.length > 0 && (
            <p className="text-center text-sm text-orange-600 mt-4">
              You'll be asked to <button onClick={() => { switchToTab("signin"); openModal(); }} className="underline hover:text-orange-700 font-medium">Sign In</button> or <button onClick={() => { switchToTab("signup"); openModal(); }} className="underline hover:text-orange-700 font-medium">Create an Account</button> to complete your order.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
