// Filename: src/components/layout/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, LogOut, Heart, Search, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ROUTE_MAP } from '../../App';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isFooterOverlap, setIsFooterOverlap] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showCatMenu, setShowCatMenu] = useState(false);

  const { user, logout } = useAuth();
  const { getCartCount, wishlist } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === ROUTE_MAP.HOME;
  const isSearchPage = location.pathname === ROUTE_MAP.SEARCH;
  const showWhiteNav = scrolled;

  useEffect(() => {
    fetchDynamicCategories();
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

  const fetchDynamicCategories = async () => {
    try {
      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const catList = docSnap.data().list || [];
        setCategories(catList.map(cat => ({
          id: cat.toLowerCase(),
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        })));
      }
    } catch (err) {
      console.error("Navbar categories fetch error:", err);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    setShowCatMenu(false);
    setScrolled(window.scrollY > 20);
    setIsFooterOverlap(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTE_MAP.LOGIN);
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const textColor = isFooterOverlap || !showWhiteNav ? 'text-white drop-shadow-sm' : 'text-gray-900';
  const brandColor = isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-primary';
  const hoverColor = showWhiteNav ? 'hover:text-primary' : 'hover:text-white/80';
  const iconColor = isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-gray-600';
  const searchBg = showWhiteNav && !isFooterOverlap 
    ? 'bg-gray-100 border-transparent hover:bg-white' 
    : 'bg-white/20 text-white border-transparent hover:bg-white/30';

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${showWhiteNav ? 'glass-prism glass-prism-navbar py-2' : `${isHome ? 'bg-transparent' : 'bg-primary'} py-4`}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12 md:h-14">
          
          {/* LOGO SECTION - Optimized from Code 2 */}
          <Link to={ROUTE_MAP.HOME} className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src="/artemon_joy_logo.webp" alt="Artemon Joy Logo" className="relative h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 rounded-full object-cover border-2 border-white shadow-sm" />
            </div>
            <span className={`font-brand text-xl sm:text-2xl md:text-3xl tracking-tight transition-colors ${textColor}`}>
              Artemon <span className={brandColor}>Joy</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION - Enhanced from both */}
          <div className="hidden lg:flex space-x-6 lg:space-x-8 items-center">
            {/* Home Link with Code 1's hover animation */}
            <Link to={ROUTE_MAP.HOME} className={`text-sm font-medium transition-colors relative group ${
              location.pathname === ROUTE_MAP.HOME 
                ? 'text-secondary font-extrabold' 
                : `${textColor} ${hoverColor}`
            }`}>
              Home
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                location.pathname === ROUTE_MAP.HOME ? 'w-0' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            
            {/* Enhanced Shop Categories Dropdown from Code 1 */}
            <div className="relative group" onMouseEnter={() => setShowCatMenu(true)} onMouseLeave={() => setShowCatMenu(false)}>
              <Link to={ROUTE_MAP.SHOP} className={`text-sm font-medium transition-colors relative group flex items-center gap-1 ${
                location.pathname === ROUTE_MAP.SHOP 
                  ? 'text-secondary font-extrabold' 
                  : `${textColor} ${hoverColor}`
              }`}>
                Shop <ChevronDown size={14} className={`transition-transform duration-300 ${showCatMenu ? 'rotate-180' : ''}`} />
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                  location.pathname === ROUTE_MAP.SHOP ? 'w-0' : 'w-0 group-hover:w-full'
                }`}></span>
              </Link>
              
              <AnimatePresence>
                {showCatMenu && categories.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full -left-4 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 mt-2 overflow-hidden"
                  >
                    <Link to={ROUTE_MAP.SHOP} className="block px-6 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors">All Toys</Link>
                    <div className="h-[1px] bg-gray-50 my-2 mx-4"></div>
                    {categories.map((cat) => (
                      <Link 
                        key={cat.id} 
                        to={`${ROUTE_MAP.SHOP}?category=${cat.id}`}
                        className="block px-6 py-2.5 text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Trending Link with Code 1's hover animation */}
            <Link to={ROUTE_MAP.TRENDING} className={`text-sm font-medium transition-colors relative group ${
              location.pathname === ROUTE_MAP.TRENDING 
                ? 'text-secondary font-extrabold' 
                : `${textColor} ${hoverColor}`
            }`}>
              Trending
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                location.pathname === ROUTE_MAP.TRENDING ? 'w-0' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            {/* New Arrivals Link with Code 1's hover animation */}
            <Link to={ROUTE_MAP.NEW_ARRIVALS} className={`text-sm font-medium transition-colors relative group ${
              location.pathname === ROUTE_MAP.NEW_ARRIVALS 
                ? 'text-secondary font-extrabold' 
                : `${textColor} ${hoverColor}`
            }`}>
              New Arrivals
              <span className={`absolute -bottom-1 left-0 h-0.5 bg-secondary transition-all duration-300 ${
                location.pathname === ROUTE_MAP.NEW_ARRIVALS ? 'w-0' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
          </div>

          {/* DESKTOP SEARCH - Enhanced from both */}
          <div className={`hidden md:block flex-1 max-w-xs mx-4 ${isSearchPage ? 'invisible' : ''}`}>
            <div onClick={() => navigate(ROUTE_MAP.SEARCH)} className={`relative rounded-full transition-all border cursor-text group tour-target-search ${searchBg}`}>
              <div className={`w-full pl-4 pr-10 py-1.5 rounded-full text-sm select-none ${isFooterOverlap || !showWhiteNav ? 'text-white/70' : 'text-gray-500'}`}>Search toys...</div>
              <div className="absolute right-2 top-1.5 p-0.5">
                <Search className={`w-4 h-4 ${isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-gray-500'}`} />
              </div>
            </div>
          </div>

          {/* DESKTOP USER ACTIONS - Combined best of both */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3 shrink-0">
            {/* AI Chat with "New" badge from Code 1 */}
            <Link to={ROUTE_MAP.AI_CHAT} className={`p-2 rounded-full transition-all relative group tour-target-ai ${iconColor} hover:bg-black/5`}>
              <Sparkles className="h-5 w-5 fill-secondary text-secondary animate-pulse" />
              <span className="absolute -top-1 -right-2 px-1 bg-secondary text-[8px] font-black text-white rounded-md uppercase tracking-tighter">New</span>
            </Link>
            
            {/* Wishlist with Code 2's better badge positioning */}
            <Link to={ROUTE_MAP.FAVORITES} className={`p-2 rounded-full transition-all relative group tour-target-favorites ${iconColor} hover:bg-black/5`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500 text-[9px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            {/* Cart with Code 1's animations and Code 2's positioning */}
            <Link to={ROUTE_MAP.CART} id="cart-icon" className={`p-2 rounded-full transition-all relative group ${iconColor} hover:bg-black/5`}>
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
                      className="absolute top-1.5 right-1.5 h-4 w-4 bg-secondary text-[9px] font-bold text-white flex items-center justify-center rounded-full border-2 border-white shadow-md"
                    >
                      {getCartCount()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
            
            {/* User section with Code 2's truncation and Code 1's admin link */}
            {user ? (
              <div className={`flex items-center gap-2 pl-2 border-l ${showWhiteNav && !isFooterOverlap ? 'border-gray-200' : 'border-white/30'}`}>
                {user.role === 'admin' && (
                  <Link to={ROUTE_MAP.ADMIN} className={`text-sm font-bold hover:underline mr-2 ${textColor}`}>
                    Admin
                  </Link>
                )}
                <Link to={ROUTE_MAP.PROFILE} className={`text-sm font-bold truncate max-w-[80px] ${textColor}`}>
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
                to={ROUTE_MAP.LOGIN} 
                className={`ml-2 font-semibold px-5 py-2 rounded-full text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 ${
                  showWhiteNav && !isFooterOverlap ? 'bg-primary text-white' : 'bg-white text-primary'
                }`}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* MOBILE ACTIONS - Optimized from Code 2 */}
          <div className="md:hidden flex items-center gap-0.5 sm:gap-1 shrink-0">
            <Link to={ROUTE_MAP.AI_CHAT} className={`p-2 rounded-full relative tour-target-ai ${iconColor} active:bg-black/5`}>
              <Sparkles className="h-5 w-5 fill-secondary text-secondary" />
            </Link>
            
            {!isSearchPage && (
              <Link to={ROUTE_MAP.SEARCH} className={`p-2 rounded-full tour-target-search ${iconColor} active:bg-black/5`}>
                <Search className="h-5 w-5" />
              </Link>
            )}
            
            <Link to={ROUTE_MAP.FAVORITES} className={`p-2 rounded-full relative tour-target-favorites ${iconColor} active:bg-black/5`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1 h-3.5 w-3.5 bg-red-500 text-[8px] font-bold text-white flex items-center justify-center rounded-full border border-white">
                  {wishlist.length}
                </span>
              )}
            </Link>
            
            <Link to={ROUTE_MAP.CART} id="cart-icon-mobile" className={`p-2 rounded-full relative ${iconColor} active:bg-black/5`}>
              <ShoppingCart className="h-5 w-5" />
              <AnimatePresence mode="popLayout">
                {getCartCount() > 0 && (
                  <motion.span
                    key={`cart-badge-mobile-${getCartCount()}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1.5 right-1 h-3.5 w-3.5 bg-secondary text-[8px] font-bold text-white flex items-center justify-center rounded-full border border-white"
                  >
                    {getCartCount()}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className={`p-2 ml-1 rounded-md focus:outline-none ${iconColor} active:bg-black/5`}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU - Combined best of both */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="md:hidden bg-white/98 backdrop-blur-md border-t border-gray-100 absolute w-full transition-all duration-300 ease-in-out overflow-hidden shadow-2xl"
          >
            <div className="px-4 py-6 space-y-5">
              {/* AI Assistant - Enhanced from Code 2 */}
              <Link className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/10 text-secondary font-black text-sm uppercase tracking-widest" to={ROUTE_MAP.AI_CHAT}>
                <Sparkles className="h-5 w-5 fill-secondary" />
                AI Assistant
              </Link>
              
              <div className="px-2 space-y-4">
                <Link className="block font-bold text-gray-900 text-lg" to={ROUTE_MAP.HOME}>Home</Link>
                
                {/* Categories - Enhanced from both */}
                <div className="px-2 py-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shop Categories</p>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <Link 
                          key={cat.id} 
                          to={`${ROUTE_MAP.SHOP}?category=${cat.id}`} 
                          className="block p-3 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 active:scale-95 transition-transform active:bg-indigo-50 active:text-indigo-600 border border-transparent active:border-indigo-100"
                        >
                          {cat.label}
                        </Link>
                      ))
                    ) : (
                      // Fallback categories from Code 1
                      ["educational", "creative", "action", "plushies"].map(cat => (
                        <Link 
                          key={cat} 
                          to={`${ROUTE_MAP.SHOP}?category=${cat}`} 
                          className="block p-3 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 capitalize active:scale-95 transition-transform"
                        >
                          {cat}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Other Links - Enhanced from Code 2 */}
                <div className="flex flex-col gap-4 pt-2">
                  <Link className="font-bold text-gray-900" to={ROUTE_MAP.TRENDING}>Trending</Link>
                  <Link className="font-bold text-gray-900" to={ROUTE_MAP.NEW_ARRIVALS}>New Arrivals</Link>
                  <Link className="font-bold text-gray-900" to={ROUTE_MAP.FAVORITES}>My Wishlist ({wishlist.length})</Link>
                </div>
              </div>

              {/* User Section - Enhanced from Code 2 */}
              <div className="border-t border-gray-100 pt-5 px-2">
                {user ? (
                  <div className="space-y-4">
                    {/* User Profile - Enhanced from Code 2 */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{user.displayName || 'User'}</p>
                        <Link to={ROUTE_MAP.PROFILE} className="text-xs font-bold text-indigo-500">
                          View Profile
                        </Link>
                      </div>
                    </div>
                    
                    {/* Admin Link from Code 1 */}
                    {user.role === 'admin' && (
                      <Link to={ROUTE_MAP.ADMIN} className="block w-full text-center py-3 rounded-xl font-black text-xs uppercase tracking-widest bg-gray-900 text-white shadow-lg">
                        Admin Dashboard
                      </Link>
                    )}
                    
                    {/* Logout - Enhanced from Code 2 */}
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-center py-3 rounded-xl font-black text-xs uppercase tracking-widest border-2 border-red-50 text-red-500 active:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    to={ROUTE_MAP.LOGIN} 
                    className="block text-center py-4 rounded-2xl font-black uppercase tracking-[0.1em] bg-primary text-white shadow-xl shadow-indigo-100"
                  >
                    Sign In to Play
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}