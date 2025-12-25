// Filename: src/pages/auth/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Package, Clock, LogOut, Edit2, MapPin, Phone, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// FIXED: Corrected the path from '../../firebase/config' to '../../services/firebase'
import { db } from '../../services/firebase'; 
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function Profile() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ displayName: '', phone: '', address: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      fetchOrders();
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        address: user.address || ''
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
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setOrders(ordersData);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
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
               </div>

               <div className="flex flex-col gap-2 min-w-[140px]">
                   <button onClick={() => setIsEditing(true)} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-gray-200">
                     <Edit2 className="w-4 h-4" /> Edit Profile
                   </button>
                   <button onClick={handleLogout} className="flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl font-bold text-sm transition border border-transparent hover:border-red-100">
                     <LogOut className="w-4 h-4" /> Sign Out
                   </button>
               </div>
            </div>
        </div>

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