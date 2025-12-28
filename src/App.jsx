// Filename: src/App.jsx
import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductModalProvider } from './context/ProductModalContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Home from './pages/shop/Home';
import Shop from './pages/shop/Shop';
import ProductDetail from './pages/shop/ProductDetail';
import WriteReview from './pages/shop/WriteReview'; 
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import OrderSuccess from './pages/shop/OrderSuccess';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Profile from './pages/auth/Profile';
import Favorites from './pages/shop/Favorites';
import SearchPage from './pages/shop/SearchPage';

// AI Pages
const AIChat = lazy(() => import('./pages/shop/AIChat'));
const AIConsole = lazy(() => import('./pages/admin/AIConsole'));

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Reviews from './pages/admin/Reviews';
import Subscribers from './pages/admin/Subscribers';
import ModerationSettings from './pages/admin/ModerationSettings';

// Support Pages
import { 
  TrackOrder, ShippingInfo, Returns, FAQ, Privacy, Terms 
} from './pages/support/SupportPages';

// Components
import ScrollToTop from './components/layout/ScrollToTop';
import ProductQuickViewModal from './components/product/ProductQuickViewModal';
import LoadingScreen from './components/layout/LoadingScreen';
import LoadingScreen2 from './components/layout/LoadingScreen2';

// --- URL OBFUSCATION MAP ---
export const ROUTE_MAP = {
  HOME: '/',
  SHOP: '/S0hPUDI0',
  TRENDING: '/VFJFTkQyNA',
  NEW_ARRIVALS: '/TkVXMjQ',
  CART: '/Q0FSVDI0',
  FAVORITES: '/RkFWMjQ',
  SEARCH: '/U1JDSDI0',
  LOGIN: '/TEdOMjQ',
  REGISTER: '/UkdSMjQ',
  PROFILE: '/UFJGMjQ',
  CHECKOUT: '/Q0hLSDI0',
  SUCCESS: '/U0NTUzI0',
  TRACK: '/VFJLSTIONjQ',
  // ADDED: New obfuscated route for specific order details
  ORDER_DETAILS: '/T1JERFIyNA', 
  ADMIN: '/QURNSTIONjQ',
  AI_CHAT: '/QUlBU1NU',
  AI_CONSOLE: '/QUlDTlNM'
};

// --- ROUTE GUARDS ---
function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to={ROUTE_MAP.SHOP} replace /> : children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to={ROUTE_MAP.LOGIN} replace />;
}

function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/" replace />;
}

function RouteTransitionHandler({ setLoading }) {
  const location = useLocation();
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => { setLoading(false); }, 800);
    return () => clearTimeout(timer);
  }, [location, setLoading]);
  return null; 
}

function AnimatedRoutes({ setPageLoading }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<LoadingScreen2 />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path={ROUTE_MAP.SHOP.substring(1)} element={<Shop />} />
            <Route path={ROUTE_MAP.TRENDING.substring(1)} element={<Shop trendingOnly={true} />} />
            <Route path={ROUTE_MAP.NEW_ARRIVALS.substring(1)} element={<Shop newArrivalsOnly={true} />} />
            <Route path="product/:slug/:id" element={<ProductDetail />} />
            <Route path="product/:slug/:id/write-review" element={<WriteReview />} />
            <Route path={ROUTE_MAP.CART.substring(1)} element={<Cart />} />
            <Route path={ROUTE_MAP.FAVORITES.substring(1)} element={<Favorites />} />
            <Route path={ROUTE_MAP.SEARCH.substring(1)} element={<SearchPage />} />
            <Route path={ROUTE_MAP.LOGIN.substring(1)} element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
            <Route path={ROUTE_MAP.REGISTER.substring(1)} element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
            <Route path={ROUTE_MAP.PROFILE.substring(1)} element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path={ROUTE_MAP.CHECKOUT.substring(1)} element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path={ROUTE_MAP.SUCCESS.substring(1)} element={<OrderSuccess />} />
            
            {/* FIXED: Added TrackOrder route for specific order IDs */}
            <Route path={`${ROUTE_MAP.ORDER_DETAILS.substring(1)}/:orderId`} element={<ProtectedRoute><TrackOrder /></ProtectedRoute>} />
            
            <Route path={ROUTE_MAP.AI_CHAT.substring(1)} element={<ProtectedRoute><AIChat /></ProtectedRoute>} />

            <Route path="track-order" element={<TrackOrder />} />
            <Route path="shipping" element={<ShippingInfo />} />
            <Route path="returns" element={<Returns />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
          </Route>

          <Route path={ROUTE_MAP.ADMIN.substring(1)} element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="ai-console" element={<AIConsole />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="orders" element={<Orders />} />
            <Route path="users" element={<Users />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="subscribers" element={<Subscribers />} />
            <Route path="moderation-settings" element={<ModerationSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

function App() {
  const [initialLoad, setInitialLoad] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  
  useEffect(() => {
    const initApp = async () => {
      try {
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
             const handler = () => {
                window.removeEventListener('load', handler);
                resolve();
             };
             window.addEventListener('load', handler);
             setTimeout(resolve, 3000); 
          });
        }
        const preloadImages = ['/artemon_joy_banner.webp', '/artemon_joy_logo.webp'];
        await Promise.all(preloadImages.map(src => {
          return new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = resolve;
            img.onerror = resolve; 
          });
        }));
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error("Loading error:", err);
      } finally {
        setInitialLoad(false);
      }
    };
    initApp();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ProductModalProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <RouteTransitionHandler setLoading={setPageLoading} />
            <LoadingManager initialLoad={initialLoad} pageLoading={pageLoading} />
            <AnimatedRoutes setPageLoading={setPageLoading} />
            <ProductQuickViewModal />
          </Router>
        </ProductModalProvider>
      </CartProvider>
    </AuthProvider>
  );
}

function LoadingManager({ initialLoad, pageLoading }) {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const showSolidLoader = initialLoad || (pageLoading && isHome);
    const showBlurryLoader = !initialLoad && pageLoading && !isHome;

    if (showSolidLoader) return <div className="fixed inset-0 z-[9999]"><LoadingScreen /></div>;
    if (showBlurryLoader) return <div className="fixed inset-0 z-[9999]"><LoadingScreen2 /></div>;
    return null;
}

export default App;