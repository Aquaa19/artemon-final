// Filename: src/pages/shop/Favorites.jsx
import { Heart, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';
import { Link } from 'react-router-dom';
// Import the route map from App.jsx
import { ROUTE_MAP } from '../../App';

export default function Favorites() {
  const { user } = useAuth();
  const { wishlist, wishlistLoading } = useCart();
  
  if (wishlistLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-12 min-h-screen">
        <div className="flex items-center justify-center h-64 text-gray-500">Loading Favorites...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 min-h-screen pt-28">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-red-100 text-red-600 rounded-xl">
          <Heart className="w-8 h-8 fill-red-600" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Your Wishlist</h1>
          <p className="text-gray-500">{wishlist.length} item{wishlist.length !== 1 ? 's' : ''} saved for later.</p>
        </div>
      </div>

      {/* --- GUEST WARNING --- */}
      {!user && wishlist.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-4 mb-8 rounded-lg flex items-center gap-3 shadow-md">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <p className="text-sm font-medium">
            Sign in to save your favorites permanently.
            {/* Updated Link to use ROUTE_MAP.LOGIN */}
            <Link to={ROUTE_MAP.LOGIN} className="font-bold text-amber-700 hover:underline ml-2">Sign In</Link>
          </p>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl shadow-soft">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">Your wishlist is empty!</h2>
          <p className="text-gray-500 mt-2">Find something you love and save it here.</p>
          {/* Updated Link to use ROUTE_MAP.SHOP */}
          <Link to={ROUTE_MAP.SHOP} className="mt-6 inline-flex items-center bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-md">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlist.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}