// Filename: src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { TrendingUp, Package, DollarSign, Users, ShoppingBag, Loader2 } from 'lucide-react';
import { firestoreService } from '../../services/db';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: [], users: [], orders: [] });
  const [loading, setLoading] = useState(true);
  
  // Tooltip States
  const [activeUserPoint, setActiveUserPoint] = useState(null);
  const [activeOrderPoint, setActiveOrderPoint] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [products, users, orders] = await Promise.all([
          firestoreService.getProducts(),
          firestoreService.getAllUsers(),
          firestoreService.getAllOrders()
        ]);
        setStats({ products, users, orders });
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const getChartData = (dataList) => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const count = dataList.filter(item => {
        const createdAt = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt);
        return createdAt.toISOString().split('T')[0] === date;
      }).length;
      return { date, count };
    });
  };

  const userChart = getChartData(stats.users);
  const orderChart = getChartData(stats.orders);
  const maxCount = Math.max(...userChart.map(d => d.count), ...orderChart.map(d => d.count), 5);

  const getLinePath = (data) => {
    return data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 40 - (d.count / maxCount) * 40;
      return `${x},${y}`;
    }).join(' ');
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
       <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
       <p className="text-gray-500 font-medium">Fetching Cloud Intelligence...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-black text-gray-900">Cloud Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Package className="w-6 h-6"/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Products</p><p className="text-2xl font-black text-gray-800">{stats.products.length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl"><TrendingUp className="w-6 h-6"/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trending Items</p><p className="text-2xl font-black text-gray-800">{stats.products.filter(p => p.isTrending).length}</p></div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><DollarSign className="w-6 h-6"/></div>
          <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg Price</p><p className="text-2xl font-black text-gray-800">₹{(stats.products.reduce((acc, p) => acc + p.price, 0) / (stats.products.length || 1)).toFixed(0)}</p></div>
        </div>
      </div>

      {/* SVG Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Signups Line Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-900">User Signups</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Activity: Last 7 Days</p>
            </div>
            <div className="px-3 py-1 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase">Growth</div>
          </div>
          
          <div className="relative h-40 w-full px-2">
            {/* Tooltip Popup */}
            {activeUserPoint !== null && (
              <div 
                className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-[10px] font-bold pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-200"
                style={{ 
                  left: `${(activeUserPoint / 6) * 100}%`, 
                  top: `${40 - (userChart[activeUserPoint].count / maxCount) * 40}%` 
                }}
              >
                {userChart[activeUserPoint].count} Users
              </div>
            )}

            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="purpleGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="white" />
                </linearGradient>
              </defs>
              <path d={`M 0 40 L ${getLinePath(userChart)} L 100 40 Z`} fill="url(#purpleGradient)" className="opacity-20" />
              <polyline fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={getLinePath(userChart)} />
              
              {/* Interaction Dots */}
              {userChart.map((d, i) => (
                <circle 
                  key={i}
                  cx={(i / 6) * 100}
                  cy={40 - (d.count / maxCount) * 40}
                  r={activeUserPoint === i ? "2" : "0"}
                  fill="#818cf8"
                  className="transition-all duration-200"
                />
              ))}

              {/* Invisible Hover Zones */}
              {userChart.map((_, i) => (
                <rect
                  key={i}
                  x={(i / 6) * 100 - 5}
                  y="0"
                  width="10"
                  height="40"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveUserPoint(i)}
                  onMouseLeave={() => setActiveUserPoint(null)}
                />
              ))}
            </svg>
            
            <div className="flex justify-between mt-4">
              {userChart.map((d, i) => (
                <span key={i} className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Order Volume Line Chart */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-gray-900">Order Volume</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Sales: Last 7 Days</p>
            </div>
            <div className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase">Revenue</div>
          </div>

          <div className="relative h-40 w-full px-2">
            {/* Tooltip Popup */}
            {activeOrderPoint !== null && (
              <div 
                className="absolute z-10 bg-indigo-600 text-white px-2 py-1 rounded text-[10px] font-bold pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 transition-all duration-200"
                style={{ 
                  left: `${(activeOrderPoint / 6) * 100}%`, 
                  top: `${40 - (orderChart[activeOrderPoint].count / maxCount) * 40}%` 
                }}
              >
                {orderChart[activeOrderPoint].count} Orders
              </div>
            )}

            <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="indigoGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="white" />
                </linearGradient>
              </defs>
              <path d={`M 0 40 L ${getLinePath(orderChart)} L 100 40 Z`} fill="url(#indigoGradient)" className="opacity-20" />
              <polyline fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={getLinePath(orderChart)} />
              
              {/* Interaction Dots */}
              {orderChart.map((d, i) => (
                <circle 
                  key={i}
                  cx={(i / 6) * 100}
                  cy={40 - (d.count / maxCount) * 40}
                  r={activeOrderPoint === i ? "2" : "0"}
                  fill="#4f46e5"
                  className="transition-all duration-200"
                />
              ))}

              {/* Invisible Hover Zones */}
              {orderChart.map((_, i) => (
                <rect
                  key={i}
                  x={(i / 6) * 100 - 5}
                  y="0"
                  width="10"
                  height="40"
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setActiveOrderPoint(i)}
                  onMouseLeave={() => setActiveOrderPoint(null)}
                />
              ))}
            </svg>

            <div className="flex justify-between mt-4">
              {orderChart.map((d, i) => (
                <span key={i} className="text-[8px] font-black text-gray-300 uppercase tracking-tighter">
                  {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}