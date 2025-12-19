// Filename: src/components/product/ProductQuickViewModal.jsx
import { X, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { useProductModal } from '../../context/ProductModalContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ProductQuickViewModal() {
  const { modalProduct, closeModal } = useProductModal();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  
  useEffect(() => {
    setQuantity(1);
  }, [modalProduct]);

  if (!modalProduct) return null;
  
  const product = modalProduct;
  const isFavorite = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    closeModal();
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={closeModal}
    >
      <div 
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 lg:p-6 sticky top-0 bg-white z-10 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 line-clamp-1">{product.name}</h2>
            <button 
                onClick={closeModal} 
                className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-10">
          
          <div className="flex flex-col gap-6">
            <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
                <img 
                    src={product.image || "https://placehold.co/800x800?text=No+Image"} 
                    alt={product.name}
                    className="w-full h-full object-contain p-6"
                />
            </div>

            {/* Production-Ready Community Activity */}
            <div className="bg-gray-50 p-4 rounded-2xl shadow-inner border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Live Stats</h3>
                <div className="flex justify-between items-center">
                    <div className="flex items-center text-amber-500 font-extrabold text-xl">
                        <Star className={`w-5 h-5 mr-1 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
                        {product.rating || 0}
                    </div>

                    <div className="flex items-center gap-1 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-bold text-sm">{product.likes || 0}</span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold text-sm">{product.commentsCount || 0}</span>
                    </div>
                </div>
                {/* Close modal when navigating to full detail page */}
                <Link 
                  to={`/product/${product.id}`} 
                  onClick={closeModal}
                  className="mt-4 text-primary text-sm font-bold hover:underline block text-right"
                >
                    Read Full Reviews →
                </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">{product.category}</span>
                </div>
                
                <p className="text-gray-500 text-md leading-relaxed mb-6">{product.description || "A wonderful toy designed to spark joy."}</p>
                
                <div className="mb-6 border-b border-gray-100 pb-6">
                    <span className="text-4xl font-extrabold text-gray-900">₹{product.price.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                        { icon: ShieldCheck, title: "Safety Certified" },
                        { icon: Truck, title: "Standard Delivery" },
                        { icon: RotateCcw, title: "30-Day Returns" },
                        { icon: Star, title: "Brand Warranty" }
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-transparent hover:border-gray-200 transition-colors">
                            <feat.icon className="w-5 h-5 text-primary" />
                            <span className="text-sm font-semibold text-gray-700">{feat.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-4 items-center pt-4 border-t border-gray-100">
                <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold">-</button>
                    <span className="w-10 text-center font-bold text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold">+</button>
                </div>
                
                <button 
                    onClick={handleAddToCart}
                    className="shine-effect flex-1 bg-primary hover:bg-primary-hover text-white font-bold text-lg rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 py-3"
                >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
                
                <button 
                    onClick={handleToggleWishlist}
                    className={`p-3 rounded-xl transition-all shadow-md shrink-0
                        ${isFavorite 
                        ? 'bg-red-500 text-white hover:bg-red-600' 
                        : 'border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}