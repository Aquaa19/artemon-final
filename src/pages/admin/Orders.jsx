// Filename: src/pages/admin/Orders.jsx
import { useEffect, useState } from 'react';
import { ShoppingBag, Truck, CheckCircle, Clock, Search } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const json = await res.json();
      setOrders(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Shipped': return 'bg-blue-100 text-blue-700';
      case 'Delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Orders...</div>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
          <p className="text-gray-500">Track and manage customer orders.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Items</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Total</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-10 text-center text-gray-400">No orders found.</td>
              </tr>
            ) : (
              orders.map(order => {
                let items = [];
                try { items = JSON.parse(order.items); } catch(e) {}
                
                return (
                  <tr key={order.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-mono text-sm font-bold text-gray-600">#{order.id}</td>
                    <td className="p-4 font-medium text-gray-900">{order.user_email}</td>
                    <td className="p-4 text-sm text-gray-500">
                      {items.length > 0 ? (
                        <div className="flex flex-col">
                          <span>{items[0].name}</span>
                          {items.length > 1 && <span className="text-xs text-gray-400">+{items.length - 1} more</span>}
                        </div>
                      ) : 'No items'}
                    </td>
                    {/* CHANGED: $ -> ₹ */}
                    <td className="p-4 font-bold text-gray-900">₹{order.total}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}