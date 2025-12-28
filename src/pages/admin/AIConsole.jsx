// Filename: src/pages/admin/AIConsole.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Sparkles, Trash2, BarChart3, AlertTriangle, 
  PackageSearch, RefreshCw, Info, Cpu, Database, 
  ShieldCheck, Zap, Activity
} from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import AIChatBubble from '../../components/common/AIChatBubble';

export default function AIConsole() {
  const [messages, setMessages] = useState([
    {
      role: 'model',
      text: "Artemon Joy Intelligence initialized. Global systems at 100% capacity. How can I assist your business strategy today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);
  
  const functions = getFunctions(undefined, 'asia-south1');

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
        chatHistory: chatHistory,
        isAdmin: true 
      });

      if (result.data) {
        setMessages(prev => [...prev, {
          role: 'model',
          text: result.data.text || "Report generated:",
          data: result.data.data 
        }]);
      }
    } catch (error) {
      console.error("Admin AI Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        text: "System fault detected in global analytics sync.",
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const actions = [
    { label: "Performance", icon: BarChart3, prompt: "Give me a summary of today's sales and total revenue.", color: "text-blue-500" },
    { label: "Inventory", icon: AlertTriangle, prompt: "Which products have a stock count lower than 10?", color: "text-orange-500" },
    { label: "Operations", icon: PackageSearch, prompt: "Show me the last 5 orders across the platform.", color: "text-emerald-500" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50/50 rounded-[2.5rem] overflow-hidden border border-white shadow-2xl">
      
      {/* 1. ULTRA-MODERN HEADER */}
      <div className="bg-white/60 backdrop-blur-xl border-b border-slate-100 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Cpu className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Intelligence Console <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">v2.0</span>
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Vertex AI Node: asia-south1 Online</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* CHAT STREAM */}
        <div className="flex-1 flex flex-col bg-white/40">
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-8 py-10 space-y-6 scroll-smooth">
            {messages.map((msg, index) => (
              <AIChatBubble key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-indigo-600/5 p-4 rounded-2xl rounded-tl-none border border-indigo-100 flex gap-2">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-6 bg-white border-t border-slate-100">
            <div className="max-w-4xl mx-auto relative group">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <div className="absolute left-5 text-indigo-600 opacity-50 group-focus-within:opacity-100 transition-opacity">
                  <Zap size={18} />
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Execute global data query..."
                  className="w-full bg-slate-50 border-none focus:ring-2 focus:ring-indigo-500/10 rounded-[1.5rem] pl-12 pr-20 py-5 text-sm font-bold placeholder:text-slate-400 transition-all outline-none shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 p-4 rounded-[1.1rem] transition-all ${
                    input.trim() && !isLoading 
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 active:scale-95' 
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="w-[340px] bg-slate-50/80 backdrop-blur-md border-l border-slate-100 p-8 space-y-8 hidden xl:block overflow-y-auto">
          
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Action Matrix</h3>
            <div className="grid grid-cols-1 gap-3">
              {actions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSendMessage(null, action.prompt)}
                  className="group flex items-center justify-between p-4 bg-white hover:bg-indigo-600 rounded-2xl transition-all border border-slate-100 shadow-sm hover:shadow-indigo-100 active:scale-95"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-slate-50 group-hover:bg-white/20 transition-colors`}>
                      <action.icon size={18} className={`${action.color} group-hover:text-white`} />
                    </div>
                    <span className="text-xs font-black text-slate-600 group-hover:text-white">{action.label}</span>
                  </div>
                  <Zap size={14} className="text-slate-300 group-hover:text-white" />
                </button>
              ))}
            </div>
          </section>

          {/* UPDATED: Engine Status section now uses white text exclusively */}
          <section className="bg-indigo-600 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700 text-white">
               <Cpu size={120} />
            </div>
            <h3 className="font-black text-sm flex items-center gap-2 mb-3 text-white">
              <Activity size={18} className="text-white" /> Engine Status
            </h3>
            <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-center text-[10px] font-black text-white">
                <span className="opacity-80 uppercase tracking-widest">Data Pipeline</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white border border-white/10">SECURE</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-black text-white">
                <span className="opacity-80 uppercase tracking-widest">Gemini Model</span>
                <span className="bg-white/20 px-2 py-0.5 rounded text-white border border-white/10">2.0 FLASH</span>
              </div>
              <p className="text-[10px] leading-relaxed opacity-90 font-medium text-white/90">
                Connected to cross-collection Firestore index. Predictive analytics enabled for current session.
              </p>
            </div>
          </section>

          <div className="p-5 border border-amber-100 bg-amber-50/50 rounded-3xl">
            <div className="flex items-center gap-2 mb-2 text-amber-700 font-black text-[10px] uppercase tracking-widest">
              <ShieldCheck size={14} /> Security Wall
            </div>
            <p className="text-[10px] text-amber-600/80 leading-relaxed font-medium">
              Sensitive financial data is masked in logs. Internal audit trail active for this session.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}