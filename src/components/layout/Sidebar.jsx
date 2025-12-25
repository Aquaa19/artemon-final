// Filename: src/components/layout/Sidebar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  LogOut, 
  MessageSquare,
  Mail // Added for Subscribers
} from 'lucide-react';

export default function Sidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/admin' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: ShoppingBag, label: 'Orders', path: '/admin/orders' },
    { icon: MessageSquare, label: 'Reviews', path: '/admin/reviews' },
    { icon: Users, label: 'Customers', path: '/admin/users' },
    // NEW: Newsletter Subscriber Link
    { icon: Mail, label: 'Subscribers', path: '/admin/subscribers' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-20 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <img src="/artemon_joy_logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-gray-200" />
          <span className="font-extrabold text-xl text-gray-800 tracking-tight">Artemon Admin</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}