// Filename: src/pages/shop/SearchPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowUpLeft, Loader2, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { firestoreService } from '../../services/db'; 
// Import the route map from App.jsx
import { ROUTE_MAP } from '../../App';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
    if (user) loadHistory();
  }, [user]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await firestoreService.getSearchHistory(user.uid);
      setHistory(data || []);
    } catch (err) {
      console.error("Cloud History Fetch Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (text) => {
    if (!user || !text.trim()) return;
    try {
      await firestoreService.saveSearchTerm(user.uid, text.trim());
    } catch (err) {
      console.error("Failed to save search to cloud:", err);
    }
  };

  const deleteHistoryItem = async (term, e) => {
    e.stopPropagation();
    try {
      const updatedHistory = history.filter(h => h !== term);
      await firestoreService.updateUserSearchHistory(user.uid, updatedHistory);
      setHistory(updatedHistory);
    } catch (err) {
      console.error("Delete from cloud failed:", err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    saveHistory(query);
    // Updated navigate to use obfuscated SHOP route
    navigate(`${ROUTE_MAP.SHOP}?search=${encodeURIComponent(query)}`);
  };

  const handleHistoryClick = (text) => {
    setQuery(text);
    saveHistory(text); 
    // Updated navigate to use obfuscated SHOP route
    navigate(`${ROUTE_MAP.SHOP}?search=${encodeURIComponent(text)}`);
  };

  return (
    <div className="min-h-screen bg-indigo-50/10 backdrop-blur-xl pt-32 px-4 animate-pop-in">
        <div className="max-w-3xl mx-auto">
            
            <div className="relative flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-3 rounded-2xl bg-white shadow-sm hover:shadow-md text-gray-400 hover:text-indigo-600 transition-all"
                >
                    <ArrowUpLeft className="w-6 h-6" />
                </button>

                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full bg-white text-gray-900 text-lg font-bold placeholder-gray-400 rounded-2xl py-4 pl-14 pr-4 outline-none shadow-xl border-2 border-transparent focus:border-indigo-100 transition-all"
                        placeholder="Search for toys..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                    {query && (
                        <button 
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </form>
            </div>

            <div className="bg-white/80 rounded-[2.5rem] p-8 shadow-sm border border-white backdrop-blur-md">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Recent Searches
                  </h3>
                  {history.length > 0 && (
                    <button 
                      onClick={async () => {
                        await firestoreService.updateUserSearchHistory(user.uid, []);
                        setHistory([]);
                      }}
                      className="text-[10px] font-black text-indigo-500 uppercase hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {user ? (
                    <div className="space-y-1">
                        {loading ? (
                          <div className="flex items-center gap-2 text-gray-400 py-4 font-bold text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" /> Fetching history...
                          </div>
                        ) : history.length === 0 ? (
                            <p className="text-gray-400 text-sm font-bold italic py-4">No recent searches found in the cloud.</p>
                        ) : (
                            history.map((term, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleHistoryClick(term)}
                                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-white hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer group border border-transparent hover:border-indigo-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                                          <Search className="w-4 h-4 text-gray-300 group-hover:text-indigo-500" />
                                        </div>
                                        <span className="text-gray-700 font-bold">{term}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteHistoryItem(term, e)}
                                        className="p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="p-4 bg-gray-50 rounded-full inline-flex mb-4">
                          <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 font-bold mb-6">Sign in to sync your search history across devices.</p>
                        <button 
                            /* Updated navigate to use obfuscated LOGIN route */
                            onClick={() => navigate(ROUTE_MAP.LOGIN)}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
                        >
                            Sign In Now
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}