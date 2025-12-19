// Filename: src/pages/shop/WriteReview.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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
    // Redirect if not logged in
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}/write-review` } });
      return;
    }

    // Fetch product info to show what they are reviewing
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.data) setProduct(data.data);
      })
      .catch(err => console.error("Error fetching product:", err));
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
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: id,
          user_email: user.email,
          user_name: user.displayName,
          rating,
          headline,
          body
        })
      });

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => navigate(`/product/${id}`), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit review.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-xl border border-gray-100 max-w-md w-full text-center">
          <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Review Submitted!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Thank you for sharing your thoughts. Your review is being moderated and will appear on the site shortly.
          </p>
          <button 
            onClick={() => navigate(`/product/${id}`)}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20"
          >
            Back to Product
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted pt-28 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        <Link to={`/product/${id}`} className="inline-flex items-center text-gray-500 hover:text-primary mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Cancel Review
        </Link>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100">
          {/* Product Header */}
          <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-6">
            <img src={product.image} alt={product.name} className="w-20 h-20 object-contain bg-white rounded-xl border border-gray-200" />
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Reviewing</p>
              <h1 className="text-xl font-extrabold text-gray-900">{product.name}</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-8">
            {/* Rating Selector */}
            <div className="space-y-4">
              <label className="block text-lg font-bold text-gray-900">How would you rate it?</label>
              <div className="flex gap-2">
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
                      className={`w-10 h-10 ${
                        star <= (hover || rating) 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-gray-200'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm font-bold text-amber-600">
                  {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
                </p>
              )}
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <label htmlFor="headline" className="block text-sm font-bold text-gray-700">Add a headline</label>
              <input
                id="headline"
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="What's most important to know?"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label htmlFor="body" className="block text-sm font-bold text-gray-700">Written review</label>
              <textarea
                id="body"
                rows="5"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What did you like or dislike? How was the quality?"
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl text-sm font-bold">
                <AlertCircle className="w-5 h-5" /> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-2xl font-extrabold text-white flex items-center justify-center gap-3 shadow-lg transition-all ${
                isSubmitting ? 'bg-gray-400' : 'bg-primary hover:scale-[1.02] active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? 'Submitting...' : <><Send className="w-5 h-5" /> Submit Review</>}
            </button>

            <p className="text-center text-xs text-gray-400 font-medium">
              By submitting, you agree to our community guidelines and moderation policy.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}