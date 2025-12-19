// Filename: src/pages/admin/Orders.jsx
import { useEffect, useState } from 'react';
import { ShoppingBag, Loader2, Filter } from 'lucide-react';
import { firestoreService } from '../../services/db'; // Import cloud service

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch orders directly from Firestore collection
      const data = await firestoreService.getAllOrders();
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching cloud orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      // Call the service to update the status in Firestore
      await firestoreService.updateOrderStatus(id, newStatus);
      // Update local state for immediate UI feedback
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert("Failed to update order status in the cloud.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-gray-500 font-medium">Loading Fulfillment Center...</p>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Order Management</h1>
            <p className="text-gray-500 font-medium">Track and fulfill cloud transactions.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Order Details</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
              <th className="p-5 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-20 text-center text-gray-400 font-bold">No orders found in the cloud store.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-5">
                    <p className="font-black text-gray-900 leading-tight">#{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                      {order.createdAt?.toDate 
                        ? order.createdAt.toDate().toLocaleDateString() 
                        : new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-5 font-bold text-gray-600 text-sm">{order.user_email}</td>
                  <td className="p-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-sm">
                        {order.items?.[0]?.name || 'No items'}
                      </span>
                      {order.items?.length > 1 && (
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5">
                          +{order.items.length - 1} more items
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 font-black text-gray-900">₹{order.total?.toLocaleString()}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black border uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-5">
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="bg-gray-50 border border-gray-100 text-gray-900 text-xs font-bold rounded-xl p-2 outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}