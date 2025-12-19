// Filename: src/pages/shop/WriteReview.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ArrowLeft, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/db';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function WriteReview() {
  const { id } = useParams(); 
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [headline, setHeadline] = useState('');
  const [body, setBody] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}/write-review` } });
      return;
    }

    const fetchProduct = async () => {
      try {
        const data = await firestoreService.getProductById(id);
        if (data) setProduct(data);
      } catch (err) {
        console.error("Error fetching product for review:", err);
      }
    };
    fetchProduct();
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Save directly to Firestore 'reviews' collection
      await addDoc(collection(db, 'reviews'), {
        product_id: id,
        user_id: user.uid,
        user_email: user.email,
        user_name: user.displayName || user.email.split('@')[0],
        rating: Number(rating),
        headline: headline.trim(),
        body: body.trim(),
        status: 'approved', // Initial status set for immediate visibility
        isVerified: true, 
        createdAt: serverTimestamp() 
      });

      setIsSuccess(true);
      setTimeout(() => navigate(`/product/${id}`), 3000);
    } catch (err) {
      console.error("Review Submission Error:", err);
      setError('Could not save your review to the cloud. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-gray-500 font-medium">Preparing review form...</p>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Review Posted!</h2>
          <p className="text-gray-500 mb-8 font-medium leading-relaxed">
            Thank you for sharing your experience with <strong>{product.name}</strong>. Your feedback helps other parents choose the best toys!
          </p>
          <button 
            onClick={() => navigate(`/product/${id}`)}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all"
          >
            Return to Toy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={`/product/${id}`} className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Review
        </Link>

        <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-gray-100">
          {/* Header Area - background changed to bg-white for blending */}
          <div className="p-8 bg-white border-b border-gray-100 flex items-center gap-6">
            <div className="w-24 h-24 bg-white rounded-2xl border border-gray-100 p-2 flex items-center justify-center shrink-0">
              <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Reviewing Cloud Toy</p>
              <h1 className="text-2xl font-black text-gray-900">{product.name}</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-10">
            {/* Star Rating */}
            <div className="space-y-4 text-center">
              <label className="block text-xl font-black text-gray-900">How would you rate this toy?</label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none transition-transform active:scale-90"
                  >
                    <Star 
                      className={`w-12 h-12 ${
                        star <= (hover || rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-gray-100'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Review Headline</label>
                <input
                  type="text"
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="Summarize your experience..."
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Detailed Review</label>
                <textarea
                  rows="5"
                  required
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What did your child think? Is the quality good?"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold resize-none"
                ></textarea>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-2xl text-sm font-bold animate-pulse">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-xl transition-all ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isSubmitting ? <><Loader2 className="animate-spin" /> Publishing...</> : <><Send className="w-5 h-5" /> Post My Review</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}