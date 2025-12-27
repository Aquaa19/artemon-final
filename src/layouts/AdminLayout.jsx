import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';
import { ROUTE_MAP } from '../App';

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Protect Admin Routes
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate(ROUTE_MAP.LOGIN);
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') return null;

  /**
   * Helper to determine the header title based on current path
   */
  const getPageTitle = () => {
    const path = location.pathname;
    
    // Match against obfuscated Admin routes
    if (path === ROUTE_MAP.ADMIN) return 'Dashboard Overview';
    if (path === `${ROUTE_MAP.ADMIN}/subscribers`) return 'Newsletter Community';
    
    // NEW: Title for the moderation settings page
    if (path === `${ROUTE_MAP.ADMIN}/moderation-settings`) return 'Moderation Engine Settings';
    
    // Fallback: take the last segment and capitalize it
    const lastSegment = path.split('/').pop();
    return lastSegment.replace(/-/g, ' ');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-black text-gray-800 capitalize tracking-tight">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
                {user.role}
              </p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-sm">
              {user.displayName?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}