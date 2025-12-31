// Filename: src/pages/shop/Cart.jsx
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, UserCircle, Loader } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ROUTE_MAP } from '../../App';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cartLoading) {
      return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 bg-gray-50 pt-20">
            <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-black uppercase text-xs tracking-widest">Syncing your cart...</p>
        </div>
      );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6 bg-gray-50 pt-20">
        <div className="bg-white p-8 rounded-full shadow-sm mb-6 animate-in zoom-in-95 duration-500">
          <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-indigo-200" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 max-w-sm text-sm md:text-lg font-medium">
          Looks like you haven't found the perfect toy yet. Let's fix that!
        </p>
        <Link 
          to={ROUTE_MAP.SHOP} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-24 md:pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-400 text-sm font-bold mt-1">{cartItems.length} items in your bag</p>
        </div>

        {!user && (
          <div className="bg-amber-50 border border-amber-100 p-4 mb-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex gap-3 items-center">
              <UserCircle className="w-5 h-5 text-amber-500" />
              <p className="text-xs md:text-sm text-amber-800 font-bold">Sign in to save your cart permanently across devices.</p>
            </div>
            <Link to={ROUTE_MAP.LOGIN} className="w-full sm:w-auto text-center text-xs bg-white text-amber-600 px-6 py-2 rounded-xl font-black uppercase tracking-tighter shadow-sm hover:bg-amber-100 transition">Sign In</Link>
          </div>
        )}

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">
          
          {/* Item List - Optimized for Mobile Tapping */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => {
               if(!item) return null;
               const price = parseFloat(item.price) || 0;
               return (
                <div key={item.id} className="bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-gray-100 flex gap-4 md:gap-6 items-center">
                  <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                    <img
                        src={item.image || "https://placehold.co/100x100"}
                        className="w-full h-full object-contain p-2"
                        alt={item.name}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm md:text-lg font-black text-gray-900 truncate pr-2">{item.name}</h3>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 active:bg-red-50 rounded-xl transition">
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                    <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">{item.category}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center bg-gray-100 rounded-xl border border-gray-200 p-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1.5 md:p-2 hover:text-indigo-600 disabled:opacity-20 active:scale-75 transition-transform"><Minus className="w-3.5 h-3.5"/></button>
                            <span className="w-6 md:w-8 text-center font-black text-xs md:text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 md:p-2 hover:text-indigo-600 active:scale-75 transition-transform"><Plus className="w-3.5 h-3.5"/></button>
                        </div>
                        <p className="font-black text-sm md:text-lg text-gray-900">₹{(price * (item.quantity || 1)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
               );
            })}
          </div>

          {/* Summary - Sticky on Desktop, Floating Card on Mobile */}
          <div className="lg:col-span-4 mt-10 lg:mt-0">
            <div className="bg-white rounded-[2.5rem] shadow-xl md:shadow-sm border border-gray-100 p-6 md:p-8 sticky top-28">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                Order Summary
              </h2>
              <div className="space-y-4 mb-8 border-b border-gray-100 pb-8">
                <div className="flex justify-between text-gray-500 font-bold text-sm"><span>Subtotal</span><span>₹{getCartTotal().toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-500 font-bold text-sm"><span>Shipping</span><span className="text-green-500 font-black uppercase text-[10px] tracking-widest bg-green-50 px-2 py-0.5 rounded">Free</span></div>
                <div className="flex justify-between text-gray-900 font-black text-lg pt-4 border-t border-gray-50"><span>Total</span><span>₹{getCartTotal().toLocaleString()}</span></div>
              </div>
              
              <button 
                onClick={() => navigate(ROUTE_MAP.CHECKOUT)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                Checkout Now <ArrowRight size={16} />
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-tighter">
                <ShieldCheck className="w-4 h-4 text-green-500" /> 256-Bit SSL Secure Checkout
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}