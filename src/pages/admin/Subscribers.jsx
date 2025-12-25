// Filename: src/pages/shop/Subscribers.jsx
import { useState, useEffect } from 'react';
import { 
  Mail, Send, Trash2, Search, Loader2, Users, 
  Calendar, Megaphone, X, Sparkles, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import { firestoreService } from '../../services/db';
import { motion, AnimatePresence } from 'framer-motion';

export default function Subscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Broadcast Modal States
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState('idle'); // idle, sending, finished
  const [message, setMessage] = useState({ subject: '', body: '' });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const data = await firestoreService.getAllSubscribers();
      setSubscribers(data);
    } catch (err) {
      console.error("Error loading subscribers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this subscriber?")) return;
    try {
      await firestoreService.deleteSubscriber(id);
      setSubscribers(subscribers.filter(s => s.id !== id));
    } catch (err) {
      alert("Failed to delete subscriber.");
    }
  };

  const handleBulkPush = async (e) => {
    e.preventDefault();
    if (subscribers.length === 0) return;
    
    setPushStatus('sending');
    
    try {
      // Initialize the Cloud Function reference
      const pushNewsletter = httpsCallable(functions, 'pushNewsletter');
      
      // Execute the call to asia-south1
      await pushNewsletter({ 
        subject: message.subject, 
        content: message.body 
      });
      
      setPushStatus('finished');
      
      // Reset the modal and form after a success delay
      setTimeout(() => {
        setIsPushing(false);
        setPushStatus('idle');
        setMessage({ subject: '', body: '' });
      }, 2500);

    } catch (err) {
      console.error("Bulk push failed:", err);
      // Informative error message for the Admin
      alert(`Broadcast failed: ${err.message || "Please check your Firebase Blaze limits."}`);
      setPushStatus('idle');
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
       <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
       <p className="text-gray-500 font-medium">Syncing Subscriber Database...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with Broadcast Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Newsletter Community</h1>
          <p className="text-gray-500 font-medium">Manage your {subscribers.length} loyal dreamers</p>
        </div>
        
        <button 
          onClick={() => setIsPushing(true)}
          className="flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          <Megaphone className="w-5 h-5" /> Push All Updates
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Growth Rate</p>
            <p className="text-2xl font-black text-gray-800">+{subscribers.length} Total</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 flex items-center gap-4 shadow-sm">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Calendar className="w-6 h-6"/></div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Last Activity</p>
            <p className="text-2xl font-black text-gray-800">
              {subscribers[0]?.subscribedAt?.toDate ? subscribers[0].subscribedAt.toDate().toLocaleDateString('en-GB') : 'Syncing...'}
            </p>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/30">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by email..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {filteredSubscribers.length} results
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Subscriber Email</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Joined On</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence>
                {filteredSubscribers.map((sub) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={sub.id} 
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-gray-700">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-gray-500">
                        {sub.subscribedAt?.toDate 
                          ? sub.subscribedAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) 
                          : 'Recent'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(sub.id)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          
          {filteredSubscribers.length === 0 && (
            <div className="p-20 text-center">
              <div className="inline-flex p-6 bg-gray-50 text-gray-300 rounded-full mb-4">
                <Search className="w-10 h-10" />
              </div>
              <p className="font-bold text-gray-400">No subscribers found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Modal Overlay */}
      <AnimatePresence>
        {isPushing && (
          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Sparkles className="absolute -top-10 -right-10 w-40 h-40 text-indigo-50 opacity-50" />

              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-black text-gray-900 mb-2">Broadcast Update</h2>
                    <p className="text-gray-500 font-medium">
                      Reaching <span className="text-indigo-600 font-bold">{subscribers.length} subscribers</span>.
                    </p>
                  </div>
                  <button onClick={() => setIsPushing(false)} className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {pushStatus === 'finished' ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="inline-flex p-5 bg-green-50 text-green-500 rounded-full animate-bounce">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">Broadcast Sent!</h3>
                    <p className="text-gray-500 font-medium">The updates are now reaching your community.</p>
                  </div>
                ) : (
                  <form onSubmit={handleBulkPush} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Email Subject</label>
                      <input 
                        required
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700"
                        placeholder="e.g., New Toys Available! 🧸"
                        value={message.subject}
                        onChange={(e) => setMessage({...message, subject: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Message Content</label>
                      <textarea 
                        required
                        rows="6"
                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-indigo-600 font-bold text-gray-700 resize-none"
                        placeholder="Share the magical news..."
                        value={message.body}
                        onChange={(e) => setMessage({...message, body: e.target.value})}
                      />
                    </div>

                    <div className="flex items-center gap-4 pt-4">
                      <button 
                        disabled={pushStatus === 'sending'}
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50"
                      >
                        {pushStatus === 'sending' ? (
                          <><Loader2 className="animate-spin w-5 h-5" /> Dispatching Emails...</>
                        ) : (
                          <><Send className="w-5 h-5" /> Dispatch Broadcast</>
                        )}
                      </button>
                    </div>
                    
                    <p className="flex items-center justify-center gap-2 text-[10px] text-amber-500 font-black uppercase tracking-wider mt-4">
                      <AlertTriangle className="w-3 h-3" /> Note: This sends a real email to all subscribers.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}