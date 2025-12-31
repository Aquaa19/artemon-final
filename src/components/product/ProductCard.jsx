// Filename: src/components/product/ProductCard.jsx
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useProductModal } from '../../context/ProductModalContext';
import { flyToCart } from '../../utils/animations';
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
    navigate(ROUTE_MAP.CHECKOUT);
  };

  const productPath = `/product/${createSlug(product.name)}/${product.id}`;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full active:scale-[0.98] md:active:scale-100"
    >
      {/* Image Container - Optimized Padding for Mobile */}
      <div className="relative aspect-square bg-white overflow-hidden p-3 md:p-4">
        <Link to={productPath} className="block w-full h-full">
          <motion.img 
            layoutId={`product-image-${product.id}`}
            src={product.image || "https://placehold.co/400x400?text=No+Image"} 
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
          />
        </Link>
        
        {/* Trending Badge - Increased legibility */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 flex flex-col gap-2">
           {product.isTrending && (
             <span className="bg-orange-500 text-white text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse uppercase tracking-wider">
               Trending
             </span>
           )}
        </div>

        {/* Action Buttons - FIXED for Mobile visibility */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 flex flex-col gap-2 z-10">
          <button 
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product);
            }}
            className={`p-2 md:p-2.5 rounded-2xl backdrop-blur-md transition-all shadow-md 
              ${isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-red-50 md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0'
              }`}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={handleQuickView}
            className="p-2 md:p-2.5 bg-white/90 text-indigo-600 rounded-2xl shadow-md backdrop-blur-md transition-all md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0 delay-75 hover:bg-indigo-600 hover:text-white"
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Content Section - Responsive Text Sizing */}
      <div className="p-4 md:p-5 flex flex-col flex-grow bg-white">
        <div className="flex items-center justify-between mb-1.5 md:mb-2">
          <span className="text-[9px] md:text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 md:py-1 rounded-lg">
            {product.category}
          </span>
          <div className="flex items-center text-amber-500 text-[10px] md:text-xs font-bold">
            <Star className={`w-3 h-3 md:w-3.5 md:h-3.5 mr-1 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
            {product.rating || "0.0"}
          </div>
        </div>

        <Link to={productPath}>
          <h3 className="text-base md:text-lg font-black text-gray-900 mb-1 md:mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Description - Hidden on very small mobile to save space if needed, otherwise clamped */}
        <p className="text-gray-500 text-xs md:text-sm mb-4 line-clamp-2 flex-grow leading-relaxed">
          {product.description || "A wonderful toy designed to spark joy and imagination."}
        </p>

        {/* Price & Actions - Stacked vs Row optimization */}
        <div className="pt-2 md:pt-4 space-y-3 mt-auto">
          <div className="flex items-center justify-between mb-1 md:mb-2">
            <span className="text-xl md:text-2xl font-black text-gray-900">
              ₹{product.price?.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={onDirectBuy}
              className="shine-effect flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-secondary hover:bg-secondary-hover text-white py-2.5 md:py-3 rounded-2xl font-black text-[11px] md:text-sm transition-all shadow-lg shadow-indigo-100"
            >
              <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" /> Buy Now
            </motion.button>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-1.5 md:gap-2 bg-primary hover:bg-primary-hover text-white py-2.5 md:py-3 rounded-2xl font-black text-[11px] md:text-sm transition-all shadow-lg shadow-indigo-100"
            >
              <ShoppingCart className="w-3.5 h-3.5 md:w-4 md:h-4" /> Add
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}