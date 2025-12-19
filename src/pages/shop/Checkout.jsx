// Filename: src/pages/shop/Checkout.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Truck, CreditCard } from 'lucide-react';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    address: '',
    city: '',
    zip: '',
    country: 'United States'
  });

  if (cartItems.length === 0) {
    navigate('/shop');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const orderData = {
      user_email: formData.email,
      total: getCartTotal(),
      items: cartItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      shipping: formData 
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        clearCart();
        navigate('/order-success');
      } else {
        alert('Order failed! Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT: FORM */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600"/> Shipping Information
            </h2>
            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                <input required className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                <input required className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                <input required type="email" className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Address</label>
                <input required className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Toy Street" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">City</label>
                <input required className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase">Zip Code</label>
                <input required className="w-full p-3 bg-gray-50 rounded-lg border border-gray-200 outline-none focus:border-indigo-500" 
                  value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
              </div>
            </form>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600"/> Payment Method
            </h2>
            <div className="p-4 border-2 border-indigo-600 bg-indigo-50 rounded-xl flex items-center justify-between cursor-pointer">
              <span className="font-bold text-indigo-900">Cash on Delivery (COD)</span>
              <div className="h-4 w-4 rounded-full bg-indigo-600"></div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">More payment options coming soon!</p>
          </div>
        </div>

        {/* RIGHT: SUMMARY */}
        <div>
          <div className="bg-white p-8 rounded-3xl shadow-lg border border-indigo-100 sticky top-28">
            <h3 className="text-xl font-bold mb-6">Order Summary</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 scrollbar-hide">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-bold bg-gray-100 w-6 h-6 flex items-center justify-center rounded-full text-xs text-gray-600">{item.quantity}</span>
                    <span className="text-gray-600 truncate max-w-[150px]">{item.name}</span>
                  </div>
                  {/* CHANGED: $ -> ₹ */}
                  <span className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-2">
              {/* CHANGED: $ -> ₹ */}
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₹{getCartTotal().toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-green-600 font-bold">Free</span></div>
              {/* CHANGED: $ -> ₹ */}
              <div className="flex justify-between text-2xl font-extrabold text-gray-900 mt-4"><span>Total</span><span>₹{getCartTotal().toFixed(2)}</span></div>
            </div>

            <button 
              form="checkout-form"
              disabled={loading}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <div className="mt-4 flex items-center justify-center gap-2 text-gray-400 text-xs">
              <ShieldCheck className="w-4 h-4" /> Secure Checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}