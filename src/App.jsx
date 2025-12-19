// Filename: src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
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

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Reviews from './pages/admin/Reviews';

// Support Pages
import { TrackOrder, ShippingInfo, Returns, FAQ, Privacy } from './pages/support/SupportPages';

// Components
import ScrollToTop from './components/layout/ScrollToTop';
import ProductQuickViewModal from './components/product/ProductQuickViewModal';
import LoadingScreen from './components/layout/LoadingScreen';
import LoadingScreen2 from './components/layout/LoadingScreen2';

function RouteTransitionHandler({ setLoading }) {
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [location, setLoading]);

  return null; 
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
        const preloadImages = ['/artemon_joy_banner.png', '/artemon_joy_logo.png'];
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
          {/* ADDED FUTURE FLAGS HERE */}
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <RouteTransitionHandler setLoading={setPageLoading} />
            <LoadingManager initialLoad={initialLoad} pageLoading={pageLoading} />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="trending" element={<Shop trendingOnly={true} />} />
                <Route path="new-arrivals" element={<Shop newArrivalsOnly={true} />} />
                <Route path="product/:id" element={<ProductDetail />} />
                <Route path="product/:id/write-review" element={<WriteReview />} />
                <Route path="cart" element={<Cart />} />
                <Route path="favorites" element={<Favorites />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="profile" element={<Profile />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="order-success" element={<OrderSuccess />} />
                <Route path="track-order" element={<TrackOrder />} />
                <Route path="shipping" element={<ShippingInfo />} />
                <Route path="returns" element={<Returns />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="privacy" element={<Privacy />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="orders" element={<Orders />} />
                <Route path="users" element={<Users />} />
                <Route path="reviews" element={<Reviews />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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