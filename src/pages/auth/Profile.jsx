// Filename: src/pages/auth/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Package, Clock, LogOut, Edit2, MapPin, X, 
  Loader2, Save, Globe, Cake, Star, ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ROUTE_MAP } from '../../App';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, logout, updateUserAddress } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  const [formData, setFormData] = useState({ 
    displayName: '', 
    address: '',
    city: '',
    zip: '',
    country: 'India',
    birthday: '' 
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
      setFormData({
        displayName: user.displayName || '',
        address: user.address || '',
        city: user.city || '',
        zip: user.zip || '',
        country: user.country || 'India',
        birthday: user.birthday || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef, 
        where("user_id", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      setOrders(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    try {
      let birthdayData = {};
      if (formData.birthday) {
        const [year, month, day] = formData.birthday.split('-').map(Number);
        birthdayData = {
          birthday: formData.birthday,
          childBirthdayMonth: month,
          childBirthdayDay: day
        };
      }

      await updateUserAddress({
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
        country: formData.country,
        ...birthdayData
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate(ROUTE_MAP.LOGIN);
  };

  if (!user) return <div className="p-20 text-center font-bold">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 md:pt-28 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* User Profile Header */}
        <div className="bg-white rounded-[2rem] md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
            <Star className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 text-indigo-50 opacity-50 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 text-center md:text-left">
               <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl md:text-4xl font-black border-4 border-white shadow-sm overflow-hidden shrink-0">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-full h-full object-cover animate-fade-in" referrerPolicy="no-referrer" />
                 ) : (
                    user.displayName?.charAt(0).toUpperCase() || <User />
                 )}
               </div>
               
               <div className="flex-1 space-y-2">
                 <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                     <h1 className="text-2xl md:text-3xl font-black text-gray-900">{user.displayName || 'Joyful Explorer'}</h1>
                     <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-100">
                         {user.role || 'Customer'}
                     </span>
                 </div>
                 <p className="text-gray-400 font-bold text-sm">{user.email}</p>
                 
                 <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                   {user.address && (
                     <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-tighter">
                       <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {user.city}, {user.zip}
                     </div>
                   )}
                   {user.birthday && (
                     <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-pink-400 font-black uppercase tracking-tighter">
                       <Cake className="w-3.5 h-3.5" /> {user.birthday}
                     </div>
                   )}
                 </div>
               </div>

               <div className="flex flex-col gap-2 w-full md:w-auto min-w-[180px]">
                   <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-lg shadow-indigo-100 active:scale-95">
                     <Edit2 className="w-4 h-4" /> Edit Profile
                   </button>
                   <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition border border-transparent hover:border-red-100 active:scale-95">
                     <LogOut className="w-4 h-4" /> Sign Out
                   </button>
               </div>
            </div>
        </div>

        {/* Profile Edit Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4"
            >
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-lg p-8 md:p-10 shadow-2xl relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-gray-900">Update Profile</h2>
                  <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:bg-gray-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Cake size={14} /> Child's Birthday
                    </h3>
                    <div className="relative">
                        <Cake className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="date" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 text-sm"
                        value={formData.birthday} onChange={e => setFormData({...formData, birthday: e.target.value})} />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold ml-1 italic">We'll send a magical surprise 7 days before the big day! 🚀</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
                      <MapPin size={14} /> Delivery Address
                    </h3>
                    <div className="space-y-4">
                      <input required placeholder="Street Address" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 text-sm"
                        value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                      <div className="grid grid-cols-2 gap-4">
                        <input required placeholder="City" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 text-sm"
                          value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                        <input required placeholder="Zip Code" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 text-sm"
                          value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                      </div>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input required placeholder="Country" className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 text-sm"
                          value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <button disabled={updateLoading} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95">
                    {updateLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update My Info</>}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order History Section */}
        <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" /> Order History
        </h2>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="animate-spin text-indigo-200" size={40} />
            <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest">Retrieving Orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
              <Package className="mx-auto w-12 h-12 text-gray-100 mb-4" />
              <p className="text-gray-400 font-bold">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => {
              const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
              
              return (
                <div key={order.id} className="bg-white rounded-3xl p-5 md:p-8 shadow-sm border border-gray-100 group transition-all hover:shadow-md">
                  <div className="flex flex-col gap-6">
                    {/* Header: ID and Status */}
                    <div className="flex justify-between items-start border-b border-gray-50 pb-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Order Receipt</span>
                            <p className="font-mono font-bold text-gray-800 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                            ${order.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                            order.status === 'Delivered' ? 'bg-green-50 text-green-600' : 
                            'bg-blue-50 text-blue-600'}`}>
                            {order.status}
                        </div>
                    </div>

                    {/* Metadata: Date and Total */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400"><Clock size={16}/></div>
                            <div>
                                <p className="text-[9px] font-black text-gray-300 uppercase">Placed On</p>
                                <p className="text-xs md:text-sm font-bold text-gray-700">{date.toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 justify-end md:justify-start">
                            <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-400"><Star size={16}/></div>
                            <div>
                                <p className="text-[9px] font-black text-gray-300 uppercase">Total Amount</p>
                                <p className="text-sm md:text-lg font-black text-indigo-600">₹{order.total?.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Full Item List */}
                    <div className="bg-gray-50/50 rounded-2xl p-4 md:p-6 space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Package Contents</p>
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm">
                                        {item.quantity}x
                                    </div>
                                    <span className="text-gray-700 font-bold truncate max-w-[140px] md:max-w-none">{item.name}</span>
                                </div>
                                <span className="font-black text-gray-900 text-xs md:text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>

                    {/* Footer Action */}
                    <div className="flex justify-between items-center pt-2">
                         <div className="flex items-center gap-2 text-gray-400">
                             <Package size={14} />
                             <span className="text-[10px] font-bold uppercase tracking-tighter">Standard Delivery</span>
                         </div>
                        <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 hover:translate-x-1 transition-transform">
                            Full Details <ChevronRight size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}