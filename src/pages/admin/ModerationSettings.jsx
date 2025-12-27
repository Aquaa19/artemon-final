// Filename: src/pages/admin/ModerationSettings.jsx
import { useEffect, useState } from 'react';
import { 
  ShieldCheck, Save, Plus, X, AlertCircle, 
  Loader2, CheckCircle2, Info, Trash2
} from 'lucide-react';
import { firestoreService } from '../../services/db';

export default function ModerationSettings() {
  const [bannedWords, setBannedWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load existing settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const words = await firestoreService.getModerationSettings();
      setBannedWords(words || []);
    } catch (err) {
      console.error("Failed to load moderation settings:", err);
      setMessage({ type: 'error', text: 'Could not fetch settings from the cloud.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddWord = (e) => {
    e.preventDefault();
    const word = newWord.trim().toLowerCase();
    if (!word) return;
    
    if (bannedWords.includes(word)) {
      setMessage({ type: 'error', text: 'This word is already in your restricted list.' });
      return;
    }

    setBannedWords(prev => [...prev, word]);
    setNewWord('');
    setMessage({ type: '', text: '' });
  };

  const handleRemoveWord = (wordToRemove) => {
    setBannedWords(prev => prev.filter(w => w !== wordToRemove));
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await firestoreService.updateModerationSettings(bannedWords);
      setMessage({ type: 'success', text: 'Moderation engine updated successfully! Changes are live.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error("Save failed:", err);
      setMessage({ type: 'error', text: 'Failed to sync settings to the cloud.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
      <p className="text-gray-500 font-medium">Loading Moderation Engine...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 relative overflow-hidden">
        <ShieldCheck className="absolute -top-6 -right-6 w-32 h-32 text-indigo-50 opacity-50" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Moderation AI Control</h1>
          <p className="text-gray-500 font-medium max-w-2xl">
            Configure the automated guardrails for your marketplace. Reviews are flagged if they contain 
            specific keywords or exhibit a sentiment score lower than <span className="text-red-500 font-bold">-0.60</span>.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="font-black text-gray-800 uppercase tracking-widest text-xs">Restricted Keywords</h2>
          </div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
            {bannedWords.length} Words Active
          </span>
        </div>

        <div className="p-10 space-y-8">
          {/* Add Word Input */}
          <form onSubmit={handleAddWord} className="flex gap-4">
            <input 
              type="text" 
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="Enter a word to restrict (e.g. 'scam', 'fake')..."
              className="flex-1 px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 outline-none transition-all font-bold"
            />
            <button 
              type="submit"
              className="px-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all flex items-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Plus className="w-5 h-5" /> Add
            </button>
          </form>

          {/* Word Tags Container */}
          <div className="min-h-[200px] p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            {bannedWords.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-gray-400">
                <Info className="w-8 h-8 mb-2 opacity-20" />
                <p className="font-bold italic">No words restricted yet. Your AI is relying solely on sentiment analysis.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {bannedWords.map((word) => (
                  <div 
                    key={word} 
                    className="group bg-white border border-gray-200 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-sm hover:border-red-200 transition-all"
                  >
                    <span className="font-bold text-gray-700">{word}</span>
                    <button 
                      onClick={() => handleRemoveWord(word)}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {message.text && (
            <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-fade-in ${
              message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium italic">
              * Click "Save Changes" to sync this list with the Cloud Moderation Function.
            </p>
            <button 
              onClick={handleSaveSettings}
              disabled={saving}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-10 py-4 rounded-2xl font-black transition-all disabled:bg-gray-400 shadow-xl"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}