// Filename: src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, Heart, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFooterOverlap, setIsFooterOverlap] = useState(false);

  const { user, logout } = useAuth();
  const { getCartCount, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isSearchPage = location.pathname === '/search';
  const showWhiteNav = scrolled;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const footer = document.querySelector('footer');
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < 70) setIsFooterOverlap(true);
        else setIsFooterOverlap(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setScrolled(window.scrollY > 20);
    setIsFooterOverlap(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const textColor =
    isFooterOverlap || !showWhiteNav
      ? 'text-white drop-shadow-sm'
      : 'text-gray-900';
  const brandColor =
    isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-primary';
  const hoverColor = showWhiteNav
    ? 'hover:text-primary'
    : 'hover:text-white/80';
  const iconColor =
    isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-gray-600';

  const searchBg =
    showWhiteNav && !isFooterOverlap
      ? 'bg-gray-100 border-transparent hover:bg-white'
      : 'bg-white/20 text-white border-transparent hover:bg-white/30';

  return (
    <nav
      className={`fixed w-full top-0 z-50 transition-all duration-500 
      ${
        showWhiteNav
          ? 'glass-prism py-2' 
          : `${isHome ? 'bg-transparent' : 'bg-primary'} py-5`
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/artemon_joy_logo.webp"
                alt="Artemon Joy"
                className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
            <span
              className={`font-bold text-lg sm:text-xl tracking-tight transition-colors ${textColor}`}
            >
              Artemon <span className={brandColor}>Joy</span>
            </span>
          </Link>

          <div className="hidden lg:flex space-x-6 lg:space-x-8 items-center">
            {[
              { label: 'Home', path: '/' },
              { label: 'Shop', path: '/shop' },
              { label: 'Trending', path: '/trending' },
              { label: 'New Arrivals', path: '/new-arrivals' }
            ].map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`text-sm font-medium transition-colors relative group ${
                    isActive
                      ? 'text-secondary font-extrabold'
                      : `${textColor} ${hoverColor}`
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                      isActive ? 'w-0' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          <div
            className={`hidden md:block flex-1 max-w-xs mx-4 ${
              isSearchPage ? 'invisible' : ''
            }`}
          >
            {/* ADDED TOUR TARGET CLASS */}
            <div
              onClick={() => navigate('/search')}
              className={`relative rounded-full transition-all border cursor-text group tour-target-search ${searchBg}`}
            >
              <div
                className={`w-full pl-4 pr-10 py-1.5 rounded-full text-sm select-none ${
                  isFooterOverlap || !showWhiteNav
                    ? 'text-white/70'
                    : 'text-gray-500'
                }`}
              >
                Search toys...
              </div>
              <div className="absolute right-2 top-1.5 p-0.5">
                <Search
                  className={`w-4 h-4 ${
                    isFooterOverlap || !showWhiteNav
                      ? 'text-white'
                      : 'text-gray-500'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* ADDED TOUR TARGET CLASS */}
            <Link
              to="/favorites"
              className={`p-2 rounded-full transition-all relative group tour-target-favorites ${iconColor} hover:bg-black/5`}
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link
              to="/cart"
              id="cart-icon" 
              className={`p-2 rounded-full transition-all relative group ${iconColor} hover:bg-black/5`}
            >
              <motion.div
                whileTap={{ scale: 0.8 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ShoppingCart className="h-5 w-5" />
                <AnimatePresence mode="popLayout">
                  {getCartCount() > 0 && (
                    <motion.span
                      key={`cart-badge-${getCartCount()}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                      className="absolute top-0 right-0 h-4 w-4 bg-secondary text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-md"
                    >
                      {getCartCount()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>

            {user ? (
              <div
                className={`flex items-center gap-2 pl-2 border-l ${
                  showWhiteNav && !isFooterOverlap
                    ? 'border-gray-200'
                    : 'border-white/30'
                }`}
              >
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`text-sm font-bold hover:underline mr-2 ${textColor}`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  className={`text-sm font-medium hover:underline ${textColor}`}
                >
                  {user.displayName?.split(' ')[0] || 'Account'}
                </Link>
                <button
                  onClick={handleLogout}
                  className={`p-2 rounded-full hover:text-red-500 transition-colors ${iconColor}`}
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`ml-2 font-semibold px-5 py-2 rounded-full text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 ${
                  showWhiteNav && !isFooterOverlap
                    ? 'bg-primary text-white'
                    : 'bg-white text-primary'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            {!isSearchPage && (
              <Link to="/search" className={`p-1 rounded-full ${iconColor}`}>
                <Search className="h-6 w-6" />
              </Link>
            )}

            <Link to="/favorites" className={`relative ${iconColor}`}>
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" id="cart-icon-mobile" className={`relative ${iconColor}`}>
              <ShoppingCart className="h-6 w-6" />
              <AnimatePresence mode="popLayout">
                {getCartCount() > 0 && (
                  <motion.span
                    key={`cart-badge-mobile-${getCartCount()}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-0 right-0 h-4 w-4 bg-secondary text-[10px] font-bold text-white flex items-center justify-center rounded-full"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-1 rounded-md focus:outline-none ${iconColor}`}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 absolute w-full transition-all duration-300 ease-in-out ${
          isOpen
            ? 'max-h-[30rem] opacity-100 shadow-xl'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          <Link className="block px-3 py-2 rounded-lg text-gray-900" to="/">
            Home
          </Link>
          <Link className="block px-3 py-2 rounded-lg text-gray-900" to="/shop">
            Shop
          </Link>
          <Link
            className="block px-3 py-2 rounded-lg text-gray-900"
            to="/trending"
          >
            Trending
          </Link>
          <Link
            className="block px-3 py-2 rounded-lg text-gray-900"
            to="/new-arrivals"
          >
            New Arrivals
          </Link>
          <Link
            className="block px-3 py-2 rounded-lg text-gray-900"
            to="/favorites"
          >
            Favorites ({wishlist.length})
          </Link>

          <div className="border-t border-gray-100 pt-2">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="block px-3 py-2 font-bold text-primary"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-gray-600"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-500"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block text-center px-3 py-3 rounded-lg font-bold bg-primary text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}