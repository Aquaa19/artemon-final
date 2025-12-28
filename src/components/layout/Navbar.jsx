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
  // NEW: Dynamic categories state from Code 1
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

  // NEW: Fetch categories from Firestore settings document (from Code 1)
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
    <nav className={`fixed w-full top-0 z-50 transition-all duration-500 ${showWhiteNav ? 'glass-prism py-2' : `${isHome ? 'bg-transparent' : 'bg-primary'} py-5`}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link to={ROUTE_MAP.HOME} className="flex items-center gap-2 group shrink-0">
            <div className="relative">
              <div className="absolute inset-0 bg-primary rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img src="/artemon_joy_logo.webp" alt="Artemon Joy" className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-sm" />
            </div>
            <span className={`font-bold text-lg sm:text-xl tracking-tight transition-colors ${textColor}`}>
              Artemon <span className={brandColor}>Joy</span>
            </span>
          </Link>

          <div className="hidden lg:flex space-x-6 lg:space-x-8 items-center">
            {/* Home Link with improved hover effect from Code 2 */}
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
            
            {/* ENHANCED: Dropdown for Shop Categories from Code 1 */}
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
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full -left-4 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 mt-2 overflow-hidden"
                  >
                    <Link to={ROUTE_MAP.SHOP} className="block px-6 py-2 text-xs font-black uppercase text-gray-400 hover:text-primary transition-colors">All Toys</Link>
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

            {/* Trending Link with improved hover effect from Code 2 */}
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

            {/* New Arrivals Link with improved hover effect from Code 2 */}
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

          <div className={`hidden md:block flex-1 max-w-xs mx-4 ${isSearchPage ? 'invisible' : ''}`}>
            <div onClick={() => navigate(ROUTE_MAP.SEARCH)} className={`relative rounded-full transition-all border cursor-text group tour-target-search ${searchBg}`}>
              <div className={`w-full pl-4 pr-10 py-1.5 rounded-full text-sm select-none ${isFooterOverlap || !showWhiteNav ? 'text-white/70' : 'text-gray-500'}`}>Search toys...</div>
              <div className="absolute right-2 top-1.5 p-0.5"><Search className={`w-4 h-4 ${isFooterOverlap || !showWhiteNav ? 'text-white' : 'text-gray-500'}`} /></div>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link to={ROUTE_MAP.AI_CHAT} className={`p-2 rounded-full transition-all relative group tour-target-ai ${iconColor} hover:bg-black/5`}>
              <Sparkles className="h-5 w-5 fill-secondary text-secondary animate-pulse" />
              <span className="absolute -top-1 -right-2 px-1 bg-secondary text-[8px] font-black text-white rounded-md uppercase tracking-tighter">New</span>
            </Link>
            
            <Link to={ROUTE_MAP.FAVORITES} className={`p-2 rounded-full transition-all relative group tour-target-favorites ${iconColor} hover:bg-black/5`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-sm">{wishlist.length}</span>}
            </Link>
            
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
                      className="absolute top-0 right-0 h-4 w-4 bg-secondary text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-md"
                    >
                      {getCartCount()}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
            
            {user ? (
              <div className={`flex items-center gap-2 pl-2 border-l ${showWhiteNav && !isFooterOverlap ? 'border-gray-200' : 'border-white/30'}`}>
                {user.role === 'admin' && <Link to={ROUTE_MAP.ADMIN} className={`text-sm font-bold hover:underline mr-2 ${textColor}`}>Admin</Link>}
                <Link to={ROUTE_MAP.PROFILE} className={`text-sm font-medium hover:underline ${textColor}`}>{user.displayName?.split(' ')[0] || 'Account'}</Link>
                <button onClick={handleLogout} className={`p-2 rounded-full hover:text-red-500 transition-colors ${iconColor}`}><LogOut className="h-4 w-4" /></button>
              </div>
            ) : (
              <Link to={ROUTE_MAP.LOGIN} className={`ml-2 font-semibold px-5 py-2 rounded-full text-sm shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95 ${
                showWhiteNav && !isFooterOverlap ? 'bg-primary text-white' : 'bg-white text-primary'
              }`}>Sign In</Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-3">
            <Link to={ROUTE_MAP.AI_CHAT} className={`relative p-1 ${iconColor}`}>
              <Sparkles className="h-6 w-6 fill-secondary text-secondary" />
            </Link>
            
            {!isSearchPage && <Link to={ROUTE_MAP.SEARCH} className={`p-1 rounded-full tour-target-search ${iconColor}`}><Search className="h-6 w-6" /></Link>}
            
            <Link to={ROUTE_MAP.FAVORITES} className={`relative tour-target-favorites ${iconColor}`}>
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full shadow-sm">{wishlist.length}</span>}
            </Link>
            
            <Link to={ROUTE_MAP.CART} id="cart-icon-mobile" className={`relative ${iconColor}`}>
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
            
            <button onClick={() => setIsOpen(!isOpen)} className={`p-1 rounded-md focus:outline-none ${iconColor}`}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - UPDATED with enhanced animation and fallback categories */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }} 
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-100 absolute w-full transition-all duration-300 ease-in-out overflow-hidden shadow-xl"
          >
            <div className="px-4 py-6 space-y-4">
              <Link className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary/10 text-secondary font-black" to={ROUTE_MAP.AI_CHAT}>
                <Sparkles className="h-5 w-5 fill-secondary" />
                AI Assistant
              </Link>
              
              <Link className="block px-4 py-2 font-bold text-gray-900" to={ROUTE_MAP.HOME}>Home</Link>
              
              <div className="px-4 py-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Shop Categories</p>
                <div className="grid grid-cols-2 gap-2">
                  {categories.length > 0 ? (
                    categories.map(cat => (
                      <Link key={cat.id} to={`${ROUTE_MAP.SHOP}?category=${cat.id}`} className="block p-3 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 active:scale-95 transition-transform">
                        {cat.label}
                      </Link>
                    ))
                  ) : (
                    // FIXED: Fallback now matches your base Firestore categories
                    ["educational", "creative", "action", "plushies"].map(cat => (
                      <Link key={cat} to={`${ROUTE_MAP.SHOP}?category=${cat}`} className="block p-3 rounded-xl bg-gray-50 text-sm font-bold text-gray-600 capitalize active:scale-95 transition-transform">
                        {cat}
                      </Link>
                    ))
                  )}
                </div>
              </div>
              
              <Link className="block px-4 py-2 rounded-lg text-gray-900 font-bold" to={ROUTE_MAP.TRENDING}>Trending</Link>
              <Link className="block px-4 py-2 rounded-lg text-gray-900 font-bold" to={ROUTE_MAP.NEW_ARRIVALS}>New Arrivals</Link>

              <div className="border-t border-gray-100 pt-4 px-4">
                {user ? (
                  <div className="space-y-4">
                    <Link to={ROUTE_MAP.PROFILE} className="block font-bold text-gray-600">My Profile</Link>
                    {user.role === 'admin' && <Link to={ROUTE_MAP.ADMIN} className="block font-bold text-primary">Admin Dashboard</Link>}
                    <button onClick={handleLogout} className="w-full text-left font-bold text-red-500">Sign Out</button>
                  </div>
                ) : (
                  <Link to={ROUTE_MAP.LOGIN} className="block text-center py-4 rounded-2xl font-black bg-primary text-white">Sign In</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}