// Filename: src/pages/admin/Reviews.jsx
import { useEffect, useState } from 'react';
import { 
  Star, CheckCircle, XCircle, Trash2, Clock, 
  MessageSquare, Filter, ChevronRight 
} from 'lucide-react';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      if (res.ok) setReviews(data.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const filteredReviews = reviews.filter(rev => 
    filter === 'all' ? true : rev.status === filter
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>;
      default: return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-medium">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Review Management</h1>
          <p className="text-gray-500 text-sm">Moderate and verify customer feedback for Artemon Joy.</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-200">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="grid gap-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div key={rev.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                {/* Review Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(rev.status)}
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-bold text-gray-900">{rev.user_name}</span>
                    <span className="text-xs text-gray-400 font-medium">({rev.user_email})</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <h3 className="font-extrabold text-gray-900">{rev.headline}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">"{rev.body}"</p>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold uppercase tracking-wider">
                    <Package className="w-3 h-3" />
                    <span>Product: {rev.product_name}</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>ID: #{rev.product_id}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col items-center justify-end gap-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                  {rev.status !== 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(rev.id, 'approved')}
                      className="flex-1 lg:w-32 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button 
                      onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                      className="flex-1 lg:w-32 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                  <button 
                    onClick={() => handleDeleteReview(rev.id)}
                    className="flex-1 lg:w-32 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-100">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No reviews found</h3>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">Try changing your filters or wait for customers to share their feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}