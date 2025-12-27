// Filename: src/pages/admin/Reviews.jsx
import { useEffect, useState } from 'react';
import { 
  Star, CheckCircle, XCircle, Trash2, Clock, AlertTriangle,
  MessageSquare, Package, Loader2, ShieldAlert, User as UserPlaceholder
} from 'lucide-react';
import { firestoreService } from '../../services/db';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); 

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getAllAdminReviews();
      setReviews(data || []);
    } catch (err) {
      console.error("Failed to sync cloud reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await firestoreService.updateReviewStatus(id, newStatus);
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error("Cloud status update failed:", err);
      alert("Failed to update review status.");
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("Permanently delete this review?")) return;
    try {
      await firestoreService.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Cloud delete failed:", err);
    }
  };

  const filteredReviews = reviews.filter(rev => 
    filter === 'all' ? true : rev.status === filter
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <span className="bg-green-50 text-green-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 border border-green-100"><CheckCircle className="w-3 h-3" /> Approved</span>;
      case 'rejected': return <span className="bg-red-50 text-red-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 border border-red-100"><XCircle className="w-3 h-3" /> Rejected</span>;
      case 'flagged': return <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 border border-orange-100 animate-pulse"><ShieldAlert className="w-3 h-3" /> AI Flagged</span>;
      default: return <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 border border-amber-100"><Clock className="w-3 h-3" /> Pending</span>;
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-gray-500 font-medium">Moderating Cloud Feedback...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Review Management</h1>
          <p className="text-gray-500 font-medium">Moderate customer feedback with AI assistance.</p>
        </div>

        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          {['all', 'flagged', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                filter === f ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredReviews.length > 0 ? (
          filteredReviews.map((rev) => (
            <div key={rev.id} className={`bg-white rounded-[2rem] p-8 border shadow-sm hover:shadow-xl transition-all ${rev.status === 'flagged' ? 'border-orange-200 bg-orange-50/10' : 'border-gray-100'}`}>
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    {/* User Avatar Logic */}
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm border border-indigo-100 overflow-hidden shrink-0">
                      {rev.user_photo ? (
                        <img 
                          src={rev.user_photo} 
                          alt={rev.user_name || 'User'} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        rev.user_name ? rev.user_name.charAt(0).toUpperCase() : <UserPlaceholder className="w-4 h-4" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-gray-900 leading-tight">{rev.user_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{rev.user_email}</span>
                      </div>
                      <span className="text-gray-200">|</span>
                      {getStatusBadge(rev.status)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <h3 className="font-black text-gray-900 text-lg">{rev.headline}</h3>
                    </div>
                    {/* FIXED: Using rev.comment to match your Firestore schema */}
                    <p className="text-gray-600 text-md leading-relaxed italic">"{rev.comment}"</p>
                  </div>

                  {/* AI Moderation Insights with Flag Reason */}
                  {rev.moderationData && (
                    <div className="mt-4 p-4 bg-white border border-orange-100 rounded-2xl flex items-center gap-3 shadow-sm">
                      <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <p className="font-black text-gray-700 uppercase tracking-wider mb-0.5">AI Analysis</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-gray-500 font-medium">
                            Sentiment Score: <span className={rev.moderationData.sentimentScore < 0 ? 'text-red-500' : 'text-green-500'}>
                              {rev.moderationData.sentimentScore.toFixed(2)}
                            </span> 
                          </p>
                          {rev.moderationData.flaggedReason && (
                            <p className="text-gray-500 font-medium">
                              Reason: <span className="text-orange-600 font-bold">{rev.moderationData.flaggedReason}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] pt-2">
                    <Package className="w-3.5 h-3.5" />
                    <span>ID: #{rev.product_id?.slice(-6).toUpperCase() || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex lg:flex-col items-center justify-end gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-6 lg:pt-0 lg:pl-8">
                  <button 
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    className={`flex-1 lg:w-36 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      rev.status === 'approved' ? 'bg-green-600 text-white cursor-default' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                    }`}
                    disabled={rev.status === 'approved'}
                  >
                    <CheckCircle className="w-4 h-4" /> {rev.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  
                  {rev.status !== 'rejected' && (
                    <button 
                      onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                      className="flex-1 lg:w-36 py-3 bg-gray-50 text-gray-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  )}
                  
                  <button 
                    onClick={() => handleDeleteReview(rev.id)}
                    className="flex-1 lg:w-36 py-3 bg-red-50 text-red-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
            <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-10 h-10 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">No reviews found</h3>
            <p className="text-gray-400 font-medium">Try changing filters or wait for users to leave feedback.</p>
          </div>
        )}
      </div>
    </div>
  );
}