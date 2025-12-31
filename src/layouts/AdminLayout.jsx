import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { ROUTE_MAP } from '../App';
import { Menu, X } from 'lucide-react'; // Added for mobile toggle
import { AnimatePresence, motion } from 'framer-motion';

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // NEW: State to manage mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Protect Admin Routes
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate(ROUTE_MAP.LOGIN);
    }
  }, [user, navigate]);

  // NEW: Auto-close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  if (!user || user.role !== 'admin') return null;

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === ROUTE_MAP.ADMIN) return 'Dashboard Overview';
    if (path === `${ROUTE_MAP.ADMIN}/subscribers`) return 'Newsletter Community';
    if (path === `${ROUTE_MAP.ADMIN}/moderation-settings`) return 'Moderation Engine Settings';
    
    const lastSegment = path.split('/').pop();
    return lastSegment.replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-x-hidden">
      
      {/* 1. MOBILE SIDEBAR OVERLAY (Framer Motion for smoothness) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[40] md:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-[50] w-72 md:hidden"
            >
              <Sidebar />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 2. DESKTOP SIDEBAR (Static) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 3. MAIN CONTENT WRAPPER */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0">
        {/* Responsive Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-4 md:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            {/* MOBILE TOGGLE BUTTON */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-xl md:hidden text-gray-600 active:scale-90 transition-transform"
            >
              <Menu size={24} />
            </button>
            
            <h2 className="text-sm md:text-lg font-black text-gray-800 capitalize tracking-tight truncate max-w-[150px] sm:max-w-none">
              {getPageTitle()}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none mb-1">{user.displayName}</p>
              <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                {user.role}
              </p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 bg-indigo-50 rounded-xl md:rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-sm shrink-0">
              {user.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Optimized Content Area Spacing */}
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}