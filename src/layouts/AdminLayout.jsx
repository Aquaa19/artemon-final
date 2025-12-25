// Filename: src/layouts/AdminLayout.jsx
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import Sidebar from '../components/layout/Sidebar';

export default function AdminLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Protect Admin Routes
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // Prevent render if not admin
  if (!user || user.role !== 'admin') return null;

  /**
   * Helper to determine the header title based on current path
   */
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/admin') return 'Dashboard Overview';
    if (path === '/admin/subscribers') return 'Newsletter Community';
    return path.split('/').pop();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-8 sticky top-0 z-10 shadow-sm">
          <h2 className="text-lg font-bold text-gray-700 capitalize">
            {getPageTitle()}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900">{user.displayName}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
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