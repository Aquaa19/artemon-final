// Filename: src/pages/shop/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, UserCircle, Loader } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
// Import the route map from App.jsx
import { ROUTE_MAP } from '../../App';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Loading State
  if (cartLoading) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 pt-20">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Syncing your cart...</p>
        </div>
      );
  }

  // 2. Empty State
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 pt-20">
        <div className="bg-white p-8 rounded-full shadow-sm mb-6">
          <ShoppingBag className="w-16 h-16 text-indigo-200" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-lg">
          Looks like you haven't found the perfect toy yet. Let's fix that!
        </p>
        {/* Updated Link to use ROUTE_MAP.SHOP */}
        <Link 
          to={ROUTE_MAP.SHOP} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center gap-2"
        >
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

        {!user && (
          <div className="bg-amber-50 border border-amber-100 p-4 mb-8 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex gap-3 items-center">
              <UserCircle className="w-6 h-6 text-amber-500" />
              <p className="text-sm text-amber-800 font-medium">Sign in to save your cart permanently.</p>
            </div>
            {/* Updated Link to use ROUTE_MAP.LOGIN */}
            <Link to={ROUTE_MAP.LOGIN} className="text-sm bg-white text-amber-600 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-amber-100 transition">Sign In</Link>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
               if(!item) return null;
               const price = parseFloat(item.price) || 0;
               return (
                <div key={item.id} className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-6 items-center">
                  <img
                    src={item.image || "https://placehold.co/100x100"}
                    className="w-24 h-24 rounded-2xl object-cover bg-gray-50"
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-gray-500 text-sm">{item.category}</p>
                    <p className="text-indigo-600 font-bold mt-1 sm:hidden">₹{(price * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-200">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 hover:text-indigo-600 disabled:opacity-30"><Minus className="w-4 h-4"/></button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-indigo-600"><Plus className="w-4 h-4"/></button>
                  </div>
                  <div className="hidden sm:block text-right min-w-[5rem]">
                    <p className="font-bold text-lg">₹{(price * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-5 h-5" /></button>
                </div>
               );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-28">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{getCartTotal().toFixed(2)}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-500 font-bold">Free</span></div>
                <div className="flex justify-between text-gray-900 font-bold text-lg"><span>Total</span><span>₹{getCartTotal().toFixed(2)}</span></div>
              </div>
              
              <button 
                /* Updated navigate to use ROUTE_MAP.CHECKOUT */
                onClick={() => navigate(ROUTE_MAP.CHECKOUT)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95"
              >
                Checkout Now
              </button>
              
              <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                <ShieldCheck className="w-4 h-4" /> SSL Secure Payment
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}