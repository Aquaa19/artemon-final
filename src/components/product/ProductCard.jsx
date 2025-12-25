// Filename: src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useProductModal } from '../../context/ProductModalContext';
import { flyToCart } from '../../utils/animations';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { openModal } = useProductModal();
  const isFavorite = isInWishlist(product.id);

  /**
   * Helper to create a URL-friendly slug from the product name
   * Example: "Brown Teddy Bear" -> "brown-teddy-bear"
   */
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

  // Descriptive URL structure: /product/slug-name/id
  const productPath = `/product/${createSlug(product.name)}/${product.id}`;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full"
    >
      
      {/* Product Image Container */}
      <div className="relative aspect-square bg-white overflow-hidden p-4">
        <Link to={productPath} className="block w-full h-full">
          <motion.img 
            layoutId={`product-image-${product.id}`}
            src={product.image || "https://placehold.co/400x400?text=No+Image"} 
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=400"; 
            }}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
           {product.isTrending && (
             <span className="bg-orange-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm animate-pulse uppercase tracking-wider">
               Trending
             </span>
           )}
        </div>

        {/* Action Buttons Overlay */}
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

      {/* Product Info Area */}
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

        <div className="pt-4 flex items-center justify-between mt-auto">
          <span className="text-2xl font-black text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={handleAddToCart}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100"
          >
            <ShoppingCart className="w-4 h-4" /> Add
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}