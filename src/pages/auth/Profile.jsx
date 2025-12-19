// Filename: src/pages/auth/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Package, Clock, LogOut, Edit2, MapPin, Phone, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, login } = useAuth(); // Assuming login or a generic update context method exists, else we update session storage manualy
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form State
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email) {
      fetchOrders();
      setFormData({
        displayName: user.displayName || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/user/${user.email}`);
      const json = await res.json();
      setOrders(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCancelOrder = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'PUT' });
      if (res.ok) {
        alert("Order Cancelled");
        fetchOrders(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.error || "Failed to cancel");
      }
    } catch (err) {
      alert("Network Error");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Profile Updated!");
        setIsEditing(false);
        // Update Session Storage Manually since we don't have a reloadAuth function exposed
        const updatedUser = { ...user, ...data.user };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        window.location.reload(); // Simple reload to reflect changes in Context
      } else {
        alert("Update Failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="p-20 text-center">Please log in.</div>;

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
                        {user.role}
                    </span>
                </div>
                <p className="text-gray-500 font-medium">{user.email}</p>
                
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {user.phone || <span className="text-gray-400 italic">No phone added</span>}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {user.address || <span className="text-gray-400 italic">No address added</span>}
                    </div>
                </div>
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
           
           {/* Decorative bg circle */}
           <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-50 rounded-full opacity-50 pointer-events-none"></div>
        </div>

        {/* Edit Modal */}
        {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-pop-in">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6 text-gray-500"/></button>
                    </div>
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
                            <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Delivery Address</label>
                            <textarea className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none h-24 resize-none"
                                value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Street, City, Zip..." />
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl mt-4">
                            Save Changes
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
          <div className="text-center py-10">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 text-gray-500">
             You haven't placed any orders yet.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              let items = [];
              try { items = JSON.parse(order.items); } catch(e) {}
              
              const canCancel = order.status === 'Pending';
              
              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
                  <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 pb-4 mb-4">
                    <div className="grid grid-cols-2 md:flex md:gap-8 gap-4">
                        <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                        <p className="font-mono font-bold text-gray-800 mt-1">#{order.id}</p>
                        </div>
                        <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date</span>
                        <div className="flex items-center gap-1 text-gray-600 text-sm font-medium mt-1">
                            <Clock className="w-4 h-4" /> {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        </div>
                        <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</span>
                        <p className="font-bold text-indigo-600 text-lg mt-1">₹{order.total.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                         <div className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                            ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {order.status === 'Pending' && <AlertCircle className="w-3 h-3"/>}
                            {order.status}
                        </div>
                        
                        {canCancel && (
                            <button onClick={() => handleCancelOrder(order.id)} className="text-xs text-red-500 hover:text-red-700 font-bold underline">
                                Cancel Order
                            </button>
                        )}
                         {!canCancel && order.status !== 'Cancelled' && (
                             <button className="text-xs text-indigo-600 hover:text-indigo-800 font-bold">
                                 Track Package
                             </button>
                         )}
                    </div>
                  </div>
                  
                  {/* Items Preview */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-3">
                            <span className="bg-white border border-gray-200 w-6 h-6 flex items-center justify-center rounded text-xs font-bold text-gray-500">
                                {item.quantity}
                            </span> 
                            <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">₹{item.price}</span>
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