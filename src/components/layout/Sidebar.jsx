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
  Mail,
  ShieldCheck,
  Sparkles,
  X // Added for mobile close button
} from 'lucide-react';
import { ROUTE_MAP } from '../../App';

// NEW: Accept an optional onClose prop for mobile responsiveness
export default function Sidebar({ onClose }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(ROUTE_MAP.LOGIN);
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: ROUTE_MAP.ADMIN },
    { 
      icon: Sparkles, 
      label: 'AI Console', 
      path: `${ROUTE_MAP.ADMIN}/ai-console`,
      isNew: true 
    },
    { icon: Package, label: 'Inventory', path: `${ROUTE_MAP.ADMIN}/inventory` },
    { icon: ShoppingBag, label: 'Orders', path: `${ROUTE_MAP.ADMIN}/orders` },
    { icon: MessageSquare, label: 'Reviews', path: `${ROUTE_MAP.ADMIN}/reviews` },
    { icon: ShieldCheck, label: 'Moderation AI', path: `${ROUTE_MAP.ADMIN}/moderation-settings` },
    { icon: Users, label: 'Customers', path: `${ROUTE_MAP.ADMIN}/users` },
    { icon: Mail, label: 'Subscribers', path: `${ROUTE_MAP.ADMIN}/subscribers` },
  ];

  return (
    /* FIXED: Removed 'hidden' class to allow AdminLayout to control visibility */
    <aside className="w-full md:w-64 bg-white border-r border-gray-200 h-full flex flex-col shadow-xl md:shadow-none">
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img src="/artemon_joy_logo.png" alt="Logo" className="w-8 h-8 rounded-full border border-gray-200" />
            <span className="font-extrabold text-xl text-gray-800 tracking-tight">Artemon Admin</span>
          </div>

          {/* MOBILE ONLY: Close button */}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 md:hidden text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
            >
              <X size={20} />
            </button>
          )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-5 h-5 ${item.isNew && !isActive ? 'text-indigo-500 animate-pulse' : ''}`} />
                {item.label}
              </div>
              {item.isNew && !isActive && (
                <span className="bg-indigo-100 text-indigo-600 text-[10px] px-1.5 py-0.5 rounded-full uppercase font-black">
                  Live
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 mt-auto">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 w-full transition-colors active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}