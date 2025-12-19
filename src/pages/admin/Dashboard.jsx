// Filename: src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users, ShoppingBag } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: [],
    users: [],
    orders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [pRes, uRes, oRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/users'),
          fetch('/api/orders')
        ]);

        const pData = await pRes.json();
        const uData = await uRes.json();
        const oData = await oRes.json();

        setStats({
          products: pData.data || [],
          users: uData.data || [],
          orders: oData.data || []
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // --- Helper to Generate Chart Data (Last 7 Days) ---
  const getChartData = (dataList) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    return last7Days.map(date => {
      const count = dataList.filter(item => {
        // Handle SQLite date format (YYYY-MM-DD HH:MM:SS)
        const itemDate = new Date(item.createdAt).toISOString().split('T')[0];
        return itemDate === date;
      }).length;
      return { date, count };
    });
  };

  const userChart = getChartData(stats.users);
  const orderChart = getChartData(stats.orders);
  
  // Find max value to normalize bar heights
  const maxCount = Math.max(
    ...userChart.map(d => d.count), 
    ...orderChart.map(d => d.count), 
    5 // Minimum scale
  );

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* Top Stats Row (Products, Trending, Price) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package className="w-6 h-6"/></div>
          <div><p className="text-sm text-gray-500 font-medium">Total Products</p><p className="text-2xl font-bold text-gray-800">{stats.products.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><TrendingUp className="w-6 h-6"/></div>
          <div><p className="text-sm text-gray-500 font-medium">Trending</p><p className="text-2xl font-bold text-gray-800">{stats.products.filter(p => p.isTrending).length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><DollarSign className="w-6 h-6"/></div>
          {/* CHANGED: $ -> ₹ */}
          <div><p className="text-sm text-gray-500 font-medium">Avg Price</p><p className="text-2xl font-bold text-gray-800">₹{(stats.products.reduce((acc, p) => acc + p.price, 0) / (stats.products.length || 1)).toFixed(2)}</p></div>
        </div>
      </div>

      {/* Graph Section: Users & Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* User Growth Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Users</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.users.length}</h3>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Users className="w-6 h-6"/></div>
          </div>
          
          {/* Custom CSS Bar Chart */}
          <div className="h-40 flex items-end justify-between gap-2">
            {userChart.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div 
                  className="w-full bg-purple-100 rounded-t-md relative group-hover:bg-purple-200 transition-all duration-500"
                  style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: '4px' }}
                >
                  {/* Tooltip */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.count} Users
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-3xl font-extrabold text-gray-900">{stats.orders.length}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><ShoppingBag className="w-6 h-6"/></div>
          </div>

          {/* Custom CSS Bar Chart */}
          <div className="h-40 flex items-end justify-between gap-2">
             {orderChart.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                <div 
                  className="w-full bg-indigo-100 rounded-t-md relative group-hover:bg-indigo-200 transition-all duration-500"
                  style={{ height: `${(day.count / maxCount) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {day.count} Orders
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}