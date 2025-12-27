// Filename: src/components/product/ProductQuickViewModal.jsx
import { X, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Star, MessageSquare, ThumbsUp, Zap } from 'lucide-react';
import { useProductModal } from '../../context/ProductModalContext';
import { useCart } from '../../context/CartContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flyToCart } from '../../utils/animations';

export default function ProductQuickViewModal() {
  const { modalProduct, closeModal } = useProductModal();
  const { addToCart, toggleWishlist, isInWishlist, handleBuyNow } = useCart();
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  
  useEffect(() => {
    setQuantity(1);
  }, [modalProduct]);

  if (!modalProduct) return null;
  
  const product = modalProduct;
  const isFavorite = isInWishlist(product.id);

  // Helper to create slug for the "Read Full Details" link
  const createSlug = (name) => {
    if (!name) return 'product';
    return name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleAddToCart = (e) => {
    // Trigger physics-based fly animation
    flyToCart(e);
    addToCart(product, quantity);
    // Brief delay before closing to let user see the animation start
    setTimeout(closeModal, 600);
  };

  const onDirectBuy = () => {
    handleBuyNow(product, quantity);
    closeModal();
    navigate(ROUTE_MAP.CHECKOUT);
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
        className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto transform scale-100 transition-transform duration-300 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 lg:p-8 sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-2xl font-black text-gray-900 line-clamp-1">{product.name}</h2>
            <button 
                onClick={closeModal} 
                className="p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-all"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-10">
          
          <div className="flex flex-col gap-6">
            {/* Added 'group' class so flyToCart can find the img */}
            <div className="group relative aspect-square bg-white rounded-[2rem] overflow-hidden border border-gray-100 flex items-center justify-center p-8">
                <img 
                    src={product.image || "https://placehold.co/800x800?text=No+Image"} 
                    alt={product.name}
                    className="max-w-full max-h-full object-contain"
                />
            </div>

            <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Cloud Data Stats</h3>
                <div className="flex justify-between items-center px-2">
                    <div className="flex items-center text-amber-500 font-black text-xl">
                        <Star className={`w-5 h-5 mr-1.5 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
                        {product.rating || "0.0"}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="font-bold text-sm">{product.likes || 0}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="font-bold text-sm">{product.reviewsCount || 0}</span>
                    </div>
                </div>
                
                <Link 
                  to={`/product/${createSlug(product.name)}/${product.id}`} 
                  onClick={closeModal}
                  className="mt-5 text-indigo-600 text-sm font-black hover:underline block text-right"
                >
                    Read Full Reviews & Details →
                </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between py-2">
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
                      {product.category}
                    </span>
                    {product.isTrending && (
                       <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-wider">
                         Trending
                       </span>
                    )}
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
                <p className="text-gray-500 text-md leading-relaxed mb-6">{product.description || "A high-quality toy from our curated cloud collection."}</p>
                
                <div className="mb-8 pb-8 border-b border-gray-100">
                    <span className="text-4xl font-black text-gray-900">₹{product.price?.toLocaleString()}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {[
                        { icon: ShieldCheck, title: "Safety Lab Verified" },
                        { icon: Truck, title: "Standard Delivery" },
                        { icon: RotateCcw, title: "30-Day Returns" },
                        { icon: Star, title: "Official Warranty" }
                    ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
                            <feat.icon className="w-5 h-5 text-indigo-600" />
                            <span className="text-xs font-bold text-gray-700">{feat.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* UPDATED: Dual-Action Buttons */}
            <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex gap-4 items-center">
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-xl transition font-bold text-lg">-</button>
                        <span className="w-10 text-center font-black text-gray-900">{quantity}</span>
                        <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-xl transition font-bold text-lg">+</button>
                    </div>
                    
                    <button 
                        onClick={onDirectBuy}
                        className="shine-effect flex-1 bg-secondary hover:bg-secondary-hover text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 py-4 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Zap className="w-5 h-5 fill-current" /> Buy Now
                    </button>
                    
                    <button 
                        onClick={handleToggleWishlist}
                        className={`p-4 rounded-2xl transition-all shadow-md shrink-0
                            ${isFavorite 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-white border-2 border-gray-100 hover:border-red-200 hover:bg-red-50 hover:text-red-500'
                            }`}
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                <button 
                    onClick={handleAddToCart}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-100 transition-all py-4 flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-5 h-5" /> Add to Cart
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}