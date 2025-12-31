// Filename: src/pages/shop/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Truck, CreditCard, Loader2, LocateFixed, Edit3, Lock, ChevronRight } from 'lucide-react';
import { firestoreService } from '../../services/db';
import { ROUTE_MAP } from '../../App';

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart, buyNowItem, clearBuyNow } = useCart();
  const { user, updateUserAddress } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
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
    if (isOrderComplete || loading) return;
    if (!isDirectBuy && cartItems.length === 0) {
      navigate(ROUTE_MAP.SHOP, { replace: true });
    }
    if (user?.address) setIsLocked(true);
  }, [cartItems, isDirectBuy, navigate, user, isOrderComplete, loading]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported.");
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
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
        } catch (err) { alert("Could not detect address. Enter manually."); }
        finally { setGeoLoading(false); }
      },
      () => { setGeoLoading(false); alert("Permission denied."); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!user?.address) {
      try {
        await updateUserAddress({
          address: formData.address, city: formData.city,
          zip: formData.zip, country: formData.country
        });
      } catch (err) { console.warn("Sync failed", err); }
    }
    const orderData = {
      user_email: formData.email, user_id: user?.uid || 'guest',
      total: checkoutTotal, status: 'Pending',
      items: displayItems.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
      shipping: formData, orderType: isDirectBuy ? 'DirectBuy' : 'Cart'
    };
    try {
      await firestoreService.createOrder(orderData);
      setIsOrderComplete(true);
      if (isDirectBuy) clearBuyNow(); else await clearCart();
      navigate(ROUTE_MAP.SUCCESS);
    } catch (err) {
      alert('Order processing failed.');
      setLoading(false);
    }
  };

  if (!isOrderComplete && !isDirectBuy && cartItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8 md:mb-10 overflow-x-auto no-scrollbar whitespace-nowrap py-1">
            <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Cart</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-900">Checkout</span>
            <ChevronRight size={14} className="text-gray-300" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-300">Success</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <div className="space-y-6 md:space-y-8">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg md:text-xl font-black flex items-center gap-2 text-gray-900">
                  <Truck className="w-5 h-5 md:w-6 md:h-6 text-indigo-600"/> Shipping Details
                </h2>
                {user?.address && (
                  <button type="button" onClick={() => setIsLocked(!isLocked)} className="text-[10px] md:text-xs font-black text-indigo-600 flex items-center gap-1.5 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-tighter">
                    {isLocked ? <><Edit3 size={12}/> Edit</> : <><Lock size={12}/> Save</>}
                  </button>
                )}
              </div>

              <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input required readOnly={isLocked} className={`w-full p-3.5 md:p-4 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold text-sm ${isLocked ? 'bg-gray-50 text-gray-400' : 'bg-gray-50/50'}`} value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input required readOnly={isLocked} className={`w-full p-3.5 md:p-4 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold text-sm ${isLocked ? 'bg-gray-50 text-gray-400' : 'bg-gray-50/50'}`} value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Street Address</label>
                    {!isLocked && (
                      <button type="button" onClick={handleGetLocation} className="text-[9px] md:text-[10px] font-black text-indigo-600 flex items-center gap-1 uppercase tracking-tighter bg-indigo-50 px-2 py-1 rounded-lg">
                        {geoLoading ? <Loader2 size={10} className="animate-spin"/> : <LocateFixed size={10}/>} Use GPS
                      </button>
                    )}
                  </div>
                  <input required readOnly={isLocked} placeholder="Apartment, street name, etc." className={`w-full p-3.5 md:p-4 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold text-sm ${isLocked ? 'bg-gray-50 text-gray-400' : 'bg-gray-50/50'}`} value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City</label>
                  <input required readOnly={isLocked} className={`w-full p-3.5 md:p-4 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold text-sm ${isLocked ? 'bg-gray-50 text-gray-400' : 'bg-gray-50/50'}`} value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Zip Code</label>
                  <input required readOnly={isLocked} className={`w-full p-3.5 md:p-4 rounded-2xl border border-gray-100 outline-none focus:border-indigo-500 font-bold text-sm ${isLocked ? 'bg-gray-50 text-gray-400' : 'bg-gray-50/50'}`} value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                </div>
              </form>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-lg md:text-xl font-black mb-6 flex items-center gap-2 text-gray-900">
                <CreditCard className="w-5 h-5 md:w-6 md:h-6 text-indigo-600"/> Payment
              </h2>
              <div className="p-4 md:p-5 border-2 border-indigo-600 bg-indigo-50/50 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full border-4 border-indigo-600 bg-white"></div>
                    <span className="font-black text-sm md:text-base text-indigo-900">Cash on Delivery</span>
                </div>
                <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Primary</span>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-28 h-fit">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-xl md:shadow-sm border border-indigo-50">
              <h3 className="text-lg md:text-xl font-black mb-6 flex items-center justify-between">
                {isDirectBuy ? 'Item Summary' : 'Review Order'}
                <span className="text-[10px] font-black bg-gray-100 px-3 py-1 rounded-full text-gray-500">{displayItems.length} Items</span>
              </h3>

              <div className="space-y-4 max-h-52 overflow-y-auto pr-2 mb-8 custom-scrollbar">
                {displayItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center animate-in fade-in slide-in-from-right-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black bg-indigo-50 w-7 h-7 flex items-center justify-center rounded-lg text-[10px] text-indigo-600">
                        {item.quantity}x
                      </span>
                      <span className="text-gray-600 font-bold text-xs md:text-sm truncate max-w-[120px] md:max-w-[180px]">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-black text-xs md:text-sm text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between text-gray-500 font-bold text-xs md:text-sm">
                  <span>Subtotal</span>
                  <span>₹{checkoutTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500 font-bold text-xs md:text-sm">
                  <span>Standard Shipping</span>
                  <span className="text-green-600 font-black uppercase text-[10px]">Free</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="font-black text-gray-900 text-sm md:text-base">Grand Total</span>
                  <span className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tighter">
                    ₹{checkoutTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                form="checkout-form"
                disabled={loading}
                className="w-full mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2 uppercase text-xs tracking-widest"
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /> Finalizing...</> : 'Confirm Order'}
              </button>

              <div className="mt-6 flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-gray-400 text-[9px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} className="text-green-500" /> Secure Encryption Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}