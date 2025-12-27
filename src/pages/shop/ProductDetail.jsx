// Filename: src/pages/shop/ProductDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Star, User, BadgeCheck, Loader2, AlertCircle, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { firestoreService } from '../../services/db';
import { flyToCart } from '../../utils/animations';
import { ROUTE_MAP } from '../../App';

export default function ProductDetail() {
  const { slug, id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, handleBuyNow } = useCart();
  const navigate = useNavigate();
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const prodData = await firestoreService.getProductById(id);

        if (prodData) {
          setProduct(prodData);
          try {
            const revData = await firestoreService.getProductReviews(id);
            setReviews(revData || []);
          } catch (revErr) {
            console.error("Reviews fetch failed:", revErr);
          }
        }
      } catch (err) {
        console.error("Main Cloud Fetch Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  const handleAddToCart = (e) => {
    if (product) {
      flyToCart(e);
      addToCart(product, quantity);
    }
  };

  const onDirectBuy = () => {
    if (product) {
      handleBuyNow(product, quantity);
      navigate(ROUTE_MAP.CHECKOUT);
    }
  };
  
  const scrollToReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 w-12 h-12" />
      <p className="text-gray-500 font-medium">Loading toy details...</p>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-6 bg-gray-50">
      <div className="p-4 bg-red-50 text-red-600 rounded-full">
        <AlertCircle className="w-12 h-12" />
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-gray-900">Toy not found</h2>
        <p className="text-gray-500 mt-1">This product might have been moved or deleted from our cloud store.</p>
      </div>
      <Link to="/shop" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all">
        Return to Shop
      </Link>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 pt-24 pb-12"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>

        <div className="bg-white rounded-[3rem] p-6 lg:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          
          <div className="relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 group flex items-center justify-center p-8">
            <motion.img 
              layoutId={`product-image-${product.id}`}
              src={product.image || "https://placehold.co/600x600?text=No+Image"} 
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center text-amber-500 text-sm font-bold">
                <Star className={`w-4 h-4 mr-1 ${reviews.length > 0 ? 'fill-current' : ''}`} /> 
                {reviews.length > 0 
                  ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                  : "0.0"}
                <span className="text-gray-400 font-medium ml-1">({reviews.length} Reviews)</span>
              </div>
              <button onClick={scrollToReviews} className="text-indigo-600 text-xs font-bold hover:underline">Read Full Reviews →</button>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{product.description}</p>
            
            <div className="mb-8">
              <span className="text-4xl font-black text-gray-900">₹{product.price?.toLocaleString()}</span>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex gap-4">
                <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-xl transition font-bold text-xl">-</button>
                  <span className="w-10 text-center font-black text-gray-900 text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 flex items-center justify-center text-gray-600 hover:bg-white rounded-xl transition font-bold text-xl">+</button>
                </div>
                
                <button 
                  onClick={onDirectBuy}
                  className="shine-effect flex-1 bg-secondary text-white font-black text-lg rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-secondary-hover hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Zap className="w-6 h-6 fill-current" /> Buy Now
                </button>
              </div>

              <button 
                onClick={handleAddToCart} 
                className="w-full bg-primary text-white font-black text-lg rounded-2xl shadow-xl shadow-primary/10 py-4 flex items-center justify-center gap-2 hover:bg-primary-hover transition-all"
              >
                <ShoppingCart className="w-6 h-6" /> Add to Cart
              </button>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="bg-white rounded-[3rem] p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-gray-900">Customer Reviews</h2>
            <Link 
              to={`/product/${slug}/${id}/write-review`} 
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold hover:bg-indigo-100 transition-colors"
            >
              Write a Review
            </Link>
          </div>
          
          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((rev) => (
                <div key={rev.id} className="pb-8 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2.5 rounded-2xl">
                        {rev.user_photo ? (
                          <img src={rev.user_photo} className="w-6 h-6 rounded-full object-cover" alt="" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{rev.user_name}</p>
                        {rev.isVerified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-green-600 uppercase tracking-wider">
                            <BadgeCheck className="w-3 h-3" /> Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">
                      {rev.createdAt?.toDate 
                        ? rev.createdAt.toDate().toLocaleDateString() 
                        : new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="font-black text-gray-900">{rev.headline}</span>
                  </div>
                  {/* FIXED: Using rev.comment to match updated schema */}
                  <p className="text-gray-600 leading-relaxed text-md">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full inline-flex mb-4 shadow-sm text-gray-300">
                <Star className="w-8 h-8" />
              </div>
              <p className="text-gray-500 font-bold text-lg mb-6">No reviews yet for this cloud-based toy.</p>
              <Link 
                to={`/product/${slug}/${id}/write-review`} 
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
              >
                Be the first to review!
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}