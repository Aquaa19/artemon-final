// Filename: src/pages/shop/Checkout.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Loader2 } from 'lucide-react';
import { firestoreService } from '../../services/db';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // FIX: redirect outside render phase
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/shop', { replace: true });
    }
  }, [cartItems, navigate]);

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    country: 'India'
  });

  // Prevent UI flicker during redirect
  if (cartItems.length === 0) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      user_email: formData.email,
      user_id: user?.uid || 'guest',
      total: getCartTotal(),
      status: 'Pending',
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      shipping: formData
    };

    try {
      await firestoreService.createOrder(orderData);
      await clearCart();
      navigate('/order-success');
    } catch (err) {
      console.error("Order processing failed:", err);
      alert('We could not process your order in the cloud. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: FORM */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-600"/> Shipping Information
            </h2>

            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                <input
                  required
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                <input
                  required
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email</label>
                <input
                  required
                  type="email"
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                <input
                  required
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  placeholder="House No, Street Name"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                <input
                  required
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zip Code</label>
                <input
                  required
                  className="w-full p-3.5 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold"
                  value={formData.zip}
                  onChange={e => setFormData({ ...formData, zip: e.target.value })}
                />
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-600"/> Payment Method
            </h2>

            <div className="p-5 border-2 border-indigo-600 bg-indigo-50 rounded-2xl flex items-center justify-between">
              <span className="font-black text-indigo-900">Cash on Delivery (COD)</span>
              <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white"></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xl font-black mb-6">Order Summary</h3>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-black bg-gray-100 w-8 h-8 flex items-center justify-center rounded-xl text-xs text-gray-600">
                      {item.quantity}
                    </span>
                    <span className="text-gray-600 font-bold truncate max-w-[150px]">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-black text-gray-900">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-3">
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Subtotal</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Shipping</span>
                <span className="text-green-600 font-black">FREE</span>
              </div>
              <div className="flex justify-between text-3xl font-black text-gray-900 mt-6">
                <span>Total</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              disabled={loading}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" /> Verifying...</> : 'Place Cloud Order'}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> End-to-End Encrypted Checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
