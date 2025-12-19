// Filename: src/components/product/ProductCard.jsx
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useProductModal } from '../../context/ProductModalContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const { openModal } = useProductModal();
  const isFavorite = isInWishlist(product.id);

  const handleProductClick = () => {
      openModal(product);
  };

  return (
    <div className="group relative bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-100 flex flex-col h-full">
      
      <div 
          role="button"
          tabIndex={0}
          onClick={handleProductClick} 
          onKeyDown={(e) => { if (e.key === 'Enter') handleProductClick(); }}
          className="cursor-pointer flex flex-col flex-grow"
      >
        
        <div className="relative aspect-square bg-white overflow-hidden p-4">
          <img 
            src={product.image || "https://placehold.co/400x400?text=No+Image"} 
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?auto=format&fit=crop&q=80&w=400"; }}
          />
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
             {product.isTrending && (
               <span className="bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                 Trending
               </span>
             )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm transition-all shadow-sm 
              ${isFavorite 
                ? 'bg-red-50 text-red-500 opacity-100 translate-x-0' 
                : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-red-50 md:opacity-0 md:translate-x-4 md:group-hover:opacity-100 md:group-hover:translate-x-0'
              }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{product.category}</span>
            {/* Modified: Fallback to 0 for production-ready logic */}
            <div className="flex items-center text-amber-500 text-xs font-bold">
              <Star className={`w-3 h-3 mr-1 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
              {product.rating || 0}
            </div>
          </div>

          <h3 className="text-lg font-extrabold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
            {product.description || "A wonderful toy designed to spark joy and imagination."}
          </p>
        </div>
      </div>
      
      <div className="px-5 pb-5 flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <span className="text-2xl font-extrabold text-gray-900">
          ₹{product.price.toFixed(2)}
        </span>
        
        <button 
          onClick={() => addToCart(product)}
          className="shine-effect flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <ShoppingCart className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  );
}