// Filename: src/pages/shop/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Loader2, LocateFixed, Edit3, Lock } from 'lucide-react';
import { firestoreService } from '../../services/db';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, buyNowItem, clearBuyNow } = useCart();
  const { user, updateUserAddress } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  // Track if order was successful to prevent the useEffect guard from firing
  const [isOrderComplete, setIsOrderComplete] = useState(false);

  const isDirectBuy = !!buyNowItem;
  const displayItems = isDirectBuy ? [buyNowItem] : cartItems;
  const checkoutTotal = isDirectBuy ? buyNowItem.price * buyNowItem.quantity : getCartTotal();

  const [formData, setFormData] = useState({
    firstName: user?.displayName?.split(' ')[0] || '',
    lastName: user?.displayName?.split(' ')[1] || '',
    email: user?.email || '',
    address: user?.address || '',
    city: user?.city || '',
    zip: user?.zip || '',
    country: user?.country || 'India'
  });

  useEffect(() => {
    // If we just finished an order or are currently processing, don't redirect
    if (isOrderComplete || loading) return;

    if (!isDirectBuy && cartItems.length === 0) {
      navigate('/shop', { replace: true });
    }
    
    if (user?.address) {
      setIsLocked(true);
    }
  }, [cartItems, isDirectBuy, navigate, user, isOrderComplete, loading]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.address) {
            setFormData(prev => ({
              ...prev,
              address: data.display_name.split(',').slice(0, 2).join(','),
              city: data.address.city || data.address.town || data.address.village || '',
              zip: data.address.postcode || ''
            }));
            setIsLocked(false);
          }
        } catch (err) {
          console.error("Location error:", err);
          alert("Could not detect precise address. Please enter manually.");
        } finally {
          setGeoLoading(false);
        }
      },
      () => {
        setGeoLoading(false);
        alert("Location permission denied.");
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?.address) {
      try {
        await updateUserAddress({
          address: formData.address,
          city: formData.city,
          zip: formData.zip,
          country: formData.country
        });
      } catch (err) {
        console.warn("Could not auto-sync address to profile", err);
      }
    }

    const orderData = {
      user_email: formData.email,
      user_id: user?.uid || 'guest',
      total: checkoutTotal,
      status: 'Pending',
      items: displayItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      shipping: formData,
      orderType: isDirectBuy ? 'DirectBuy' : 'Cart'
    };

    try {
      await firestoreService.createOrder(orderData);
      
      // Lock the redirect guard before clearing data
      setIsOrderComplete(true);

      if (isDirectBuy) {
        clearBuyNow();
      } else {
        await clearCart();
      }
      
      // Small delay ensures state updates don't clash with navigation
      navigate('/order-success');
    } catch (err) {
      console.error("Order processing failed:", err);
      alert('We could not process your order. Please try again.');
      setLoading(false);
    }
  };

  if (!isOrderComplete && !isDirectBuy && cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Truck className="w-6 h-6 text-indigo-600"/> Shipping Information
              </h2>
              {user?.address && (
                <button 
                  type="button"
                  onClick={() => setIsLocked(!isLocked)}
                  className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                >
                  {isLocked ? <><Edit3 className="w-3 h-3"/> Edit Address</> : <><Lock className="w-3 h-3"/> Lock</>}
                </button>
              )}
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">First Name</label>
                <input
                  required
                  readOnly={isLocked}
                  className={`w-full p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Name</label>
                <input
                  required
                  readOnly={isLocked}
                  className={`w-full p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>

              <div className="col-span-2 space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Address</label>
                  {!isLocked && (
                    <button 
                      type="button" 
                      onClick={handleGetLocation}
                      className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:text-indigo-700"
                    >
                      {geoLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : <LocateFixed className="w-3 h-3"/>}
                      Use GPS Location
                    </button>
                  )}
                </div>
                <input
                  required
                  readOnly={isLocked}
                  placeholder="House No, Street Name"
                  className={`w-full p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">City</label>
                <input
                  required
                  readOnly={isLocked}
                  className={`w-full p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zip Code</label>
                <input
                  required
                  readOnly={isLocked}
                  className={`w-full p-3.5 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold ${isLocked ? 'bg-gray-100 text-gray-500' : 'bg-gray-50'}`}
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

        <div className="lg:sticky lg:top-28 h-fit">
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-indigo-50">
            <h3 className="text-xl font-black mb-6">
              {isDirectBuy ? 'Direct Purchase' : 'Order Summary'}
            </h3>

            <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6">
              {displayItems.map(item => (
                <div key={item.id} className="flex justify-between items-center animate-pop-in">
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
                <span>₹{checkoutTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500 font-bold">
                <span>Shipping</span>
                <span className="text-green-600 font-black">FREE</span>
              </div>
              <div className="flex justify-between text-3xl font-black text-gray-900 mt-6">
                <span>Total</span>
                <span>₹{checkoutTotal.toLocaleString()}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              disabled={loading}
              className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="animate-spin" /> Processing...</> : 'Place Order'}
            </button>

            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Secure Artemon Joy Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}