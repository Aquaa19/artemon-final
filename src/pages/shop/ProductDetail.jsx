// Filename: src/pages/shop/ProductDetail.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, ShoppingCart, Star, User, BadgeCheck 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const reviewsRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prodRes = await fetch(`/api/products/${id}`);
        const prodData = await prodRes.json();
        
        if (prodRes.ok && prodData.data) {
          setProduct(prodData.data);
          
          try {
            const revRes = await fetch(`/api/products/${id}/reviews`);
            const revData = await revRes.json();
            setReviews(revData.data || []);
          } catch (revErr) {
            console.error("Reviews fetch failed:", revErr);
          }
        }
      } catch (err) {
        console.error("Product fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddToCart = () => {
    if (product) addToCart(product, quantity);
  };
  
  const scrollToReviews = () => reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary"></div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-4">
      <div className="text-gray-400 text-xl font-bold">Product not found</div>
      <Link to="/shop" className="text-primary hover:underline">Return to Shop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface-muted pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/shop" className="inline-flex items-center text-gray-500 hover:text-primary mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collection
        </Link>

        <div className="bg-white rounded-[2.5rem] p-6 lg:p-10 shadow-sm border border-gray-100 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
          {/* Left: Image */}
          <div className="relative aspect-square bg-gray-50 rounded-3xl overflow-hidden border border-gray-100 group">
            <img 
              src={product.image || "https://placehold.co/600x600?text=No+Image"} 
              alt={product.name}
              className="w-full h-full object-contain p-8 transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-center">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">{product.category}</span>
              <div className="flex items-center text-amber-500 text-sm font-bold">
                <Star className={`w-4 h-4 mr-1 ${product.rating > 0 ? 'fill-current' : ''}`} /> 
                {product.rating || "0.0"}
                <span className="text-gray-400 font-medium ml-1">({product.reviewCount || 0} Reviews)</span>
              </div>
              <button onClick={scrollToReviews} className="text-primary text-xs font-bold hover:underline">Read Full Reviews →</button>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">{product.description}</p>
            <div className="mb-8"><span className="text-4xl font-extrabold text-gray-900">₹{product.price?.toFixed(2)}</span></div>

            <div className="flex gap-4 mb-10">
              <div className="flex items-center bg-gray-100 rounded-xl p-1">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold">-</button>
                <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-white rounded-lg transition font-bold">+</button>
              </div>
              <button onClick={handleAddToCart} className="shine-effect flex-1 bg-primary text-white font-bold text-lg rounded-xl shadow-lg flex items-center justify-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-gray-100">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Customer Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="space-y-8">
              {reviews.map((rev) => (
                <div key={rev.id} className="pb-8 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-100 p-2 rounded-full"><User className="w-5 h-5 text-gray-400" /></div>
                      <span className="font-bold text-gray-900">{rev.user_name}</span>
                      {/* Verified Purchase Badge */}
                      {rev.isVerified === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-600 text-[10px] font-bold border border-green-100 uppercase tracking-tighter">
                          <BadgeCheck className="w-3 h-3" /> Verified Purchase
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="font-extrabold text-gray-900">{rev.headline}</span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{rev.body}</p>
                </div>
              ))}
              <div className="pt-4">
                <Link to={`/product/${product.id}/write-review`} className="bg-primary text-white px-6 py-2 rounded-xl font-bold">Write a Review</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-6">No reviews yet. Be the first to share your experience!</p>
              <Link to={`/product/${product.id}/write-review`} className="bg-primary text-white px-8 py-3 rounded-xl font-bold">Write a Review</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}