// Filename: src/components/product/ProductCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useProductModal } from '../../context/ProductModalContext';
import { flyToCart } from '../../utils/animations';
// IMPORT the route map to use obfuscated paths
import { ROUTE_MAP } from '../../App';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist, handleBuyNow } = useCart();
  const { openModal } = useProductModal();
  const navigate = useNavigate();
  const isFavorite = isInWishlist(product.id);

  const createSlug = (name) => {
    if (!name) return 'product';
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    openModal(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    flyToCart(e); 
    addToCart(product);
  };

  const onDirectBuy = (e) => {
    e.preventDefault();
    handleBuyNow(product, 1);
    // FIXED: Use the obfuscated path from ROUTE_MAP instead of '/checkout'
    navigate(ROUTE_MAP.CHECKOUT);
  };

  const productPath = `/product/${createSlug(product.name)}/${product.id}`;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      <div className="relative aspect-square bg-white overflow-hidden p-4">
        <Link to={productPath} className="block w-full h-full">
          <motion.img 
            layoutId={`product-image-${product.id}`}
            src={product.image || "https://placehold.co/400x400?text=No+Image"} 
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.isTrending && (
             <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm animate-pulse uppercase tracking-wider">
               Trending
             </span>
           )}
        </div>

        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md 
              ${isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0'
              }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleQuickView}
            className="p-2.5 bg-white/90 text-indigo-600 rounded-2xl shadow-md backdrop-blur-md md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 transition-all delay-75 hover:bg-indigo-600 hover:text-white"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded-lg">
            {product.category}
          </span>
          <div className="flex items-center text-amber-500 text-xs font-bold">
            <Star className={`w-3.5 h-3.5 mr-1 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
            {product.rating || "0.0"}
          </div>
        </div>

        <Link to={productPath}>
          <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description || "A wonderful toy designed to spark joy and imagination."}
        </p>

        <div className="pt-4 space-y-3 mt-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-black text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={onDirectBuy}
              className="shine-effect flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary-hover text-white py-3 rounded-2xl font-black text-sm transition-all shadow-lg"
            >
              <Zap className="w-4 h-4 fill-current" /> Buy Now
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3 rounded-2xl font-black text-sm transition-all shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" /> Add
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}