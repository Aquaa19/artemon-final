// Filename: src/pages/auth/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Package, Clock, LogOut, Edit2, MapPin, X, 
  Loader2, Save, Globe, Cake, Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Profile() {
  const { user, logout, updateUserAddress } = useAuth(); 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Updated formData to include birthday fields
  const [formData, setFormData] = useState({ 
    displayName: '', 
    address: '',
    city: '',
    zip: '',
    country: 'India',
    birthday: '' // Format: YYYY-MM-DD
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
      // Process birthday for optimized Cloud Function querying
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
    navigate('/login');
  };

  if (!user) return <div className="p-20 text-center font-bold">Please log in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* User Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
            {/* Background Decorative Sparkle */}
            <Star className="absolute -top-10 -right-10 w-40 h-40 text-indigo-50 opacity-50" />
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
               <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-4xl font-bold border-4 border-white shadow-sm">
                 {user.displayName?.charAt(0).toUpperCase() || <User />}
               </div>
               
               <div className="flex-1 space-y-1">
                 <div className="flex items-center gap-3">
                     <h1 className="text-3xl font-extrabold text-gray-900">{user.displayName}</h1>
                     <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border border-indigo-100">
                         {user.role || 'Customer'}
                     </span>
                 </div>
                 <p className="text-gray-500 font-medium">{user.email}</p>
                 
                 <div className="flex flex-wrap gap-4 pt-2">
                   {user.address && (
                     <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                       <MapPin className="w-3.5 h-3.5" /> {user.city}, {user.zip}
                     </div>
                   )}
                   {user.birthday && (
                     <div className="flex items-center gap-1.5 text-xs text-pink-400 font-bold">
                       <Cake className="w-3.5 h-3.5" /> Birthday: {user.birthday}
                     </div>
                   )}
                 </div>
               </div>

               <div className="flex flex-col gap-2 min-w-[160px]">
                   <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-100">
                     <Edit2 className="w-4 h-4" /> Edit Profile
                   </button>
                   <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition border border-transparent hover:border-red-100">
                     <LogOut className="w-4 h-4" /> Sign Out
                   </button>
               </div>
            </div>
        </div>

        {/* Unified Profile Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl scale-100 animate-pop-in relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 relative z-10">
                <h2 className="text-2xl font-black text-gray-900">Update Profile</h2>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-6 relative z-10">
                {/* Personal Section */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <Cake className="w-3 h-3" /> Child's Birthday
                  </h3>
                  <div className="relative">
                    <Cake className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="date"
                      className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                      value={formData.birthday} 
                      onChange={e => setFormData({...formData, birthday: e.target.value})} 
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold ml-1 italic">We'll send a magical surprise 7 days before the big day! 🚀</p>
                </div>

                {/* Address Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <input required placeholder="Street Address" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                      value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <input required placeholder="City" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                        value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                      <input required placeholder="Zip Code" className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                        value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input required placeholder="Country" className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                        value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                    </div>
                  </div>
                </div>

                <button disabled={updateLoading} type="submit" className="w-full bg-gray-900 hover:bg-black text-white font-black py-5 rounded-[1.5rem] shadow-2xl transition-all flex items-center justify-center gap-3 mt-6">
                  {updateLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <><Save className="w-5 h-5" /> Update My Info</>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Order History */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600" /> Order History
        </h2>

        {loading ? (
          <div className="text-center py-10 font-bold text-gray-400">Loading your orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 text-gray-500 font-bold">
              You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const items = order.items || [];
              const date = order.createdAt?.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
              
              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-4 mb-4">
                    <div className="grid grid-cols-2 md:flex md:gap-8 gap-4">
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                          <p className="font-mono font-bold text-gray-800 mt-1 text-sm">#{order.id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                          <div className="flex items-center gap-1 text-gray-600 text-sm font-bold mt-1">
                              <Clock className="w-4 h-4" /> {date.toLocaleDateString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                          <p className="font-black text-indigo-600 text-lg mt-1">₹{order.total?.toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                         <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                            'bg-blue-100 text-blue-700'}`}>
                            {order.status}
                        </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <span className="bg-white border border-gray-200 w-6 h-6 flex items-center justify-center rounded text-[10px] font-black text-gray-500">
                                {item.quantity}
                            </span> 
                            <span className="text-gray-700 font-bold">{item.name}</span>
                        </div>
                        <span className="font-black text-gray-900">₹{item.price?.toLocaleString()}</span>
                      </div>
                    ))}
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