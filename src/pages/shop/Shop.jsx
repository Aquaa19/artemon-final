// Filename: src/pages/shop/Shop.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../../components/product/ProductList';
import { Filter, Flame, Sparkles, Heart, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { firestoreService } from '../../services/db'; // Import the new service

export default function Shop({ trendingOnly = false, newArrivalsOnly = false, favoritesOnly = false }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search');
  
  const { wishlist } = useCart(); 

  useEffect(() => {
    if (favoritesOnly) {
      setProducts(wishlist);
      setLoading(false);
      return; 
    }
    fetchProducts();
  }, [currentCategory, trendingOnly, newArrivalsOnly, favoritesOnly, wishlist, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use firestoreService instead of fetch
      const data = await firestoreService.getProducts({
        category: currentCategory,
        trending: trendingOnly,
        newArrivals: newArrivalsOnly,
        search: searchQuery
      });
      
      setProducts(data || []);
    } catch (err) {
      console.error("Shop Fetch Error:", err);
      setError("Unable to load products from the cloud database.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Toys' },
    { id: 'educational', label: 'Educational' },
    { id: 'creative', label: 'Creative Arts' },
    { id: 'action', label: 'Action Figures' },
    { id: 'plushies', label: 'Plushies' }
  ];

  const getPageHeader = () => {
    if (searchQuery) return { title: `Results for "${searchQuery}"`, icon: <Search className="text-gray-400 w-8 h-8" />, desc: "Here is what we found in our store." };
    if (trendingOnly) return { title: 'Trending Now', icon: <Flame className="text-orange-500 w-8 h-8" />, desc: "The hottest toys everyone is talking about!" };
    if (newArrivalsOnly) return { title: 'Fresh Arrivals', icon: <Sparkles className="text-yellow-400 w-8 h-8" />, desc: "Check out the latest additions to our collection." };
    if (favoritesOnly) return { title: 'My Favorites', icon: <Heart className="text-red-500 w-8 h-8 fill-current" />, desc: "Your personal wishlist of amazing toys." };
    return { title: 'Explore Collection', icon: null, desc: "Find the perfect gift for every age." };
  };

  const headerData = getPageHeader();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              {headerData.icon}
              {headerData.title}
            </h1>
            <p className="text-gray-500 mt-1">{headerData.desc}</p>
          </div>
        </div>

        {/* Category Filters */}
        {!trendingOnly && !newArrivalsOnly && !favoritesOnly && !searchQuery && (
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto">
            <div className="flex space-x-2 min-w-max">
              <div className="flex items-center px-4 text-gray-400"><Filter className="w-5 h-5" /></div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams(cat.id === 'all' ? {} : { category: cat.id })}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    currentCategory === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-xl border border-red-100">
            <p className="text-red-500 font-medium mb-2">Oops! Something went wrong.</p>
            <p className="text-gray-500 text-sm">{error}</p>
            <button onClick={fetchProducts} className="mt-4 text-indigo-600 font-medium hover:underline">Try Again</button>
          </div>
        ) : products.length === 0 ? (
           <div className="text-center py-20 text-gray-500">
             {favoritesOnly ? "You haven't added any favorites yet!" : searchQuery ? "No items found matching your search." : "No products found."}
             {favoritesOnly && <div className="mt-4"><a href="/shop" className="text-primary font-bold hover:underline">Go Shop</a></div>}
           </div>
        ) : (
          <ProductList products={products} />
        )}
      </div>
    </div>
  );
}