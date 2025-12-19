// Filename: src/pages/shop/SearchPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, ArrowUpLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/search/history/${user.email}`);
      const json = await res.json();
      setHistory(json.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const saveHistory = async (text) => {
    if (!user || !text.trim()) return;
    try {
      await fetch('/api/search/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, query: text })
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHistoryItem = async (id, e) => {
    e.stopPropagation();
    try {
        await fetch(`/api/search/history/${id}`, { method: 'DELETE' });
        setHistory(prev => prev.filter(h => h.id !== id));
    } catch (e) { console.error(e); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    saveHistory(query);
    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  const handleHistoryClick = (text) => {
    setQuery(text);
    saveHistory(text); // Updates timestamp/order
    navigate(`/shop?search=${encodeURIComponent(text)}`);
  };

  return (
    // UPDATED PADDING: increased to pt-32 for better separation from Navbar
    <div className="min-h-screen bg-primary/5 backdrop-blur-xl pt-32 px-4 animate-pop-in">
        <div className="max-w-3xl mx-auto">
            
            {/* Header / Input Area */}
            <div className="relative flex items-center gap-4 mb-8">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-2 rounded-full bg-white/50 hover:bg-white text-gray-600 transition-all shadow-sm"
                >
                    <ArrowUpLeft className="w-6 h-6" />
                </button>

                <form onSubmit={handleSearch} className="flex-1 relative group">
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="w-full bg-white/60 hover:bg-white/80 focus:bg-white text-gray-900 text-lg placeholder-gray-500 rounded-2xl py-4 pl-12 pr-4 outline-none shadow-lg border-2 border-transparent focus:border-primary/30 transition-all"
                        placeholder="Search for toys..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-4.5 w-6 h-6 text-gray-400 group-focus-within:text-primary transition-colors" />
                    {query && (
                        <button 
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-4.5 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </form>
            </div>

            {/* History Section */}
            <div className="bg-white/40 rounded-3xl p-6 shadow-sm border border-white/50 backdrop-blur-md">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Recent Searches
                </h3>

                {user ? (
                    <div className="space-y-2">
                        {history.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No recent searches found.</p>
                        ) : (
                            history.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => handleHistoryClick(item.query)}
                                    className="flex items-center justify-between p-3 rounded-xl hover:bg-white/80 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Search className="w-4 h-4 text-gray-400" />
                                        <span className="text-gray-700 font-medium">{item.query}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => deleteHistoryItem(item.id, e)}
                                        className="p-1.5 rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">Sign in to see your search history.</p>
                        <button 
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary-hover transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                )}
            </div>

        </div>
    </div>
  );
}