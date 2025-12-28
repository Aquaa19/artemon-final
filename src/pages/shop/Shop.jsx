// Filename: src/pages/shop/Shop.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductList from '../../components/product/ProductList';
import { Filter, Flame, Sparkles, Heart, Search } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { firestoreService } from '../../services/db';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ROUTE_MAP } from '../../App';

export default function Shop({ trendingOnly = false, newArrivalsOnly = false, favoritesOnly = false }) {
  const [products, setProducts] = useState([]);
  // NEW: Dynamic categories state
  const [categories, setCategories] = useState([{ id: 'all', label: 'All Toys' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search');
  
  const { wishlist } = useCart(); 

  useEffect(() => {
    const initShop = async () => {
      setLoading(true);
      // Fetch both products and the dynamic category list
      await Promise.all([fetchProducts(), fetchDynamicCategories()]);
      setLoading(false);
    };

    if (favoritesOnly) {
      setProducts(wishlist);
      fetchDynamicCategories().then(() => setLoading(false));
    } else {
      initShop();
    }
  }, [currentCategory, trendingOnly, newArrivalsOnly, favoritesOnly, wishlist, searchQuery]);

  // NEW: Fetch categories from Firestore settings
  const fetchDynamicCategories = async () => {
    try {
      const docRef = doc(db, "settings", "categories");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const catList = docSnap.data().list || [];
        // Map strings to the format expected by the UI
        const formattedCats = [
          { id: 'all', label: 'All Toys' },
          ...catList.map(cat => ({
            id: cat.toLowerCase(),
            label: cat.charAt(0).toUpperCase() + cat.slice(1) // Capitalize for display
          }))
        ];
        setCategories(formattedCats);
      }
    } catch (err) {
      console.error("Error fetching shop categories:", err);
    }
  };

  const fetchProducts = async () => {
    setError(null);
    try {
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
    }
  };

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
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
              {headerData.icon}
              {headerData.title}
            </h1>
            <p className="text-gray-500 mt-1">{headerData.desc}</p>
          </div>
        </div>

        {/* Dynamic Category Filters */}
        {!trendingOnly && !newArrivalsOnly && !favoritesOnly && !searchQuery && (
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-8 overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-top-2 duration-700">
            <div className="flex space-x-2 min-w-max">
              <div className="flex items-center px-4 text-gray-400 border-r border-gray-100 mr-2">
                <Filter className="w-4 h-4" />
              </div>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSearchParams(cat.id === 'all' ? {} : { category: cat.id })}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 active:scale-95 ${
                    currentCategory === cat.id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                      : 'bg-transparent text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-40 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Updating Collection...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-red-100 shadow-sm animate-in zoom-in-95">
            <p className="text-red-500 font-black uppercase text-xs tracking-widest mb-2">Sync Error</p>
            <p className="text-gray-500 text-sm font-medium">{error}</p>
            <button onClick={fetchProducts} className="mt-6 bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-100 transition-colors">Try Again</button>
          </div>
        ) : products.length === 0 ? (
           <div className="text-center py-40 text-gray-400 animate-in fade-in duration-1000">
             <PackageSearch className="mx-auto w-12 h-12 mb-4 opacity-20" />
             <p className="font-bold">{favoritesOnly ? "Your wishlist is empty!" : searchQuery ? "No items found matching your search." : "No products found in this category."}</p>
             {favoritesOnly && (
               <div className="mt-6">
                 <Link to={ROUTE_MAP.SHOP} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-indigo-100 hover:scale-105 transition-all inline-block">
                   Start Exploring
                 </Link>
               </div>
             )}
           </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ProductList products={products} />
          </div>
        )}
      </div>
    </div>
  );
}

// Minimal internal component for empty state icon
function PackageSearch(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
        <circle cx="18" cy="18" r="3" />
        <path d="m21 21-1.6-1.6" />
      </svg>
    )
}