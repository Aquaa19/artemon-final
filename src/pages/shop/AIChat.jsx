// Filename: src/pages/ai/AIChat.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Trash2, ArrowLeft, Info, MessageSquare, ShoppingBag, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../context/AuthContext';
import AIChatBubble from '../../components/common/AIChatBubble';

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Hello! I'm your Artemon Joy assistant. I can help you find toys, check your recent orders, or suggest gifts. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const functions = getFunctions(undefined, 'asia-south1');

  // Quick Action Suggestions
  const suggestions = [
    { label: "My Orders", icon: ShoppingBag, prompt: "Can you show me the status of my recent orders?" },
    { label: "Favorites", icon: Heart, prompt: "What items are in my wishlist?" },
    { label: "Find Gifts", icon: Sparkles, prompt: "Suggest a toy for a 5-year old under ₹500." }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e, directPrompt = null) => {
    if (e) e.preventDefault();
    const messageText = directPrompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    if (!directPrompt) setInput('');
    setIsLoading(true);

    try {
      const chatWithAI = httpsCallable(functions, 'chatWithAI');
      const chatHistory = messages
        .filter(msg => msg.text && msg.text.trim() !== "")
        .map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const result = await chatWithAI({
        message: messageText,
        chatHistory: chatHistory
      });

      if (result.data) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: result.data.text || "I found some information for you:",
          data: result.data.data 
        }]);
      }
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "I encountered an error. Please try again in a moment.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (window.confirm("Clear your conversation history?")) {
      setMessages([{
        role: 'model',
        text: "Conversation cleared. How else can I assist you?",
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col pt-20">
      
      {/* 1. PREMIUM STICKY HEADER */}
      {/* --- MODERNIZED FLOATING AI HEADER --- */}
<div className="sticky top-20 z-20 px-4 py-4 pointer-events-none">
  <div className="max-w-4xl mx-auto pointer-events-auto">
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_32px_rgba(79,70,229,0.12)] rounded-[2rem] px-4 py-3 flex items-center justify-between"
    >
      {/* Left: Back Navigation */}
      <button 
        onClick={() => navigate(-1)} 
        className="p-3 hover:bg-slate-100 rounded-full transition-all active:scale-90 group"
      >
        <ArrowLeft size={20} className="text-slate-600 group-hover:-translate-x-0.5 transition-transform" />
      </button>
      
      {/* Center: AI Identity Core */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles size={16} className="text-white fill-white animate-pulse" />
            </div>
            {/* Pulsing online ring */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-white"></span>
            </span>
          </div>
          
          <div className="flex flex-col">
            <h1 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">
              Artemon Joy IQ
            </h1>
            <p className="text-[8px] text-indigo-500 font-bold uppercase tracking-[0.25em] mt-1.5 opacity-80">
              Neural Engine v2.0
            </p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={clearChat} 
          className="p-3 hover:bg-red-50 rounded-full transition-all group active:scale-90"
          title="Reset Conversation"
        >
          <Trash2 size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
        </button>
      </div>
    </motion.div>
  </div>
</div>

      {/* 2. CHAT STREAM AREA */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 space-y-2 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.map((msg, index) => (
            <AIChatBubble key={index} message={msg} />
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start mb-6">
              <div className="bg-white border border-gray-100 p-5 rounded-2xl rounded-tl-none shadow-sm flex gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s] [animation-duration:0.8s]"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s] [animation-duration:0.8s]"></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* 3. INPUT COMPONENT & SUGGESTIONS */}
      <div className="bg-white border-t border-gray-100 px-4 pt-4 pb-10 sticky bottom-0">
        <div className="max-w-3xl mx-auto">
          
          {/* Quick Action Suggestions */}
          {!isLoading && messages.length < 3 && (
            <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => handleSendMessage(null, s.prompt)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-full border border-gray-200 hover:border-indigo-200 transition-all text-[11px] font-bold text-gray-500 active:scale-95"
                >
                  <s.icon size={12} /> {s.label}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="relative flex items-center gap-2 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you find joy today?"
              className="w-full bg-gray-50/80 border-none rounded-2xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 transition-all outline-none pr-16 shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 p-3.5 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 hover:scale-105 active:scale-95' 
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              <Send size={18} />
            </button>
          </form>
          
          <div className="flex items-center justify-center gap-2 mt-4">
             <div className="h-[1px] w-8 bg-gray-100"></div>
             <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
               <Sparkles size={10} className="text-indigo-400" /> Powered by Vertex AI
             </p>
             <div className="h-[1px] w-8 bg-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
}